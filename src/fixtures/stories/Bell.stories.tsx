import React, { useState } from "@rbxts/react";
import { Alert, Button, EmptyListHint, Icons, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface BellButtonProps {
	text?: string;
	icon?: Icons;
	onLeftClick?: () => void;
}

const BellButton = Button as unknown as (props: BellButtonProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const BELLS = [
	{ icon: Icons.Friends, text: "Call", note: "Call is out" },
	{ icon: Icons.Book, text: "Note", note: "Note is down" },
];

function Bell(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [mark, setMark] = useState("");

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Shed unavailable" message="The shed could not open this bell." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 160 : 220} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No bells on the shed." height={72} />
		) : (
			<Stack direction="column" gap={2} sx={STACK}>
				<Typography text={mark === "" ? "The shed is quiet" : mark} sx={SHRINK} />
				<Stack direction={narrow ? "column" : "row"} alignItems="start" gap={1} sx={narrow ? STACK : SHRINK}>
					{BELLS.map((bell) => (
						<BellButton key={bell.text} text={bell.text} icon={bell.icon} onLeftClick={() => setMark(bell.note)} />
					))}
				</Stack>
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Shed bell" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Bell",
	description: "A bell whose actions keep a glyph beside the name.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Bell {...args} />,
};
