import React from "@rbxts/react";
import { Alert, EmptyListHint, ScrollView, Select, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
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
const POSTS = [
	{ label: "Dawn", value: "dawn" },
	{ label: "Dusk", value: "dusk" },
	{ label: "Night lamp on the pier", value: "night" },
];

function posted(watch: string) {
	if (watch === "dusk") return "Dusk is posted";
	if (watch === "night") return "The night lamp is posted";
	return "Dawn is posted";
}

function Post(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [watch, setWatch] = React.useState("dawn");

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Gate unavailable" message="The gate could not show this post." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				<Select value="" options={[]} onChange={() => undefined} loading placeholder="Post" />
				<Skeleton variant="text" width={narrow ? 160 : 200} height={24} />
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No post on the gate." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Select value={watch} options={POSTS} onChange={(picked) => setWatch(picked)} defaultOpen />
				<Typography text={posted(watch)} sx={SHRINK} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Gate post" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Post",
	description: "A gate post whose long option grows past the narrow field.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Post {...args} />,
};
