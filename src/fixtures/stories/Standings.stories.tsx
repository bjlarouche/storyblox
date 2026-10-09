import React, { useState } from "@rbxts/react";
import {
	Alert,
	Chip,
	Drawer,
	EmptyListHint,
	ScrollView,
	Skeleton,
	Sparkline,
	Stack,
	Table,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Rider {
	id: string;
	name: string;
	score: number;
	delta: number;
	form: number[];
	note: string;
}

interface Board {
	id: string;
	label: string;
	riders: Rider[];
}

const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const VIEWER = "ivo";

const BOARDS: Board[] = [
	{
		id: "cove",
		label: "Cove",
		riders: [
			{ id: "mara", name: "Mara Voss", score: 128, delta: 6, form: [98, 104, 110, 118, 122, 128], note: "Led the week from the second walk." },
			{ id: "owen", name: "Owen Pell", score: 121, delta: 2, form: [110, 112, 116, 119, 120, 121], note: "Held a steady line along the pier." },
			{ id: "ivo", name: "Ivo Lane", score: 117, delta: -1, form: [120, 119, 118, 118, 117, 117], note: "Slipped one place after a short day." },
			{ id: "rae", name: "Rae Quinn", score: 109, delta: 4, form: [90, 94, 99, 102, 106, 109], note: "Climbed through the middle of the board." },
			{ id: "len", name: "Len Harth", score: 98, delta: 0, form: [97, 99, 98, 98, 97, 98], note: "Stayed on the same mark all week." },
			{ id: "desk", name: "Desk notes", score: 91, delta: -3, form: [100, 98, 96, 94, 92, 91], note: "Gave up a few points on the last two days." },
		],
	},
	{
		id: "gate",
		label: "Gate",
		riders: [
			{ id: "rae", name: "Rae Quinn", score: 86, delta: 5, form: [70, 74, 77, 80, 83, 86], note: "Opened the week at the gate and kept it." },
			{ id: "ivo", name: "Ivo Lane", score: 80, delta: 1, form: [74, 75, 76, 78, 79, 80], note: "A small gain, still second." },
			{ id: "mara", name: "Mara Voss", score: 74, delta: -2, form: [80, 79, 78, 76, 75, 74], note: "Dropped after missing one evening." },
			{ id: "owen", name: "Owen Pell", score: 70, delta: 3, form: [60, 62, 64, 66, 68, 70], note: "Added a little each day." },
			{ id: "desk", name: "Desk notes", score: 61, delta: 0, form: [61, 60, 62, 61, 61, 61], note: "Flat across the six days." },
			{ id: "len", name: "Len Harth", score: 54, delta: -4, form: [64, 62, 60, 58, 56, 54], note: "The cord week did not suit the walk." },
		],
	},
	{
		id: "ridge",
		label: "Ridge",
		riders: [
			{ id: "owen", name: "Owen Pell", score: 44, delta: 2, form: [36, 38, 39, 41, 43, 44], note: "First to the last visible post." },
			{ id: "desk", name: "Desk notes", score: 41, delta: 1, form: [36, 37, 38, 39, 40, 41], note: "One point up from the start." },
			{ id: "len", name: "Len Harth", score: 38, delta: 0, form: [38, 37, 39, 38, 38, 38], note: "Turned back at the same stone." },
			{ id: "ivo", name: "Ivo Lane", score: 36, delta: -2, form: [40, 39, 38, 37, 36, 36], note: "Lost the wind on the second climb." },
			{ id: "mara", name: "Mara Voss", score: 33, delta: 4, form: [22, 25, 27, 29, 31, 33], note: "Came up from the bottom of the ridge." },
			{ id: "rae", name: "Rae Quinn", score: 29, delta: -1, form: [32, 31, 31, 30, 29, 29], note: "Stopped one post early." },
		],
	},
];

function findBoard(id: string) {
	for (const board of BOARDS) if (board.id === id) return board;
	return undefined;
}

function viewerIndex(riders: Rider[]) {
	for (let index = 0; index < riders.size(); index++) if (riders[index].id === VIEWER) return index;
	return undefined;
}

function deltaText(value: number) {
	if (value > 0) return `+${value}`;
	return `${value}`;
}

function NameCell(props: { name: string; you: boolean }) {
	return (
		<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} VerticalAlignment={Enum.VerticalAlignment.Center} Padding={new UDim(0, 6)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Typography text={props.name} noWrap sx={SHRINK} />
			{props.you ? <Chip label="You" size="small" color="primary" /> : undefined}
		</frame>
	);
}

function DeltaCell(props: { value: number }) {
	const color = props.value > 0 ? "primary" : props.value < 0 ? "error" : "textSecondary";
	return <Typography text={deltaText(props.value)} color={color} align="right" sx={{ ...SHRINK, ...STACK }} />;
}

function Standings(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [boardId, setBoardId] = useState(BOARDS[0].id);
	const [openId, setOpenId] = useState<string | undefined>(undefined);
	const board = findBoard(boardId);
	const riders = board !== undefined ? board.riders : [];
	const marked = viewerIndex(riders);
	let opened: Rider | undefined;
	for (const rider of riders) if (rider.id === openId) opened = rider;
	const sparkWidth = narrow ? 64 : 112;

	const columns = [
		{ header: "#", width: narrow ? 0.12 : 0.08 },
		{ header: "Name", flex: 2 },
		{ header: "Score", width: narrow ? 0.18 : 0.12, align: "right" as const },
		{ header: "+/-", width: narrow ? 0.14 : 0.1, align: "right" as const },
		{ header: "Form", width: narrow ? 0.22 : 0.18 },
	];
	const rows = riders.map((rider, index) => [
		`${index + 1}`,
		<NameCell name={rider.name} you={rider.id === VIEWER} />,
		`${rider.score}`,
		<DeltaCell value={rider.delta} />,
		<Sparkline values={rider.form} width={sparkWidth} height={narrow ? 22 : 28} />,
	]);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Board unavailable" message="The desk could not open this board." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3, 4].map((value) => (
					<Skeleton key={value} variant="text" width={narrow ? 300 : 640} height={18} />
				))}
			</Stack>
		) : phase === "empty" || riders.size() === 0 ? (
			<EmptyListHint text="No one on this board." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Typography text="Standings" variant="h5" sx={SHRINK} />
				<Stack direction="row" gap={1} wrap sx={STACK}>
					{BOARDS.map((item) => (
						<Chip
							key={item.id}
							label={item.label}
							variant={item.id === boardId ? "filled" : "outlined"}
							color={item.id === boardId ? "primary" : "default"}
							onActivated={() => {
								setBoardId(item.id);
								setOpenId(undefined);
							}}
						/>
					))}
				</Stack>
				<Table columns={columns} rows={rows} selected={marked} dense={narrow} onRowActivated={(index) => setOpenId(riders[index].id)} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<Drawer open={opened !== undefined} edge="right" width={narrow ? 320 : 400} onClose={() => setOpenId(undefined)}>
				{opened !== undefined ? (
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography text={opened.name} variant="h6" sx={SHRINK} />
						{opened.id === VIEWER ? <Chip label="You" size="small" color="primary" /> : undefined}
						<Typography text={`Place ${placeOf(riders, opened.id)}`} sx={SHRINK} />
						<Typography text={`Score ${opened.score}`} sx={SHRINK} />
						<Typography text={`Change ${deltaText(opened.delta)}`} color={opened.delta < 0 ? "error" : "textSecondary"} sx={SHRINK} />
						<Sparkline values={opened.form} width={narrow ? 240 : 280} height={48} />
						<Typography text={opened.note} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y, ZIndex: 1 }} />
					</Stack>
				) : undefined}
			</Drawer>
		</frame>
	);
}

function placeOf(riders: Rider[], id: string) {
	for (let index = 0; index < riders.size(); index++) if (riders[index].id === id) return index + 1;
	return 0;
}

export default {
	title: "Scenarios/Standings",
	description: "A ranked board with the viewer's row marked.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Standings {...args} />,
};
