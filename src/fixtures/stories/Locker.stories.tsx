import React, { useRef, useState } from "@rbxts/react";
import {
	Alert,
	Button,
	EmptyListHint,
	ListItem,
	Menu,
	ScrollView,
	Skeleton,
	Stack,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Good {
	id: string;
	name: string;
	note: string;
}

interface Action {
	id: string;
	text: string;
	tone?: "danger";
}

interface SheetProps {
	anchor?: GuiObject;
	open: boolean;
	items: Action[];
	onSelect: (id: string) => void;
	onClose: () => void;
}

const Sheet = Menu as unknown as (props: SheetProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const SEED: Good[] = [
	{ id: "lamp", name: "Cove lamp", note: "Spare wick in the base." },
	{ id: "key", name: "Gate key", note: "Brass, for the side door." },
	{ id: "coil", name: "Pier coil", note: "Dry line, about ten paces." },
	{ id: "card", name: "Desk card", note: "Blank, for the evening count." },
];
const ACTIONS: Action[] = [
	{ id: "open", text: "Open" },
	{ id: "drop", text: "Drop", tone: "danger" },
];

function findGood(items: Good[], id: string) {
	for (const item of items) if (item.id === id) return item;
	return undefined;
}

function Locker(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [goods, setGoods] = useState(SEED);
	const [openId, setOpenId] = useState<string | undefined>(undefined);
	const [menuFor, setMenuFor] = useState<string | undefined>(undefined);
	const [anchor, setAnchor] = useState<TextButton | undefined>(undefined);
	const anchors = useRef<{ [id: string]: TextButton }>({});
	const opened = openId !== undefined ? findGood(goods, openId) : undefined;

	const drop = (id: string) => {
		const kept = new Array<Good>();
		for (const item of goods) if (item.id !== id) kept.push(item);
		setGoods(kept);
		if (openId === id) setOpenId(undefined);
	};

	const list =
		goods.size() === 0 ? (
			<EmptyListHint text="The locker is empty." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				{goods.map((item) => (
					<frame key={item.id} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						<uilistlayout FillDirection={Enum.FillDirection.Horizontal} VerticalAlignment={Enum.VerticalAlignment.Center} Padding={new UDim(0, 8)} />
						<ListItem text={item.name} secondary={item.note} sx={{ Size: new UDim2(1, -72, 0, 0) }} onActivated={() => setOpenId(item.id)} />
						<Button
							text="More"
							size="small"
							variant="text"
							ref={(button) => {
								if (button !== undefined) anchors.current[item.id] = button;
							}}
							onLeftClick={() => {
								setAnchor(anchors.current[item.id]);
								setMenuFor(item.id);
							}}
						/>
					</frame>
				))}
				{opened !== undefined ? (
					<Stack direction="column" gap={0} sx={STACK}>
						<Typography text={opened.name} variant="h6" sx={SHRINK} />
						<Typography text={opened.note} color="textSecondary" sx={SHRINK} />
					</Stack>
				) : undefined}
			</Stack>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Locker unavailable" message="The desk could not open this shelf." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="rounded" width={narrow ? 340 : 480} height={40} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="Nothing is stored." height={72} />
		) : (
			list
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Locker" variant="h5" sx={SHRINK} />
					{body}
				</Stack>
			</ScrollView>
			<Sheet
				anchor={anchor}
				open={menuFor !== undefined}
				items={ACTIONS}
				onClose={() => setMenuFor(undefined)}
				onSelect={(id) => {
					const target = menuFor;
					setMenuFor(undefined);
					if (target === undefined) return;
					if (id === "open") setOpenId(target);
					if (id === "drop") drop(target);
				}}
			/>
		</frame>
	);
}

export default {
	title: "Scenarios/Locker",
	description: "Stored goods with an open action and a danger drop.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Locker {...args} />,
};
