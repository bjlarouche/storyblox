import React, { useState } from "@rbxts/react";
import { Alert, Button, EmptyListHint, ScrollView, Skeleton, Snackbar, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface NoteProps {
	message: string;
	open?: boolean;
	action?: string;
	onAction?: () => void;
	onDismiss: () => void;
	edge?: "top" | "bottom";
}

const Note = Snackbar as unknown as (props: NoteProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

function Hail(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [sent, setSent] = useState(false);

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Hail unavailable" message="The desk could not open this call." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No hail is waiting." height={72} />
		) : (
			<Typography text="Pier is ready" sx={SHRINK} />
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<frame Size={new UDim2(1, 0, 1, -56)} BackgroundTransparency={1} BorderSizePixel={0}>
				<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography text="Hail" variant="h5" sx={SHRINK} />
						{board}
					</Stack>
				</ScrollView>
			</frame>
			<frame Position={new UDim2(0, 0, 1, -56)} Size={new UDim2(1, 0, 0, 56)} BackgroundTransparency={1} BorderSizePixel={0}>
				<Button
					text="Send"
					size="small"
					variant="contained"
					disabled={phase !== "ready"}
					onLeftClick={() => setSent(true)}
				/>
			</frame>
			<Note
				message="Hail sent"
				open={sent && phase === "ready"}
				edge="top"
				action="Undo"
				onAction={() => setSent(false)}
				onDismiss={() => setSent(false)}
			/>
		</frame>
	);
}

export default {
	title: "Scenarios/Hail",
	description: "A hail that confirms from the top so the send bar stays clear.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Hail {...args} />,
};
