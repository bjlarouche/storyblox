import React, { useState } from "@rbxts/react";
import { Alert, Button, EmptyListHint, Icons, Menu, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface StowItem {
	id: string;
	text: string;
	icon?: Icons;
	tone?: "danger";
}

interface StowMenuProps {
	anchor?: GuiObject;
	open: boolean;
	items: StowItem[];
	onSelect: (id: string) => void;
	onClose: () => void;
}

const StowMenu = Menu as unknown as (props: StowMenuProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const MOVES = [
	{ id: "keep", text: "Keep", icon: Icons.Save, note: "Ridge sack is kept" },
	{ id: "shift", text: "Shift", icon: Icons.Move, note: "Ridge sack is shifted" },
	{ id: "drop", text: "Drop", icon: Icons.Delete, tone: "danger" as const, note: "Ridge sack is dropped" },
];

function Stow(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [open, setOpen] = useState(true);
	const [anchor, setAnchor] = useState<TextButton>();
	const [mark, setMark] = useState("");

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Ridge unavailable" message="The ridge could not open this sack." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 180 : 240} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="Nothing to stow." height={72} />
		) : (
			<Stack direction="column" gap={2} sx={STACK}>
				<Typography text={mark === "" ? "Ridge sack is waiting" : mark} sx={SHRINK} />
				<Button ref={setAnchor} text="Stow" onLeftClick={() => setOpen(true)} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Ridge stow" variant="h3" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
			{phase === "ready" && (
				<StowMenu
					anchor={anchor}
					open={open}
					items={MOVES.map((item) => ({ id: item.id, text: item.text, icon: item.icon, tone: item.tone }))}
					onSelect={(id) => {
						const item = MOVES.find((move) => move.id === id);
						if (item !== undefined) setMark(item.note);
					}}
					onClose={() => setOpen(false)}
				/>
			)}
		</frame>
	);
}

export default {
	title: "Scenarios/Stow",
	description: "A stow menu whose rows keep a glyph beside the name.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Stow {...args} />,
};
