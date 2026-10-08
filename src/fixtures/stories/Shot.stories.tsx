import React from "@rbxts/react";
import { Alert, EmptyListHint, ImageList, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const SHOTS = [
	{ src: "", title: "Dawn" },
	{ src: "", title: "Night lamp on the outer pier" },
];

function markFor(index: number) {
	if (index === 1) return "The night lamp is up";
	return "Dawn is up";
}

function Shot(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [mark, setMark] = React.useState("Dawn is up");

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Pier unavailable" message="The pier could not show this shot." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 160 : 200} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No shot on the pier." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<ImageList items={SHOTS} cols={2} onItemActivated={(index) => setMark(markFor(index))} />
				<Typography text={mark} sx={SHRINK} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Pier shot" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Shot",
	description: "A pier shot whose long tile title wraps inside the tile.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Shot {...args} />,
};
