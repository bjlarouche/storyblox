import React, { useState } from "@rbxts/react";
import { Alert, EmptyListHint, ScrollView, Skeleton, Stack, Tabs, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Bay {
	id: string;
	label: string;
	note: string;
}

const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const BAYS: Bay[] = [
	{ id: "cove", label: "Cove", note: "Lamp checked" },
	{ id: "pier", label: "Pier", note: "Line is clear" },
	{ id: "gate", label: "Gate", note: "Shut for the hour" },
	{ id: "shed", label: "Shed", note: "Quiet" },
	{ id: "ridge", label: "Ridge", note: "Path is dry" },
	{ id: "wharf", label: "Wharf", note: "Coil is stowed" },
	{ id: "lane", label: "Lane", note: "Open until dusk" },
	{ id: "dock", label: "Dock", note: "Hold is empty" },
];

function noteFor(id: string) {
	for (const bay of BAYS) {
		if (bay.id === id) return bay.note;
	}
	return "";
}

function Bays(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [bay, setBay] = useState(BAYS[BAYS.size() - 1].id);

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Bays unavailable" message="The desk could not open this row." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No bay is open." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Tabs
					value={bay}
					onChange={setBay}
					options={BAYS.map((item) => ({ label: item.label, value: item.id }))}
				/>
				<Typography text={noteFor(bay)} sx={SHRINK} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Bays" variant="h5" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Bays",
	description: "A long bay row that keeps the selected tab in view.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Bays {...args} />,
};
