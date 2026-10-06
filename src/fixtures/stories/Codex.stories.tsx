import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Button,
	Chip,
	EmptyListHint,
	Input,
	ListItem,
	Markdown,
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

interface Entry {
	id: string;
	name: string;
	kind: string;
	group: string;
	line: string;
	span: string;
	hours: string;
	temper: string;
	note: string;
	tags: string[];
	related: string[];
}

interface LabelProps {
	text?: string;
	sx?: { fontSize?: number; TextColor3?: Color3 };
}

interface LinkPayload {
	text: string;
	href: string;
}

interface NoteProps {
	value?: string;
	onLink?: (payload: LinkPayload) => void;
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const Note = Markdown as unknown as (props: NoteProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const GROUPS = ["All", "Shore", "Dune", "Ridge"];

const SEED: Entry[] = [
	{
		id: "moth",
		name: "Dune moth",
		kind: "Insect",
		group: "Dune",
		line: "Insect · Open sand",
		span: "4 cm",
		hours: "Dusk",
		temper: "Quiet",
		note: "Rests on the warm sand until the light drops.\n\nSee the [cove heron](heron) if the wind rises.",
		tags: ["Dusk", "Sand"],
		related: ["heron", "hare"],
	},
	{
		id: "heron",
		name: "Cove heron",
		kind: "Bird",
		group: "Shore",
		line: "Bird · Still water",
		span: "90 cm",
		hours: "Morning",
		temper: "Still",
		note: "Stands in the cove until the lamp is lit.\n\nThe [pier crab](crab) keeps to the boards below.",
		tags: ["Water", "Morning"],
		related: ["crab", "moth"],
	},
	{
		id: "crab",
		name: "Pier crab",
		kind: "Crab",
		group: "Shore",
		line: "Crab · Wet boards",
		span: "8 cm",
		hours: "Night",
		temper: "Wary",
		note: "Keeps under the pier when the boards creak.\n\nThe [shelf anemone](anemone) shares the low water.",
		tags: ["Night", "Boards"],
		related: ["anemone", "heron"],
	},
	{
		id: "hare",
		name: "Gate hare",
		kind: "Hare",
		group: "Dune",
		line: "Hare · Dusk path",
		span: "40 cm",
		hours: "Dusk",
		temper: "Quick",
		note: "Crosses when the field gate is still open.\n\nThe [dune moth](moth) is out at the same hour.",
		tags: ["Dusk", "Path"],
		related: ["moth", "lizard"],
	},
	{
		id: "lizard",
		name: "Ridge lizard",
		kind: "Lizard",
		group: "Ridge",
		line: "Lizard · Wind posts",
		span: "18 cm",
		hours: "Midday",
		temper: "Warm",
		note: "Holds the sunny side of the ridge mark.\n\nThe [gate hare](hare) uses the path below.",
		tags: ["Sun", "Ridge"],
		related: ["hare"],
	},
	{
		id: "anemone",
		name: "Shelf anemone",
		kind: "Anemone",
		group: "Shore",
		line: "Anemone · Low water",
		span: "12 cm",
		hours: "Tide",
		temper: "Still",
		note: "Shows while the shelf is dry, then closes.\n\nThe [pier crab](crab) walks the same line.",
		tags: ["Tide", "Still"],
		related: ["crab"],
	},
];

function matches(entry: Entry, query: string, group: string) {
	if (group !== "All" && entry.group !== group) return false;
	const needle = query.lower();
	if (needle.size() === 0) return true;
	const hay = `${entry.name} ${entry.line} ${entry.kind}`.lower();
	return string.find(hay, needle, 1, true) !== undefined;
}

function findEntry(list: Entry[], id: string) {
	for (const entry of list) if (entry.id === id) return entry;
	return undefined;
}

function Stat(props: { name: string; value: string; ink: Color3 }) {
	return (
		<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
			<Label text={props.name} sx={{ TextColor3: props.ink }} />
			<Label text={props.value} />
		</Stack>
	);
}

function Codex(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [query, setQuery] = useState("");
	const [group, setGroup] = useState("All");
	const [pickedId, setPickedId] = useState(SEED[0].id);
	const [pane, setPane] = useState<"list" | "detail">("list");
	const [notice, setNotice] = useState("");
	const ink = theme.palette.text.secondary;
	const shown: Entry[] = [];
	for (const entry of SEED) if (matches(entry, query, group)) shown.push(entry);
	const picked = findEntry(SEED, pickedId);

	const open = (id: string) => {
		setPickedId(id);
		if (narrow) setPane("detail");
	};

	const list = (
		<Stack direction="column" gap={1} sx={STACK}>
			<Label text="Field guide" sx={{ fontSize: 28 }} />
			<Input text={query} placeholder="Search entries" onTextChanged={setQuery} />
			<Stack direction="row" gap={1} wrap sx={STACK}>
				{GROUPS.map((name) => (
					<Chip key={name} label={name} selected={group === name} variant={group === name ? "filled" : "outlined"} onActivated={() => setGroup(name)} />
				))}
			</Stack>
			{shown.size() === 0 ? (
				<EmptyListHint text="Nothing in this view." height={72} />
			) : (
				shown.map((entry) => (
					<ListItem
						key={entry.id}
						text={entry.name}
						secondary={entry.line}
						selected={entry.id === pickedId}
						divider
						onActivated={() => open(entry.id)}
					/>
				))
			)}
		</Stack>
	);

	const detail =
		picked === undefined ? (
			<EmptyListHint text="No entry selected." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				{narrow ? <Button text="Back" size="small" variant="text" onLeftClick={() => setPane("list")} /> : undefined}
				<Label text={picked.name} sx={{ fontSize: 28 }} />
				<Label text={picked.line} sx={{ TextColor3: ink }} />
				<Stat name="Span" value={picked.span} ink={ink} />
				<Stat name="Hours" value={picked.hours} ink={ink} />
				<Stat name="Temper" value={picked.temper} ink={ink} />
				<Note
					value={picked.note}
					onLink={(payload) => {
						const linked = findEntry(SEED, payload.href);
						if (linked !== undefined) open(linked.id);
						else setNotice(payload.text);
					}}
				/>
				<Stack direction="row" gap={1} wrap sx={STACK}>
					{picked.tags.map((tag) => (
						<Chip key={tag} label={tag} variant="outlined" />
					))}
				</Stack>
				<Label text="Related" sx={{ TextColor3: ink }} />
				<Stack direction="row" gap={1} wrap sx={STACK}>
					{picked.related.map((id) => {
						const entry = findEntry(SEED, id);
						if (entry === undefined) return undefined;
						return <Chip key={id} label={entry.name} onActivated={() => open(id)} />;
					})}
				</Stack>
			</Stack>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Guide unavailable" message="The desk could not open this field guide." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="text" width={narrow ? 280 : 220} height={18} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No entries yet." height={72} />
		) : narrow ? (
			pane === "list" ? list : detail
		) : (
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 16)} SortOrder={Enum.SortOrder.LayoutOrder} />
				<frame LayoutOrder={0} Size={new UDim2(0, 360, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					{list}
				</frame>
				<frame LayoutOrder={1} Size={new UDim2(1, -376, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					{detail}
				</frame>
			</frame>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Codex",
	description: "A field guide with a list and a detail pane.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Codex {...args} />,
};
