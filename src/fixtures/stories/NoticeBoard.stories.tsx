import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Button,
	Card,
	Chip,
	Drawer,
	EmptyListHint,
	ScrollView,
	Skeleton,
	Snackbar,
	Stack,
	ToastVariants,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Note {
	id: string;
	title: string;
	body: string;
	posted: string;
	tag: string;
	author: string;
}

interface LabelProps {
	text?: string;
	wrap?: boolean;
	sx?: { fontSize?: number; TextColor3?: Color3 };
}

interface NoteCardProps {
	title?: string;
	subtitle?: string;
	fullWidth?: boolean;
	children?: React.ReactNode;
}

interface CopyProps {
	text: string;
	onCopy?: (text: string) => void;
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const NoteCard = Card as unknown as (props: NoteCardProps) => React.Element;
const Copy = (Uiblox as unknown as { CopyButton: (props: CopyProps) => React.Element }).CopyButton;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const FILTERS = ["All", "Shore", "Gate", "Ridge", "Desk"];

const NOTES: Note[] = [
	{
		id: "lamp",
		title: "Cove lamp is lit",
		body: "The lamp by the bench came on before dusk. Leave it until the path back to the gate is empty, then shut it and note the hour.",
		posted: "6 Oct, 18:30",
		tag: "Shore",
		author: "Mara Voss",
	},
	{
		id: "gate",
		title: "Gate shuts at dusk",
		body: "The field gate closes when the light drops. Wait on the cove side if you are still out. Do not prop it.",
		posted: "6 Oct, 17:00",
		tag: "Gate",
		author: "Owen Pell",
	},
	{
		id: "pier",
		title: "Pier boards are wet",
		body: "The last post on the pier is slick after the shower. Use the rail on the way back. The crab stayed on the wet line.",
		posted: "7 Oct, 8:00",
		tag: "Shore",
		author: "Ivo Lane",
	},
	{
		id: "ridge",
		title: "Ridge post still visible",
		body: "The last post you can see is the mark. Turn back there. The stone and the lizard are not part of the walk.",
		posted: "7 Oct, 10:15",
		tag: "Ridge",
		author: "Rae Quinn",
	},
	{
		id: "count",
		title: "Desk count is short",
		body: "Two crates were still out when the sheet was filed. Recount them on the dock before the water covers the marks.",
		posted: "6 Oct, 9:00",
		tag: "Desk",
		author: "Desk notes",
	},
	{
		id: "bench",
		title: "Bench left as found",
		body: "The cove bench was clear at noon. Nothing was left on it. The heron was still in the shallows.",
		posted: "8 Oct, 12:00",
		tag: "Shore",
		author: "Len Harth",
	},
];

function findNote(id: string) {
	for (const note of NOTES) if (note.id === id) return note;
	return undefined;
}

function NoticeBoard(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [filter, setFilter] = useState("All");
	const [openId, setOpenId] = useState<string | undefined>(undefined);
	const [notice, setNotice] = useState("");
	const columns = narrow ? 1 : 3;
	const shown: Note[] = [];
	for (const note of NOTES) if (filter === "All" || note.tag === filter) shown.push(note);
	const opened = openId !== undefined ? findNote(openId) : undefined;
	const copy = (note: Note) => setNotice(`Copied ${note.title}`);

	const board = (
		<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Wraps
				Padding={new UDim(0, 12)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{shown.map((note) => (
				<frame
					key={note.id}
					Size={new UDim2(1 / columns, narrow ? 0 : -8, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					<NoteCard title={note.title} subtitle={note.posted} fullWidth>
						<Stack direction="column" gap={1} sx={STACK}>
							<Label text={note.body} wrap />
							<Stack direction="row" gap={1} sx={STACK}>
								<Button text="Read" size="small" variant="text" onLeftClick={() => setOpenId(note.id)} />
								<Copy text={note.body} onCopy={() => copy(note)} />
							</Stack>
						</Stack>
					</NoteCard>
				</frame>
			))}
		</frame>
	);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Board unavailable" message="The desk could not open these notes." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((value) => (
					<Skeleton key={value} variant="rectangular" width={narrow ? 340 : 320} height={96} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No notes posted." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Label text="Notice board" sx={{ fontSize: 28 }} />
				<Stack direction="row" gap={1} wrap sx={STACK}>
					{FILTERS.map((tag) => (
						<Chip
							key={tag}
							label={tag}
							variant={filter === tag ? "filled" : "outlined"}
							color={filter === tag ? "primary" : "default"}
							onActivated={() => setFilter(tag)}
						/>
					))}
				</Stack>
				{shown.size() === 0 ? <EmptyListHint text="No notes for that filter." height={72} /> : board}
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<Drawer open={opened !== undefined} edge="right" width={narrow ? 320 : 420} onClose={() => setOpenId(undefined)}>
				{opened !== undefined ? (
					<Stack direction="column" gap={1} sx={STACK}>
						<Label text={opened.title} sx={{ fontSize: 22 }} />
						<Label text={opened.posted} sx={{ TextColor3: theme.palette.text.secondary }} />
						<Label text={opened.author} sx={{ TextColor3: theme.palette.text.secondary }} />
						<Label text={opened.body} wrap />
						<Copy text={opened.body} onCopy={() => copy(opened)} />
					</Stack>
				) : undefined}
			</Drawer>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Notice Board",
	description: "Posted notes with a copy action.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <NoticeBoard {...args} />,
};
