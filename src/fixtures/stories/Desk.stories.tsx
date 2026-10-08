import React from "@rbxts/react";
import { Alert, AppBar, EmptyListHint, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface BarProps {
	title?: string;
	subtitle?: string;
}

const Bar = AppBar as unknown as (props: BarProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

function Desk(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Desk unavailable" message="The desk could not open this watch." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="Nothing is on the desk." height={72} />
		) : (
			<Typography text="Pier lamp is lit" sx={SHRINK} />
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<Bar title="Cove" subtitle="Night watch" />
			<frame Position={new UDim2(0, 0, 0, 56)} Size={new UDim2(1, 0, 1, -56)} BackgroundTransparency={1} BorderSizePixel={0}>
				<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{board}</ScrollView>
			</frame>
		</frame>
	);
}

export default {
	title: "Scenarios/Desk",
	description: "A desk bar with a second line under the title.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Desk {...args} />,
};
