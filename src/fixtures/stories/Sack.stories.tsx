import React, { useState } from "@rbxts/react";
import { Alert, EmptyListHint, IconButton, Icons, Menu, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface SackItem {
	id: string;
	text: string;
	icon?: Icons;
	tone?: "danger";
}

interface SackMenuProps {
	anchor?: GuiObject;
	open: boolean;
	items: SackItem[];
	onSelect: (id: string) => void;
	onClose: () => void;
}

const SackMenu = Menu as unknown as (props: SackMenuProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const MOVES = [
	{ id: "keep", text: "Keep the sack", icon: Icons.Save, note: "Lane sack is kept" },
	{ id: "shift", text: "Shift the sack", icon: Icons.Move, note: "Lane sack is shifted" },
	{ id: "drop", text: "Drop the sack", icon: Icons.Delete, tone: "danger" as const, note: "Lane sack is dropped" },
];

function Sack(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [open, setOpen] = useState(true);
	const [anchor, setAnchor] = useState<ImageButton>();
	const [mark, setMark] = useState("");

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Lane unavailable" message="The lane could not open this sack." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 180 : 240} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No sack on the lane." height={72} />
		) : (
			<Stack direction="row" alignItems="center" gap={2} sx={SHRINK}>
				<Typography text={mark === "" ? "The sack is waiting" : mark} sx={SHRINK} />
				<IconButton ref={setAnchor} icon={Icons.HorizontalDots} size="md" tint={theme.palette.text.primary} onClick={() => setOpen(true)} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Lane sack" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
			{phase === "ready" && (
				<SackMenu
					anchor={anchor}
					open={open}
					items={MOVES.map((item) => ({ id: item.id, text: item.text, icon: item.icon, tone: item.tone }))}
					onSelect={(id) => {
						const move = MOVES.find((item) => item.id === id);
						if (move !== undefined) setMark(move.note);
					}}
					onClose={() => setOpen(false)}
				/>
			)}
		</frame>
	);
}

export default {
	title: "Scenarios/Sack",
	description: "A sack menu that grows past its narrow button.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Sack {...args} />,
};
