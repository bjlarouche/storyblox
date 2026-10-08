import React, { useState } from "@rbxts/react";
import { Alert, Button, EmptyListHint, Input, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface FieldProps {
	text?: string;
	placeholder?: string;
	maxLength?: number;
	onTextChanged?: (text: string) => void;
}

const Field = Input as unknown as (props: FieldProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const CAP = 32;

function Slip(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [note, setNote] = useState("");
	const [posted, setPosted] = useState(false);
	const left = CAP - note.size();

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Slip unavailable" message="The desk could not open this note." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No slip is waiting." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Field text={note} placeholder="Note for the dock" maxLength={CAP} onTextChanged={(value) => {
					setPosted(false);
					setNote(value);
				}} />
				<Typography text={`${left} left`} color="textSecondary" sx={SHRINK} />
				<Button
					text="Post"
					size="small"
					variant="contained"
					disabled={note.size() === 0}
					onLeftClick={() => setPosted(true)}
				/>
				{posted ? <Typography text="Slip posted" color="primary" sx={SHRINK} /> : undefined}
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Slip" variant="h5" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Slip",
	description: "A short dock note that stops at a fixed length.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Slip {...args} />,
};
