import React, { useState } from "@rbxts/react";
import {
	Alert,
	Box,
	Button,
	Chip,
	Drawer,
	EmptyListHint,
	Input,
	ListItem,
	Markdown,
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

interface LinkPayload {
	text: string;
	href: string;
}

interface PreviewProps {
	value?: string;
	onLink?: (payload: LinkPayload) => void;
}

interface Place {
	id: string;
	name: string;
	kind: string;
	x: number;
	y: number;
	minutes: number;
	color: Color3;
	tags: string[];
	blurb: string;
}

const Preview = Markdown as unknown as (props: PreviewProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const KINDS = ["All", "Coast", "Ridge", "Dock", "Trail"];
const WASH = {
	colors: [Color3.fromRGB(214, 196, 150), Color3.fromRGB(126, 158, 126), Color3.fromRGB(78, 124, 138)],
	rotation: 118,
};
const WATER = {
	colors: [Color3.fromRGB(92, 150, 162), Color3.fromRGB(58, 108, 124)],
	rotation: 20,
};

const PLACES: Place[] = [
	{
		id: "dune",
		name: "North dune",
		kind: "Ridge",
		x: 0.62,
		y: 0.22,
		minutes: 25,
		color: Color3.fromRGB(186, 142, 86),
		tags: ["Open", "Wind"],
		blurb: "Late light over the open dune.\n\nThe [ridge marker](marker) is the next post if the wind stays low.",
	},
	{
		id: "cove",
		name: "Cove bench",
		kind: "Coast",
		x: 0.36,
		y: 0.7,
		minutes: 12,
		color: Color3.fromRGB(64, 122, 132),
		tags: ["Still", "Wait"],
		blurb: "A bench above the quiet water.\n\nWalk down to the [tide shelf](shelf) when the mark is clear.",
	},
	{
		id: "pier",
		name: "Quiet pier",
		kind: "Dock",
		x: 0.2,
		y: 0.56,
		minutes: 18,
		color: Color3.fromRGB(72, 108, 124),
		tags: ["Crate", "Lamp"],
		blurb: "The morning crate sits at the end of the pier.\n\nThe [field gate](gate) is the turn inland.",
	},
	{
		id: "marker",
		name: "Ridge marker",
		kind: "Ridge",
		x: 0.76,
		y: 0.38,
		minutes: 34,
		color: Color3.fromRGB(150, 112, 74),
		tags: ["Post", "View"],
		blurb: "The last post before the dune drops.\n\nStart from the [north dune](dune) if you are already up high.",
	},
	{
		id: "shelf",
		name: "Tide shelf",
		kind: "Coast",
		x: 0.5,
		y: 0.82,
		minutes: 8,
		color: Color3.fromRGB(86, 138, 146),
		tags: ["Tide", "Stone"],
		blurb: "Flat stone that shows at low water.\n\nThe [cove bench](cove) is the dry place to wait.",
	},
	{
		id: "gate",
		name: "Field gate",
		kind: "Trail",
		x: 0.54,
		y: 0.46,
		minutes: 16,
		color: Color3.fromRGB(118, 140, 88),
		tags: ["Path", "Crew"],
		blurb: "The gate between the pier path and the ridge.\n\nThe [quiet pier](pier) is downhill from here.",
	},
];

function findPlace(id: string) {
	for (const place of PLACES) {
		if (place.id === id) return place;
	}
	return PLACES[0];
}

function matches(place: Place, query: string, kind: string) {
	if (kind !== "All" && place.kind !== kind) return false;
	if (query.size() === 0) return true;
	const hay = `${place.name} ${place.kind}`.lower();
	return string.find(hay, query.lower(), 1, true) !== undefined;
}

function distance(left: Place, right: Place) {
	const dx = left.x - right.x;
	const dy = left.y - right.y;
	return math.sqrt(dx * dx + dy * dy);
}

function nearby(places: Place[], selected: string) {
	const origin = findPlace(selected);
	const copy: Place[] = [];
	for (const place of places) copy.push(place);
	copy.sort((left, right) => distance(left, origin) < distance(right, origin));
	return copy;
}

function MapPin(props: { place: Place; selected: boolean; ink: Color3; onPick: (id: string) => void }) {
	const size = props.selected ? 18 : 14;
	return (
		<Tooltip
			text={props.place.name}
			sx={{
				position: UDim2.fromScale(props.place.x, props.place.y),
				anchor: new Vector2(0.5, 0.5),
				zIndex: props.selected ? 5 : 2,
			}}
		>
			<textbutton
				Size={UDim2.fromOffset(size, size)}
				BackgroundColor3={props.place.color}
				BorderSizePixel={0}
				Text=""
				AutoButtonColor={false}
				Event={{ Activated: () => props.onPick(props.place.id) }}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
				{props.selected ? <uistroke Color={props.ink} Thickness={2} /> : undefined}
			</textbutton>
		</Tooltip>
	);
}

function MapSurface(props: { places: Place[]; selected: string; height: number; ink: Color3; onPick: (id: string) => void }) {
	return (
		<frame Size={new UDim2(1, 0, 0, props.height)} BackgroundTransparency={1} BorderSizePixel={0} ClipsDescendants>
			<Box
				sx={{
					Size: UDim2.fromScale(1, 1),
					AutomaticSize: Enum.AutomaticSize.None,
					radius: 2,
					gradient: WASH,
				}}
			/>
			<Box
				sx={{
					position: UDim2.fromScale(0, 0.62),
					Size: new UDim2(1, 0, 0.38, 0),
					AutomaticSize: Enum.AutomaticSize.None,
					gradient: WATER,
				}}
			/>
			<Box
				sx={{
					position: UDim2.fromScale(0.58, 0.08),
					Size: UDim2.fromOffset(120, 70),
					AutomaticSize: Enum.AutomaticSize.None,
					radius: 2,
					bgcolor: Color3.fromRGB(168, 148, 112),
					opacity: 0.55,
				}}
			/>
			{props.places.map((place) => (
				<MapPin key={place.id} place={place} selected={place.id === props.selected} ink={props.ink} onPick={props.onPick} />
			))}
		</frame>
	);
}

function PlaceList(props: { places: Place[]; selected: string; onPick: (id: string) => void }) {
	const ordered = nearby(props.places, props.selected);
	return (
		<Stack direction="column" gap={0} sx={STACK}>
			<Typography text="Nearby" variant="h3" sx={{ Size: new UDim2(1, 0, 0, 24) }} />
			{ordered.size() === 0 ? (
				<EmptyListHint text="No places match this search." height={72} />
			) : (
				ordered.map((place) => (
					<ListItem
						key={place.id}
						text={place.name}
						secondary={`${place.kind} · ${place.minutes} min`}
						selected={place.id === props.selected}
						divider
						onActivated={() => props.onPick(place.id)}
					/>
				))
			)}
		</Stack>
	);
}

function PlaceSheet(props: { place: Place; onLink: (payload: LinkPayload) => void; onKeep: () => void }) {
	return (
		<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
			<Typography text={props.place.kind} color="textSecondary" variant="caption" sx={{ Size: new UDim2(1, 0, 0, 16) }} />
			<Typography text={props.place.name} variant="h2" sx={{ Size: new UDim2(1, 0, 0, 32) }} />
			<Typography text={`About ${props.place.minutes} min on foot`} color="textSecondary" sx={{ Size: new UDim2(1, 0, 0, 20) }} />
			<Preview value={props.place.blurb} onLink={props.onLink} />
			<Stack direction="row" gap={1} wrap sx={STACK}>
				{props.place.tags.map((tag) => (
					<Chip key={tag} label={tag} variant="outlined" />
				))}
			</Stack>
			<Button text="Keep place" size="small" variant="contained" onLeftClick={props.onKeep} />
		</Stack>
	);
}

function WorldMap(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [query, setQuery] = useState("");
	const [kind, setKind] = useState("All");
	const [selected, setSelected] = useState("cove");
	const [pane, setPane] = useState<"map" | "list">("map");
	const [open, setOpen] = useState(false);
	const [notice, setNotice] = useState("");

	const listed: Place[] = [];
	for (const place of PLACES) {
		if (matches(place, query, kind)) listed.push(place);
	}
	const current = findPlace(selected);
	const showMap = !narrow || pane === "map";
	const showList = !narrow || pane === "list";

	const pick = (id: string) => {
		setSelected(id);
		setOpen(true);
		if (narrow) setPane("map");
	};
	const openLink = (payload: LinkPayload) => {
		pick(payload.href);
		setNotice(`Opened ${payload.text}`);
	};

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: { phone: 1, desktop: 2 } }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Field map" variant="h2" sx={{ Size: new UDim2(1, 0, 0, 32) }} />
					<Input text={query} placeholder="Search places" width={new UDim(1, 0)} onInput={setQuery} />
					<Stack direction="row" gap={1} wrap sx={STACK}>
						{KINDS.map((name) => (
							<Chip key={name} label={name} selected={kind === name} variant={kind === name ? "filled" : "outlined"} onActivated={() => setKind(name)} />
						))}
					</Stack>
					{narrow ? (
						<Stack direction="row" gap={1} sx={STACK}>
							<Button text="Map" size="small" variant={pane === "map" ? "contained" : "outlined"} onLeftClick={() => setPane("map")} />
							<Button text="List" size="small" variant={pane === "list" ? "contained" : "outlined"} onLeftClick={() => setPane("list")} />
						</Stack>
					) : undefined}
					{phase === "error" ? (
						<Alert severity="error" title="Map unavailable" message="The desk could not open this sheet." onClose={() => setPhase("ready")} />
					) : phase === "loading" ? (
						<Skeleton variant="rounded" width={narrow ? 340 : 720} height={narrow ? 420 : 520} />
					) : phase === "empty" ? (
						<EmptyListHint text="No places are marked yet." height={72} />
					) : (
						<Stack direction={narrow ? "column" : "row"} gap={2} alignItems="start" sx={STACK}>
							{showMap ? (
								<frame Size={new UDim2(narrow ? 1 : 1, narrow ? 0 : -340, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
									<MapSurface places={listed} selected={selected} height={narrow ? 460 : 560} ink={theme.palette.primary.main} onPick={pick} />
								</frame>
							) : undefined}
							{showList ? (
								<frame Size={new UDim2(narrow ? 1 : 0, narrow ? 0 : 320, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
									<PlaceList places={listed} selected={selected} onPick={pick} />
								</frame>
							) : undefined}
						</Stack>
					)}
				</Stack>
			</ScrollView>
			<Drawer open={open && phase === "ready"} edge="right" width={narrow ? 320 : 380} onClose={() => setOpen(false)}>
				<PlaceSheet place={current} onLink={openLink} onKeep={() => setNotice(`Kept ${current.name}`)} />
			</Drawer>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/World Map",
	description: "Responsive field map with pins, nearby places, and notes.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <WorldMap {...args} />,
};
