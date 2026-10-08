import React, { useState } from "@rbxts/react";
import { Alert, Chip, EmptyListHint, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Mark {
	id: string;
	label: string;
	color: "default" | "primary" | "success" | "error";
	note: string;
}

interface MarkChipProps {
	label: string;
	color?: Mark["color"];
	selected?: boolean;
	onActivated?: () => void;
}

const MarkChip = Chip as unknown as (props: MarkChipProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const MARKS: Mark[] = [
	{ id: "lamp", label: "Lit", color: "success", note: "Cove lamp is lit" },
	{ id: "line", label: "Due", color: "default", note: "Pier line is due" },
	{ id: "key", label: "Out", color: "error", note: "Gate key is out" },
	{ id: "door", label: "Held", color: "primary", note: "Shed door is held" },
];

function Marks(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [current, setCurrent] = useState(MARKS[0].id);
	let picked = MARKS[0];
	for (const mark of MARKS) {
		if (mark.id === current) picked = mark;
	}

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Marks unavailable" message="The desk could not open these marks." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="row" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="text" width={72} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No mark is posted." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Stack direction={narrow ? "column" : "row"} gap={1} sx={STACK}>
					{MARKS.map((mark) => (
						<MarkChip
							key={mark.id}
							label={mark.label}
							color={mark.color}
							selected={mark.id === current}
							onActivated={() => setCurrent(mark.id)}
						/>
					))}
				</Stack>
				<Typography text={picked.note} sx={SHRINK} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Marks" variant="h5" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Marks",
	description: "Status marks in plain, primary, success, and error.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Marks {...args} />,
};
