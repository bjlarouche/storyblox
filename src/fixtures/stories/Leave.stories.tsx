import React, { useState } from "@rbxts/react";
import { Alert, Button, Dialog, EmptyListHint, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
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

function Leave(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [open, setOpen] = useState(true);
	const [mark, setMark] = useState("");

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Gate unavailable" message="The gate could not open this ask." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 180 : 240} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="Nothing is waiting at the gate." height={72} />
		) : (
			<Stack direction="column" gap={2} sx={STACK}>
				<Typography text={mark === "" ? "The gate is held" : mark} sx={SHRINK} />
				<Button text="Ask" variant="outlined" onLeftClick={() => setOpen(true)} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Gate ask" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
			{phase === "ready" && (
				<Dialog
					open={open}
					title="Leave the gate?"
					onClose={() => setOpen(false)}
					actions={
						<>
							<Button text="Stay" size="small" variant="text" onLeftClick={() => setOpen(false)} />
							<Button
								text="Leave"
								size="small"
								onLeftClick={() => {
									setMark("The gate is open");
									setOpen(false);
								}}
							/>
						</>
					}
				>
					<Typography text="The lamp stays lit." sx={SHRINK} />
				</Dialog>
			)}
		</frame>
	);
}

export default {
	title: "Scenarios/Leave",
	description: "An ask whose two actions wrap inside the fixed dialog.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Leave {...args} />,
};
