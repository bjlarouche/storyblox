import React, { useState } from "@rbxts/react";
import {
	Alert,
	Button,
	Drawer,
	EmptyListHint,
	ScrollView,
	Skeleton,
	Stack,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Line {
	id: string;
	name: string;
	price: number;
	count: number;
}

interface SheetProps {
	open: boolean;
	edge?: "left" | "right" | "bottom";
	height?: number;
	onClose: () => void;
	children?: React.ReactNode;
}

const Sheet = Drawer as unknown as (props: SheetProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const SEED: Line[] = [
	{ id: "roll", name: "Salt roll", price: 2, count: 0 },
	{ id: "stew", name: "Pier stew", price: 4, count: 0 },
	{ id: "loaf", name: "Gate loaf", price: 3, count: 0 },
	{ id: "tea", name: "Desk tea", price: 1, count: 0 },
];

function tally(lines: Line[]) {
	let count = 0;
	let total = 0;
	for (const line of lines) {
		count += line.count;
		total += line.count * line.price;
	}
	return { count, total };
}

function Chit(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [lines, setLines] = useState(SEED);
	const [open, setOpen] = useState(false);
	const [sent, setSent] = useState(false);
	const sum = tally(lines);

	const add = (id: string) => {
		setSent(false);
		setLines(
			lines.map((line) => {
				if (line.id !== id) return line;
				return { ...line, count: line.count + 1 };
			}),
		);
	};

	const board = (
		<Stack direction="column" gap={1} sx={STACK}>
			{lines.map((line) => (
				<Stack key={line.id} direction="row" gap={1} alignItems="center" sx={STACK}>
					<Typography text={line.name} sx={SHRINK} />
					<Typography text={`${line.count}`} color="textSecondary" sx={SHRINK} />
					<Button text="Add" size="small" variant="outlined" onLeftClick={() => add(line.id)} />
				</Stack>
			))}
			<Button text="Review" size="small" variant="contained" disabled={sum.count <= 0} onLeftClick={() => setOpen(true)} />
			{sent ? <Typography text="Chit sent" color="primary" sx={SHRINK} /> : undefined}
		</Stack>
	);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Counter unavailable" message="The desk could not open this chit." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="Nothing is on the board." height={72} />
		) : (
			board
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Chit" variant="h5" sx={SHRINK} />
					{body}
				</Stack>
			</ScrollView>
			<Sheet open={open} edge="bottom" height={narrow ? 280 : 320} onClose={() => setOpen(false)}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Review" variant="h6" sx={SHRINK} />
					{lines.map((line) =>
						line.count > 0 ? (
							<Typography key={line.id} text={`${line.name} ${line.count}`} sx={SHRINK} />
						) : undefined,
					)}
					<Typography text={`Total ${sum.total}`} sx={SHRINK} />
					<Button
						text="Send"
						size="small"
						variant="contained"
						onLeftClick={() => {
							setSent(true);
							setOpen(false);
						}}
					/>
				</Stack>
			</Sheet>
		</frame>
	);
}

export default {
	title: "Scenarios/Chit",
	description: "A short board reviewed from a bottom sheet.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Chit {...args} />,
};
