import React, { useState } from "@rbxts/react";
import { Box, Button, NumberInput, Typography, useTheme, WriteableStyle } from "@rbxts/uiblox";
import { LinearProgress, Tabs, Tooltip } from "./kit";
import { Badge, Chip, Dialog, Drawer, Menu, Paper, Stack, useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	shopOpen: boolean;
	tab: "shop" | "inventory";
	menuOpen: boolean;
	confirmOpen: boolean;
	detailsOpen: boolean;
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 760 },
	desktop: { width: 1100, height: 720 },
};

type Rarity = "Common" | "Rare" | "Epic";

interface Item {
	id: string;
	name: string;
	kind: string;
	rarity: Rarity;
	price: number;
	blurb: string;
	from: Color3;
	to: Color3;
}

const ITEMS: Item[] = [
	{
		id: "lantern",
		name: "Tide Lantern",
		kind: "Tool",
		rarity: "Common",
		price: 40,
		blurb: "Lights the path for a short while. Stacks up to ten.",
		from: Color3.fromRGB(232, 164, 72),
		to: Color3.fromRGB(252, 230, 170),
	},
	{
		id: "cloak",
		name: "Moss Cloak",
		kind: "Wear",
		rarity: "Rare",
		price: 180,
		blurb: "Blends in near trees. Quiet footsteps on soft ground.",
		from: Color3.fromRGB(44, 98, 62),
		to: Color3.fromRGB(160, 206, 132),
	},
	{
		id: "compass",
		name: "Drift Compass",
		kind: "Tool",
		rarity: "Rare",
		price: 120,
		blurb: "Points toward the nearest unfinished objective.",
		from: Color3.fromRGB(40, 92, 150),
		to: Color3.fromRGB(150, 206, 240),
	},
	{
		id: "glider",
		name: "Kite Glider",
		kind: "Gear",
		rarity: "Epic",
		price: 420,
		blurb: "Glide from any ledge. Lands softly if you hold jump.",
		from: Color3.fromRGB(120, 54, 160),
		to: Color3.fromRGB(240, 140, 180),
	},
	{
		id: "tonic",
		name: "Ember Tonic",
		kind: "Potion",
		rarity: "Common",
		price: 25,
		blurb: "Restores a quarter of your energy over five seconds.",
		from: Color3.fromRGB(190, 60, 52),
		to: Color3.fromRGB(250, 170, 120),
	},
	{
		id: "boots",
		name: "Pebble Boots",
		kind: "Wear",
		rarity: "Common",
		price: 60,
		blurb: "A little faster on stone and gravel.",
		from: Color3.fromRGB(110, 96, 84),
		to: Color3.fromRGB(210, 196, 170),
	},
];

const RARITY_ORDER: { [key in Rarity]: number } = { Common: 0, Rare: 1, Epic: 2 };

function findItem(id: string): Item {
	for (const entry of ITEMS) {
		if (entry.id === id) return entry;
	}
	return ITEMS[0];
}

function Swatch(props: { from: Color3; to: Color3; height: number; rotation?: number; radius?: number }) {
	return (
		<Box
			sx={{
				Size: new UDim2(1, 0, 0, props.height),
				AutomaticSize: Enum.AutomaticSize.None,
				BackgroundColor3: Color3.fromRGB(255, 255, 255),
				BackgroundTransparency: 0,
				BorderSizePixel: 0,
				radius: props.radius ?? 8,
				gradient: { colors: [props.from, props.to], rotation: props.rotation ?? 120 },
			} as WriteableStyle<Frame>}
		/>
	);
}

function Hill(props: { position: UDim2; size: UDim2; from: Color3; to: Color3 }) {
	return (
		<Box
			sx={{
				AnchorPoint: new Vector2(0.5, 1),
				Position: props.position,
				Size: props.size,
				AutomaticSize: Enum.AutomaticSize.None,
				BackgroundColor3: Color3.fromRGB(255, 255, 255),
				BackgroundTransparency: 0,
				BorderSizePixel: 0,
				gradient: { colors: [props.from, props.to], rotation: 90 },
			} as WriteableStyle<Frame>}
		>
			<uicorner CornerRadius={new UDim(0.5, 0)} />
		</Box>
	);
}

function World() {
	return (
		<Box
			sx={{
				Size: UDim2.fromScale(1, 1),
				AutomaticSize: Enum.AutomaticSize.None,
				BackgroundColor3: Color3.fromRGB(255, 255, 255),
				BackgroundTransparency: 0,
				BorderSizePixel: 0,
				ZIndex: 0,
				gradient: {
					colors: [Color3.fromRGB(70, 120, 190), Color3.fromRGB(244, 196, 150)],
					rotation: 90,
				},
			} as WriteableStyle<Frame>}
		>
			<frame
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={UDim2.fromScale(0.72, 0.3)}
				Size={UDim2.fromOffset(120, 120)}
				BackgroundColor3={Color3.fromRGB(255, 236, 196)}
				BackgroundTransparency={0.15}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0.5, 0)} />
			</frame>
			<Hill
				position={UDim2.fromScale(0.25, 1.2)}
				size={UDim2.fromScale(1.1, 0.7)}
				from={Color3.fromRGB(86, 140, 96)}
				to={Color3.fromRGB(40, 78, 62)}
			/>
			<Hill
				position={UDim2.fromScale(0.85, 1.25)}
				size={UDim2.fromScale(1, 0.62)}
				from={Color3.fromRGB(120, 168, 110)}
				to={Color3.fromRGB(52, 96, 70)}
			/>
		</Box>
	);
}

function Meter(props: { label: string; value: number; color: Color3; order: number }) {
	return (
		<Stack direction="column" gap={0.5} sx={{ LayoutOrder: props.order, Size: new UDim2(0, 120, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
			<Typography
				text={`${props.label} ${math.floor(props.value * 100)}%`}
				variant="caption"
				color="textSecondary"
				sx={{ Size: new UDim2(1, 0, 0, 16), AutomaticSize: Enum.AutomaticSize.None }}
			/>
			<LinearProgress value={props.value} color={props.color} className={{ Size: new UDim2(1, 0, 0, 6) }} />
		</Stack>
	);
}

function Hud(props: { coins: number; narrow: boolean }) {
	return (
		<Paper
			elevation="raised"
			sx={{ Position: UDim2.fromOffset(12, 12), Size: new UDim2(1, -24, 0, 0), AutomaticSize: Enum.AutomaticSize.Y, ZIndex: 2 }}
		>
			<Stack direction="row" gap={2} alignItems="center" wrap={true} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<Typography
					text="Wanderer · Lv 7"
					variant="h3"
					color="textPrimary"
					sx={{ LayoutOrder: 0, Size: new UDim2(0, 150, 0, 24), AutomaticSize: Enum.AutomaticSize.None }}
				/>
				<Meter label="Health" value={0.82} color={Color3.fromRGB(214, 84, 84)} order={1} />
				<Meter label="Energy" value={0.46} color={Color3.fromRGB(70, 150, 220)} order={2} />
				<Tooltip text="Coins buy tools and wear in the shop.">
					<Chip label={`${props.coins} coins`} color="primary" size="small" />
				</Tooltip>
				{!props.narrow && <Chip label="3 shards" variant="outlined" size="small" />}
			</Stack>
		</Paper>
	);
}

function Quest(props: { narrow: boolean }) {
	return (
		<Paper
			elevation="outlined"
			sx={{
				Position: props.narrow ? UDim2.fromOffset(12, 120) : UDim2.fromOffset(12, 96),
				Size: props.narrow ? new UDim2(1, -24, 0, 0) : new UDim2(0, 260, 0, 0),
				AutomaticSize: Enum.AutomaticSize.Y,
				ZIndex: 2,
			}}
		>
			<Stack direction="column" gap={1} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<Typography
					text="Objective"
					variant="overline"
					color="textSecondary"
					sx={{ Size: new UDim2(1, 0, 0, 16), AutomaticSize: Enum.AutomaticSize.None }}
				/>
				<Typography
					text="Light the three harbor beacons"
					variant="body"
					color="textPrimary"
					sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
				/>
				<LinearProgress value={2 / 3} className={{ Size: new UDim2(1, 0, 0, 6) }} />
				<Typography
					text="2 of 3 lit · reward 120 coins"
					variant="caption"
					color="textSecondary"
					sx={{ Size: new UDim2(1, 0, 0, 16), AutomaticSize: Enum.AutomaticSize.None }}
				/>
			</Stack>
		</Paper>
	);
}

const ACTIONS = [
	{ id: "shop", text: "Shop", hint: "Open the trader" },
	{ id: "bag", text: "Bag", hint: "Items you carry" },
	{ id: "map", text: "Map", hint: "Harbor and hills" },
	{ id: "skills", text: "Skills", hint: "Two points to spend" },
];

function ActionBar(props: { onOpen: (id: string) => void }) {
	return (
		<Paper
			elevation="raised"
			sx={{
				AnchorPoint: new Vector2(0.5, 1),
				Position: new UDim2(0.5, 0, 1, -12),
				Size: UDim2.fromOffset(0, 0),
				AutomaticSize: Enum.AutomaticSize.XY,
				ZIndex: 2,
			}}
		>
			<Stack direction="row" gap={1} alignItems="center" sx={{ AutomaticSize: Enum.AutomaticSize.XY }}>
				{ACTIONS.map((action, index) => (
					<Tooltip key={action.id} text={action.hint}>
						<Badge count={action.id === "skills" ? 2 : 0} invisible={action.id !== "skills"} color="primary">
							<Button
								text={action.text}
								variant={index === 0 ? "contained" : "outlined"}
								size="small"
								onLeftClick={() => props.onOpen(action.id)}
							/>
						</Badge>
					</Tooltip>
				))}
			</Stack>
		</Paper>
	);
}

function ItemTile(props: { item: Item; selected: boolean; owned: number; order: number; onSelect: () => void }) {
	return (
		<Paper
			elevation={props.selected ? "raised" : "outlined"}
			sx={{ LayoutOrder: props.order, Size: new UDim2(0, 132, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
		>
			<Stack direction="column" gap={0.5} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<Badge count={props.owned} invisible={props.owned === 0} color="primary">
					<Swatch from={props.item.from} to={props.item.to} height={72} />
				</Badge>
				<Typography
					text={props.item.name}
					variant="body"
					color="textPrimary"
					sx={{ Size: new UDim2(1, 0, 0, 20), AutomaticSize: Enum.AutomaticSize.None }}
				/>
				<Typography
					text={`${props.item.rarity} · ${props.item.price}c`}
					variant="caption"
					color="textSecondary"
					sx={{ Size: new UDim2(1, 0, 0, 16), AutomaticSize: Enum.AutomaticSize.None }}
				/>
				<Button
					text={props.selected ? "Selected" : "View"}
					variant={props.selected ? "contained" : "text"}
					size="small"
					onLeftClick={props.onSelect}
				/>
			</Stack>
		</Paper>
	);
}

function Details(props: {
	item: Item;
	tab: string;
	quantity: number;
	coins: number;
	owned: number;
	equipped: boolean;
	onQuantity: (value: number) => void;
	onBuy: () => void;
	onEquip: () => void;
}) {
	const total = props.item.price * props.quantity;
	const short = total > props.coins;
	return (
		<Stack direction="column" gap={1.5} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
			<Swatch from={props.item.from} to={props.item.to} height={110} rotation={140} />
			<Typography
				text={props.item.name}
				variant="h2"
				color="textPrimary"
				sx={{ Size: new UDim2(1, 0, 0, 32), AutomaticSize: Enum.AutomaticSize.None }}
			/>
			<Stack direction="row" gap={1} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<Chip label={props.item.rarity} color={props.item.rarity === "Epic" ? "secondary" : "default"} size="small" />
				<Chip label={props.item.kind} variant="outlined" size="small" />
			</Stack>
			<Typography
				text={props.item.blurb}
				variant="body"
				color="textSecondary"
				sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
			/>
			{props.tab === "shop" ? (
				<Stack direction="column" gap={1} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
					<Stack direction="row" gap={1} alignItems="center" sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
						<Typography
							text="Qty"
							variant="caption"
							color="textSecondary"
							sx={{ Size: new UDim2(0, 32, 0, 20), AutomaticSize: Enum.AutomaticSize.None }}
						/>
						<NumberInput value={props.quantity} min={1} max={10} step={1} width={new UDim(0, 120)} onChange={props.onQuantity} />
					</Stack>
					<Typography
						text={short ? `${total}c · need ${total - props.coins} more` : `Total ${total}c · ${props.coins - total}c left`}
						variant="caption"
						color={short ? "error" : "textSecondary"}
						sx={{ Size: new UDim2(1, 0, 0, 16), AutomaticSize: Enum.AutomaticSize.None }}
					/>
					<Button text={`Buy for ${total}c`} variant="contained" color="primary" disabled={short} onLeftClick={props.onBuy} />
				</Stack>
			) : (
				<Stack direction="column" gap={1} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
					<Typography
						text={props.owned > 0 ? `You carry ${props.owned}` : "Not in your bag yet"}
						variant="caption"
						color="textSecondary"
						sx={{ Size: new UDim2(1, 0, 0, 16), AutomaticSize: Enum.AutomaticSize.None }}
					/>
					<Button
						text={props.equipped ? "Equipped" : "Equip"}
						variant={props.equipped ? "outlined" : "contained"}
						disabled={props.owned === 0}
						onLeftClick={props.onEquip}
					/>
				</Stack>
			)}
		</Stack>
	);
}

function InventoryShop(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [shopOpen, setShopOpen] = useArg(args.shopOpen);
	const [tab, setTab] = useArg<string>(args.tab);
	const [menuOpen, setMenuOpen] = useArg(args.menuOpen);
	const [confirmOpen, setConfirmOpen] = useArg(args.confirmOpen);
	const [detailsOpen, setDetailsOpen] = useArg(args.detailsOpen);
	const [sort, setSort] = useState("rarity");
	const [selectedId, setSelectedId] = useState("cloak");
	const [quantity, setQuantity] = useState(1);
	const [coins, setCoins] = useState(640);
	const [owned, setOwned] = useState<{ [id: string]: number }>({ lantern: 3, boots: 1 });
	const [equippedId, setEquippedId] = useState("boots");
	const [anchor, setAnchor] = useState<TextButton>();

	const shown: Item[] = [];
	for (const entry of ITEMS) {
		if (tab === "inventory" && (owned[entry.id] ?? 0) === 0) continue;
		shown.push(entry);
	}
	if (sort === "rarity") {
		shown.sort((a, b) => RARITY_ORDER[a.rarity] > RARITY_ORDER[b.rarity]);
	} else {
		shown.sort((a, b) => a.price < b.price);
	}

	const selected = findItem(selectedId);
	const total = selected.price * quantity;
	const pick = (id: string) => {
		setSelectedId(id);
		setQuantity(1);
		if (narrow) setDetailsOpen(true);
	};
	const buy = () => {
		setCoins(coins - total);
		setOwned({ ...owned, [selected.id]: (owned[selected.id] ?? 0) + quantity });
		setConfirmOpen(false);
	};

	const details = (
		<Details
			item={selected}
			tab={tab}
			quantity={quantity}
			coins={coins}
			owned={owned[selected.id] ?? 0}
			equipped={equippedId === selected.id}
			onQuantity={setQuantity}
			onBuy={() => setConfirmOpen(true)}
			onEquip={() => setEquippedId(selected.id)}
		/>
	);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants={true}>
			<World />
			<Hud coins={coins} narrow={narrow} />
			<Quest narrow={narrow} />
			<ActionBar
				onOpen={(id: string) => {
					setTab(id === "bag" ? "inventory" : "shop");
					setShopOpen(id === "shop" || id === "bag");
				}}
			/>
			{shopOpen && (
				<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={Color3.fromRGB(0, 0, 0)} BackgroundTransparency={0.45} BorderSizePixel={0} ZIndex={5} Active={true}>
					<Paper
						elevation="raised"
						sx={{
							AnchorPoint: new Vector2(0.5, narrow ? 1 : 0.5),
							Position: narrow ? UDim2.fromScale(0.5, 1) : UDim2.fromScale(0.5, 0.5),
							Size: narrow ? new UDim2(1, 0, 0.78, 0) : UDim2.fromOffset(820, 520),
						}}
					>
						<Stack direction="column" gap={1.5} sx={{ Size: UDim2.fromScale(1, 1) }}>
							<Stack direction="row" gap={1} alignItems="center" sx={{ LayoutOrder: 0, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
								<Typography
									text="Harbor Trader"
									variant="h2"
									color="textPrimary"
									sx={{ LayoutOrder: 0, Size: new UDim2(1, -220, 0, 32), AutomaticSize: Enum.AutomaticSize.None }}
								/>
								<Button
									ref={setAnchor}
									text={sort === "rarity" ? "By rarity" : "By price"}
									variant="outlined"
									size="small"
									onLeftClick={() => setMenuOpen(true)}
								/>
								<Button text="Close" variant="text" size="small" onLeftClick={() => setShopOpen(false)} />
							</Stack>
							<Tabs
								value={tab}
								options={[
									{ value: "shop", label: "Shop" },
									{ value: "inventory", label: "Inventory" },
								]}
								onChange={(value: string) => setTab(value)}
							/>
							<Stack
								direction="row"
								gap={2}
								alignItems="start"
								sx={{ LayoutOrder: 2, Size: new UDim2(1, 0, 1, -96) }}
							>
								<scrollingframe
									Size={narrow ? UDim2.fromScale(1, 1) : new UDim2(1, -292, 1, 0)}
									BackgroundTransparency={1}
									BorderSizePixel={0}
									ScrollBarThickness={6}
									CanvasSize={new UDim2(0, 0, 0, 0)}
									AutomaticCanvasSize={Enum.AutomaticSize.Y}
								>
									<uipadding PaddingRight={new UDim(0, theme.spacing.calc(1))} PaddingBottom={new UDim(0, theme.spacing.calc(1))} />
									<Stack direction="row" gap={1.5} wrap={true} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
										{shown.size() === 0 && (
											<Typography
												text="Your bag is empty. Buy something first."
												variant="body"
												color="textSecondary"
												sx={{ Size: new UDim2(1, 0, 0, 24), AutomaticSize: Enum.AutomaticSize.None }}
											/>
										)}
										{shown.map((entry, index) => (
											<ItemTile
												key={entry.id}
												item={entry}
												selected={entry.id === selectedId}
												owned={owned[entry.id] ?? 0}
												order={index}
												onSelect={() => pick(entry.id)}
											/>
										))}
									</Stack>
								</scrollingframe>
								{!narrow && (
									<Paper elevation="outlined" sx={{ Size: new UDim2(0, 276, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
										{details}
									</Paper>
								)}
							</Stack>
						</Stack>
					</Paper>
				</frame>
			)}
			<Menu
				anchor={anchor}
				open={shopOpen && menuOpen}
				selected={sort}
				items={[
					{ id: "rarity", text: "Rarity" },
					{ id: "price", text: "Price, low first" },
				]}
				onSelect={(id: string) => setSort(id)}
				onClose={() => setMenuOpen(false)}
			/>
			{narrow && (
				<Drawer open={shopOpen && detailsOpen} edge="right" width={340} onClose={() => setDetailsOpen(false)}>
					{details}
				</Drawer>
			)}
			<Dialog
				open={confirmOpen}
				title={`Buy ${quantity} × ${selected.name}?`}
				onClose={() => setConfirmOpen(false)}
				actions={
					<Stack direction="row" gap={1} sx={{ AutomaticSize: Enum.AutomaticSize.XY }}>
						<Button text="Cancel" variant="text" onLeftClick={() => setConfirmOpen(false)} />
						<Button text={`Pay ${total}c`} variant="contained" color="primary" disabled={total > coins} onLeftClick={buy} />
					</Stack>
				}
			>
				<Typography
					text={`You will have ${coins - total} coins left.`}
					variant="body"
					color="textSecondary"
					sx={{ Size: new UDim2(1, 0, 0, 20), AutomaticSize: Enum.AutomaticSize.None }}
				/>
			</Dialog>
		</frame>
	);
}

export default {
	title: "Scenarios/Inventory Shop",
	description: "Game HUD over a gradient world with a trader overlay: item grid, details, quantity, buy confirm, equip, sort menu, tooltips.",
	args: { viewport: "desktop", shopOpen: true, tab: "shop", menuOpen: false, confirmOpen: false, detailsOpen: false },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		shopOpen: { type: "boolean" },
		tab: { type: "enum", options: ["shop", "inventory"] },
		menuOpen: { type: "boolean" },
		confirmOpen: { type: "boolean" },
		detailsOpen: { type: "boolean" },
	},
	preview: { width: 1100, height: 720 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <InventoryShop {...args} />,
};
