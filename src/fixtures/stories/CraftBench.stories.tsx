import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Box,
	Button,
	Chip,
	EmptyListHint,
	LinearProgress,
	NumberInput,
	Paper,
	ScrollView,
	Skeleton,
	Snackbar,
	Stack,
	ToastVariants,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Material {
	id: string;
	label: string;
	owned: number;
}

interface Need {
	id: string;
	count: number;
}

interface Recipe {
	id: string;
	title: string;
	blurb: string;
	needs: Need[];
	from: Color3;
	to: Color3;
}

interface LabelProps {
	text?: string;
	wrap?: boolean;
	sx?: { fontSize?: number; TextColor3?: Color3 };
}

interface QtyProps {
	value: number;
	min?: number;
	max?: number;
	step?: number;
	stepper?: boolean;
	size?: "small";
	width?: UDim;
	onChange: (value: number) => void;
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const Qty = NumberInput as unknown as (props: QtyProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const START: Material[] = [
	{ id: "glass", label: "Glass", owned: 5 },
	{ id: "wick", label: "Wick", owned: 2 },
	{ id: "oil", label: "Oil", owned: 1 },
	{ id: "fiber", label: "Fiber", owned: 8 },
	{ id: "clasp", label: "Clasp", owned: 0 },
	{ id: "wood", label: "Wood", owned: 6 },
	{ id: "resin", label: "Resin", owned: 3 },
	{ id: "stone", label: "Stone", owned: 4 },
	{ id: "dye", label: "Dye", owned: 2 },
	{ id: "paper", label: "Paper", owned: 3 },
	{ id: "ink", label: "Ink", owned: 1 },
];

const RECIPES: Recipe[] = [
	{
		id: "lamp",
		title: "Cove lamp",
		blurb: "A small lamp for the bench by the water.",
		needs: [
			{ id: "glass", count: 2 },
			{ id: "wick", count: 1 },
			{ id: "oil", count: 1 },
		],
		from: Color3.fromRGB(232, 196, 120),
		to: Color3.fromRGB(92, 124, 148),
	},
	{
		id: "cord",
		title: "Gate cord",
		blurb: "A short cord that holds the field gate shut.",
		needs: [
			{ id: "fiber", count: 3 },
			{ id: "clasp", count: 1 },
		],
		from: Color3.fromRGB(168, 146, 108),
		to: Color3.fromRGB(74, 92, 64),
	},
	{
		id: "peg",
		title: "Pier peg",
		blurb: "A dry peg for the last post on the pier.",
		needs: [
			{ id: "wood", count: 2 },
			{ id: "resin", count: 1 },
		],
		from: Color3.fromRGB(196, 154, 108),
		to: Color3.fromRGB(86, 108, 122),
	},
	{
		id: "chip",
		title: "Ridge chip",
		blurb: "A marked chip for the last post you can see.",
		needs: [
			{ id: "stone", count: 1 },
			{ id: "dye", count: 1 },
		],
		from: Color3.fromRGB(176, 168, 156),
		to: Color3.fromRGB(120, 86, 72),
	},
	{
		id: "card",
		title: "Desk card",
		blurb: "A card for the morning count.",
		needs: [
			{ id: "paper", count: 2 },
			{ id: "ink", count: 1 },
		],
		from: Color3.fromRGB(236, 230, 214),
		to: Color3.fromRGB(70, 86, 112),
	},
];

function ownedOf(stock: Material[], id: string) {
	for (const item of stock) if (item.id === id) return item.owned;
	return 0;
}

function labelOf(stock: Material[], id: string) {
	for (const item of stock) if (item.id === id) return item.label;
	return id;
}

function findRecipe(id: string) {
	for (const recipe of RECIPES) if (recipe.id === id) return recipe;
	return undefined;
}

function batchCap(recipe: Recipe, stock: Material[]) {
	let cap = 99;
	for (const need of recipe.needs) {
		const batches = need.count > 0 ? math.floor(ownedOf(stock, need.id) / need.count) : 0;
		if (batches < cap) cap = batches;
	}
	return cap;
}

function shortOf(recipe: Recipe, stock: Material[], qty: number) {
	for (const need of recipe.needs) if (ownedOf(stock, need.id) < need.count * qty) return true;
	return false;
}

function Ingredient(props: { label: string; owned: number; need: number }) {
	const { theme } = useTheme();
	const short = props.owned < props.need;
	const ratio = props.need > 0 ? math.min(props.owned / props.need, 1) : 1;
	return (
		<Stack direction="column" gap={0} sx={STACK}>
			<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
				<frame Size={new UDim2(1, -56, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					<Label text={props.label} wrap />
				</frame>
				<Label text={`${props.owned}/${props.need}`} sx={{ TextColor3: short ? theme.palette.status.error.main : theme.palette.text.secondary }} />
			</Stack>
			<LinearProgress value={ratio} color={short ? theme.palette.status.error.main : theme.palette.primary.main} sx={{ Size: new UDim2(1, 0, 0, 6) }} />
		</Stack>
	);
}

function CraftBench(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [stock, setStock] = useState(START);
	const [recipeId, setRecipeId] = useState(RECIPES[0].id);
	const [qty, setQty] = useState(1);
	const [notice, setNotice] = useState("");
	const recipe = findRecipe(recipeId);
	const cap = recipe !== undefined ? batchCap(recipe, stock) : 0;
	const max = cap < 1 ? 1 : cap;
	const amount = math.clamp(qty, 1, max);
	const short = recipe !== undefined && shortOf(recipe, stock, amount);

	const pick = (id: string) => {
		setRecipeId(id);
		setQty(1);
	};
	const make = () => {
		if (recipe === undefined || short) return;
		const copy: Material[] = [];
		for (const item of stock) {
			let used = 0;
			for (const need of recipe.needs) if (need.id === item.id) used = need.count * amount;
			copy.push(used > 0 ? { ...item, owned: item.owned - used } : item);
		}
		setStock(copy);
		setNotice(`Made ${amount} ${recipe.title}`);
		setQty(1);
	};

	const picker = (
		<Stack direction="row" gap={1} wrap sx={STACK}>
			{RECIPES.map((item) => (
				<Chip key={item.id} label={item.title} variant={item.id === recipeId ? "filled" : "outlined"} color={item.id === recipeId ? "primary" : "default"} onActivated={() => pick(item.id)} />
			))}
		</Stack>
	);

	const bench =
		recipe === undefined ? (
			<EmptyListHint text="No recipe selected." height={72} />
		) : (
			<Paper sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Box
						sx={{
							Size: new UDim2(1, 0, 0, 96),
							AutomaticSize: Enum.AutomaticSize.None,
							BackgroundColor3: Color3.fromRGB(255, 255, 255),
							BackgroundTransparency: 0,
							radius: 8,
							gradient: { colors: [recipe.from, recipe.to], rotation: 18 },
						}}
					/>
					<Label text={recipe.title} sx={{ fontSize: 28 }} />
					<Label text={recipe.blurb} wrap />
					{recipe.needs.map((need) => (
						<Ingredient key={need.id} label={labelOf(stock, need.id)} owned={ownedOf(stock, need.id)} need={need.count * amount} />
					))}
					<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
						<Label text="Quantity" />
						<Qty value={amount} min={1} max={max} step={1} stepper size="small" width={new UDim(0, 48)} onChange={setQty} />
					</Stack>
					<Button text="Craft" variant="contained" disabled={short} onLeftClick={make} />
					{short ? <Label text="Short on materials." sx={{ TextColor3: theme.palette.status.error.main }} /> : <Label text="Ready to craft." sx={{ TextColor3: theme.palette.text.secondary }} />}
				</Stack>
			</Paper>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Bench unavailable" message="The bench could not open these recipes." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="text" width={narrow ? 280 : 420} height={18} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No recipes on the bench." height={72} />
		) : narrow ? (
			<Stack direction="column" gap={1} sx={STACK}>
				<Label text="Craft bench" sx={{ fontSize: 28 }} />
				{picker}
				{bench}
			</Stack>
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Label text="Craft bench" sx={{ fontSize: 28 }} />
				<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 16)} VerticalAlignment={Enum.VerticalAlignment.Top} SortOrder={Enum.SortOrder.LayoutOrder} />
					<frame LayoutOrder={0} Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						{picker}
					</frame>
					<frame LayoutOrder={1} Size={new UDim2(1, -296, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						{bench}
					</frame>
				</frame>
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Craft Bench",
	description: "A bench for recipes, counts, and a craft quantity.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <CraftBench {...args} />,
};
