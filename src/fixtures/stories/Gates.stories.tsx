import React, { useState } from "@rbxts/react";
import { Alert, EmptyListHint, ListItem, ScrollView, Skeleton, Stack, Switch, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Gate {
	id: string;
	name: string;
	note: string;
}

interface RowProps {
	text: string;
	secondary?: string;
	trailing?: React.ReactNode;
	sx?: { Size: UDim2; AutomaticSize: Enum.AutomaticSize };
}

const Row = ListItem as unknown as (props: RowProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const ROW = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const GATES: Gate[] = [
	{ id: "cove", name: "Cove gate", note: "Faces the water" },
	{ id: "pier", name: "Pier gate", note: "Faces the line" },
	{ id: "shed", name: "Shed door", note: "Faces the lane" },
];

function Gates(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [open, setOpen] = useState<Record<string, boolean>>({ cove: true, pier: false, shed: false });

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Gates unavailable" message="The desk could not open this row." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No gate is posted." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				{GATES.map((gate) => (
					<Row
						key={gate.id}
						text={gate.name}
						secondary={gate.note}
						sx={ROW}
						trailing={
							<Switch
								value={open[gate.id] === true}
								onChange={(value) => setOpen({ ...open, [gate.id]: value })}
							/>
						}
					/>
				))}
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Gates" variant="h5" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Gates",
	description: "A gate row with the switch on the far side.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Gates {...args} />,
};
