import React, { useState } from "@rbxts/react";
import {
	Alert,
	AppBar,
	Box,
	Button,
	Chip,
	Drawer,
	EmptyListHint,
	ImageList,
	Input,
	Menu,
	ScrollView,
	Skeleton,
	Snackbar,
	Stack,
	ToastVariants,
	Tooltip,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Asset {
	id: string;
	name: string;
	kind: "Still" | "Map" | "Note" | "Sound";
	tag: "Field" | "Water" | "Route";
	size: string;
	bytes: number;
	updated: string;
	stamp: number;
	color: Color3;
	note: string;
}

interface Tile {
	src: string;
	title?: string;
	color?: Color3;
}

interface GridProps {
	items: Tile[];
	cols?: number;
	gap?: number;
	itemSize?: number;
	aspect?: number;
	selected?: number[];
	onItemActivated?: (index: number) => void;
}

const Grid = ImageList as unknown as (props: GridProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const KINDS = ["All", "Still", "Map", "Note", "Sound"];
const TAGS = ["All", "Field", "Water", "Route"];
const SORTS = ["Recent", "Name", "Size"];

const SEED: Asset[] = [
	{ id: "dune", name: "North dune", kind: "Still", tag: "Field", size: "1.8 MB", bytes: 1800, updated: "Today", stamp: 6, color: Color3.fromRGB(196, 154, 108), note: "Late light over the open dune." },
	{ id: "harbor", name: "Harbor sketch", kind: "Still", tag: "Water", size: "940 KB", bytes: 940, updated: "Today", stamp: 5, color: Color3.fromRGB(92, 138, 148), note: "Pencil study of the quiet dock." },
	{ id: "route", name: "Field route", kind: "Map", tag: "Route", size: "420 KB", bytes: 420, updated: "Yesterday", stamp: 4, color: Color3.fromRGB(118, 146, 104), note: "Marked path from the ridge to the dock." },
	{ id: "notes", name: "Dock notes", kind: "Note", tag: "Water", size: "28 KB", bytes: 28, updated: "Yesterday", stamp: 3, color: Color3.fromRGB(214, 196, 160), note: "Tide times and supply counts." },
	{ id: "ridge", name: "Ridge wind", kind: "Sound", tag: "Field", size: "3.2 MB", bytes: 3200, updated: "Mon", stamp: 2, color: Color3.fromRGB(126, 132, 148), note: "Short recording from the ridge." },
	{ id: "pier", name: "Pier diagram", kind: "Map", tag: "Water", size: "610 KB", bytes: 610, updated: "Mon", stamp: 1, color: Color3.fromRGB(74, 108, 124), note: "Post spacing along the pier." },
	{ id: "trail", name: "Trail log", kind: "Note", tag: "Route", size: "16 KB", bytes: 16, updated: "Sun", stamp: 0, color: Color3.fromRGB(168, 140, 112), note: "Who walked the north trail." },
	{ id: "cove", name: "Cove still", kind: "Still", tag: "Water", size: "2.1 MB", bytes: 2100, updated: "Sun", stamp: -1, color: Color3.fromRGB(64, 112, 118), note: "Still water before the turn." },
];

function includesText(name: string, query: string) {
	if (query.size() === 0) return true;
	return string.find(string.lower(name), string.lower(query), 1, true) !== undefined;
}

function ordered(items: Asset[], sort: string) {
	const copy = [...items];
	copy.sort((left, right) => {
		if (sort === "Name") return left.name < right.name;
		if (sort === "Size") return left.bytes > right.bytes;
		return left.stamp > right.stamp;
	});
	return copy;
}

function pickedIndexes(items: Asset[], picked: string[]) {
	const found = new Array<number>();
	for (let index = 0; index < items.size(); index++) {
		if (picked.includes(items[index].id)) found.push(index);
	}
	return found;
}

function ChoiceRow(props: { options: string[]; value: string; onChange: (value: string) => void }) {
	return (
		<Stack direction="row" gap={1} wrap sx={STACK}>
			{props.options.map((option) => (
				<Chip
					key={option}
					label={option}
					size="small"
					selected={option === props.value}
					onActivated={() => props.onChange(option)}
				/>
			))}
		</Stack>
	);
}

function Preview(props: { asset: Asset }) {
	const asset = props.asset;
	return (
		<Box
			sx={{
				Size: new UDim2(1, 0, 0, 220),
				bgcolor: asset.color,
				gradient: { colors: [asset.color, Color3.fromRGB(244, 240, 230)], rotation: 128 },
				radius: 12,
				p: 2,
			}}
		>
			<Typography text={asset.name} variant="h6" sx={{ TextColor3: Color3.fromRGB(28, 32, 30) }} />
			<Typography text={asset.note} sx={{ TextColor3: Color3.fromRGB(28, 32, 30) }} />
		</Box>
	);
}

function MediaLibrary(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [assets, setAssets] = useState(SEED);
	const [query, setQuery] = useState("");
	const [kind, setKind] = useState("All");
	const [tag, setTag] = useState("All");
	const [sort, setSort] = useState("Recent");
	const [picked, setPicked] = useState<string[]>([]);
	const [focus, setFocus] = useState(SEED[0].id);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState<TextButton>();
	const [notice, setNotice] = useState("");

	const visible = ordered(
		assets.filter((asset) => includesText(asset.name, query) && (kind === "All" || asset.kind === kind) && (tag === "All" || asset.tag === tag)),
		sort,
	);
	const focused = assets.find((asset) => asset.id === focus) ?? visible[0];
	const toggle = (index: number) => {
		const asset = visible[index];
		if (asset === undefined) return;
		setFocus(asset.id);
		setPicked(picked.includes(asset.id) ? picked.filter((id) => id !== asset.id) : [...picked, asset.id]);
	};
	const removePicked = () => {
		setAssets(assets.filter((asset) => !picked.includes(asset.id)));
		setPicked([]);
		setNotice("Removed from library");
	};
	const openDetails = () => {
		if (focused !== undefined) setDetailsOpen(true);
	};

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<AppBar title="Library" elevation="raised">
				{phase === "error" && <Button text="Retry" size="small" variant="outlined" onLeftClick={() => setPhase("ready")} />}
			</AppBar>
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar), Size: new UDim2(1, 0, 1, -bar), p: { phone: 1, desktop: 2 } }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Input text={query} placeholder="Search assets" width={new UDim(1, 0)} onInput={setQuery} />
					<ChoiceRow options={KINDS} value={kind} onChange={setKind} />
					<ChoiceRow options={TAGS} value={tag} onChange={setTag} />
					<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
						<Typography text={`${visible.size()} assets`} color="textSecondary" />
						<Typography text={`${picked.size()} selected`} color="textSecondary" />
						<Button ref={setMenuAnchor} text={sort} size="small" variant="outlined" onLeftClick={() => setMenuOpen(true)} />
						{picked.size() > 0 && (
							<>
								<Button text="Details" size="small" variant="outlined" onLeftClick={openDetails} />
								<Tooltip text="Remove the selected assets from this library">
									<Button text="Remove" size="small" variant="outlined" onLeftClick={removePicked} />
								</Tooltip>
								<Button text="Clear" size="small" variant="text" onLeftClick={() => setPicked([])} />
							</>
						)}
					</Stack>
					{phase === "loading" ? (
						<Stack direction="row" gap={1} wrap sx={STACK}>
							{[0, 1, 2, 3].map((value) => (
								<Skeleton key={value} variant="rounded" width={narrow ? 160 : 200} height={narrow ? 120 : 150} />
							))}
						</Stack>
					) : phase === "error" ? (
						<Alert severity="error" title="Library unavailable" message="The assets could not be read." onClose={() => setPhase("ready")} />
					) : phase === "empty" || visible.size() === 0 ? (
						<EmptyListHint text="No assets match this search." height={72} />
					) : (
						<Grid
							items={visible.map((asset) => ({ src: "", title: asset.name, color: asset.color }))}
							cols={narrow ? 2 : 4}
							gap={1}
							itemSize={narrow ? 160 : 210}
							aspect={4 / 3}
							selected={pickedIndexes(visible, picked)}
							onItemActivated={toggle}
						/>
					)}
				</Stack>
			</ScrollView>
			<Menu
				anchor={menuAnchor}
				open={menuOpen}
				items={SORTS.map((id) => ({ id, text: id }))}
				selected={sort}
				onSelect={(id) => {
					setSort(id);
					setMenuOpen(false);
				}}
				onClose={() => setMenuOpen(false)}
			/>
			<Drawer open={detailsOpen && focused !== undefined} edge="right" width={narrow ? 320 : 380} onClose={() => setDetailsOpen(false)}>
				{focused !== undefined && (
					<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
						<Preview asset={focused} />
						<Typography text={focused.kind} variant="subtitle2" />
						<Typography text={focused.note} />
						<Typography text={`Tag ${focused.tag}`} color="textSecondary" />
						<Typography text={focused.size} color="textSecondary" />
						<Typography text={`Updated ${focused.updated}`} color="textSecondary" />
					</Stack>
				)}
			</Drawer>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Media Library",
	description: "Responsive asset grid with filters, selection, and preview.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <MediaLibrary {...args} />,
};
