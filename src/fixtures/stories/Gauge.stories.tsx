import React from "@rbxts/react";
import { Alert, EmptyListHint, ScrollView, Skeleton, Slider, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface GaugeProps {
	value: number;
	min: number;
	max: number;
	format?: (value: number) => string;
	onChange: (value: number) => void;
}

const Gauge = Slider as unknown as (props: GaugeProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

function reading(depth: number) {
	if (depth === 0) return "Below the mark";
	return `${depth} ft`;
}

function GaugeStory(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [depth, setDepth] = React.useState(0);

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Ridge unavailable" message="The ridge could not show this gauge." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 160 : 200} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No gauge on the ridge." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Gauge value={depth} min={0} max={8} format={reading} onChange={setDepth} />
				<Typography text={reading(depth)} sx={SHRINK} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Ridge gauge" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Gauge",
	description: "A ridge gauge whose long reading grows past the short caption slot.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <GaugeStory {...args} />,
};
