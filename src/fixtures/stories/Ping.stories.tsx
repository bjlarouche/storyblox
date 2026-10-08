import React, { useState } from "@rbxts/react";
import { Alert, EmptyListHint, Icons, ScrollView, Skeleton, SpeedDial, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface PingAction {
	icon: Icons;
	label?: string;
	onClick?: () => void;
}

interface PingDialProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	actions: PingAction[];
	icon?: Icons;
	sx?: { AnchorPoint: Vector2; Position: UDim2 };
}

const Dial = SpeedDial as unknown as (props: PingDialProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const MARKS = [
	{ icon: Icons.LightTheme, label: "Lamp", note: "Wharf lamp is marked" },
	{ icon: Icons.Book, label: "Log", note: "Wharf log is marked" },
	{ icon: Icons.HelpDesk, label: "Desk", note: "Wharf desk is marked" },
];

function Ping(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [open, setOpen] = useState(true);
	const [mark, setMark] = useState("");

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Wharf unavailable" message="The wharf could not open this watch." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 180 : 240} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="Nothing to mark." height={72} />
		) : (
			<Typography text={mark === "" ? "Pick a mark" : mark} sx={SHRINK} />
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Wharf watch" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
			{phase === "ready" && (
				<Dial
					open={open}
					onOpenChange={setOpen}
					icon={Icons.OpenBox}
					sx={{ AnchorPoint: new Vector2(1, 1), Position: new UDim2(1, -16, 1, -16) }}
					actions={MARKS.map((item) => ({
						icon: item.icon,
						label: item.label,
						onClick: () => setMark(item.note),
					}))}
				/>
			)}
		</frame>
	);
}

export default {
	title: "Scenarios/Ping",
	description: "A corner dial whose actions keep a name beside the button.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Ping {...args} />,
};
