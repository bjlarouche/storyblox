import React, { useState } from "@rbxts/react";
import { Alert, Button, EmptyListHint, ScrollView, Skeleton, Snackbar, Stack, Typography, useTheme } from "@rbxts/uiblox";
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
const WIRE = "The dock line is fouled and the lamp is out";

function Wire(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [open, setOpen] = useState(true);

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Dock unavailable" message="The dock could not send this wire." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 200 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No wire on the dock." height={72} />
		) : (
			<Stack direction="column" gap={2} sx={STACK}>
				<Typography text={open ? "A wire is up" : "The dock is quiet"} sx={SHRINK} />
				<Button text="Send" onLeftClick={() => setOpen(true)} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Dock wire" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
			{phase === "ready" && <Snackbar open={open} message={WIRE} duration={120} onDismiss={() => setOpen(false)} />}
		</frame>
	);
}

export default {
	title: "Scenarios/Wire",
	description: "A dock wire whose long notice wraps inside the toast.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Wire {...args} />,
};
