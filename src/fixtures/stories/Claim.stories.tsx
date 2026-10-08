import React from "@rbxts/react";
import { Alert, Button, Card, EmptyListHint, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
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

function Claim(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [mark, setMark] = React.useState("The lamp is up");

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Cove unavailable" message="The cove could not show this claim." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 160 : 200} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No claim on the cove." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Card
					title="Cove lamp"
					elevation="raised"
					actions={
						<>
							<Button text="Keep" size="small" variant="text" onLeftClick={() => setMark("The lamp stays")} />
							<Button text="Drop" size="small" onLeftClick={() => setMark("The lamp is down")} />
						</>
					}
				>
					<Typography text="The wick is lit." sx={SHRINK} />
				</Card>
				<Typography text={mark} sx={SHRINK} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Cove claim" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Claim",
	description: "A cove claim whose two actions wrap inside the fixed card.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Claim {...args} />,
};
