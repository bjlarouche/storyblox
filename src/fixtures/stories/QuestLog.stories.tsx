import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Button,
	Chip,
	Dialog,
	EmptyListHint,
	LinearProgress,
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

type QuestStatus = "Open" | "Tracked" | "Done" | "Dropped";

interface Objective {
	name: string;
	done: number;
	total: number;
}

interface Quest {
	id: string;
	title: string;
	summary: string;
	status: QuestStatus;
	reward: string;
	note: string;
	objectives: Objective[];
}

interface LabelProps {
	text?: string;
	wrap?: boolean;
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

interface RowProps {
	text: string;
	secondary?: string;
	wrap?: boolean;
	selected?: boolean;
	divider?: boolean;
	onActivated?: () => void;
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const Note = Markdown as unknown as (props: NoteProps) => React.Element;
const Row = ListItem as unknown as (props: RowProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const SEED: Quest[] = [
	{
		id: "tide",
		title: "Tide count",
		summary: "Count what the morning left on the dock before the water comes back.",
		status: "Open",
		reward: "A line in the dock book",
		note: "Two crates are still out, and the lamp is already back.\n\nThe [dusk gate](gate) closes if you stay past the light.",
		objectives: [
			{ name: "Morning crates", done: 2, total: 3 },
			{ name: "Dock lamp", done: 1, total: 1 },
		],
	},
	{
		id: "gate",
		title: "Dusk gate",
		summary: "Be on the cove side of the field gate before it shuts.",
		status: "Tracked",
		reward: "The path noted as closed",
		note: "The gate shuts when the light drops. Wait at the cove bench if you are still out.",
		objectives: [
			{ name: "Reach the path", done: 1, total: 1 },
			{ name: "Watch the light", done: 1, total: 1 },
		],
	},
	{
		id: "ridge",
		title: "Ridge posts",
		summary: "Walk the posts until the ridge mark, then turn back if the wind hides the next one.",
		status: "Open",
		reward: "A dry line on the walk",
		note: "Keep the last post you can see. The lizard on the stone is not part of the count.",
		objectives: [
			{ name: "First post", done: 1, total: 1 },
			{ name: "Ridge mark", done: 0, total: 1 },
		],
	},
	{
		id: "pier",
		title: "Pier shower",
		summary: "Wait out the rain at the last post on the pier.",
		status: "Done",
		reward: "A dry hour under the rail",
		note: "The boards settled after the creak. The crab stayed on the wet line.",
		objectives: [
			{ name: "Reach the last post", done: 1, total: 1 },
			{ name: "Wait out the rain", done: 1, total: 1 },
		],
	},
	{
		id: "cove",
		title: "Cove lamp",
		summary: "See the lamp lit and leave the bench as you found it.",
		status: "Dropped",
		reward: "Nothing owed",
		note: "Set aside. The heron was still there, and the lamp came on without help.",
		objectives: [{ name: "Lamp lit", done: 0, total: 1 }],
	},
];

function readyToTurnIn(quest: Quest) {
	if (quest.status === "Done" || quest.status === "Dropped") return false;
	for (const objective of quest.objectives) if (objective.done < objective.total) return false;
	return true;
}

function findQuest(list: Quest[], id: string) {
	for (const quest of list) if (quest.id === id) return quest;
	return undefined;
}

function ObjectiveRow(props: { objective: Objective }) {
	const ratio = props.objective.total > 0 ? props.objective.done / props.objective.total : 0;
	return (
		<Stack direction="column" gap={0} sx={STACK}>
			<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
				<frame Size={new UDim2(1, -48, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					<Label text={props.objective.name} wrap />
				</frame>
				<Label text={`${props.objective.done}/${props.objective.total}`} />
			</Stack>
			<LinearProgress value={ratio} sx={{ Size: new UDim2(1, 0, 0, 8) }} />
		</Stack>
	);
}

function QuestLog(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [quests, setQuests] = useState(SEED);
	const [pickedId, setPickedId] = useState(SEED[0].id);
	const [pane, setPane] = useState<"list" | "detail">("list");
	const [turnIn, setTurnIn] = useState(false);
	const [notice, setNotice] = useState("");
	const picked = findQuest(quests, pickedId);

	const open = (id: string) => {
		setPickedId(id);
		setTurnIn(false);
		if (narrow) setPane("detail");
	};
	const setStatus = (id: string, status: QuestStatus, message: string) => {
		const copy: Quest[] = [];
		for (const quest of quests) copy.push(quest.id === id ? { ...quest, status } : quest);
		setQuests(copy);
		setNotice(message);
		setTurnIn(false);
	};

	const list = (
		<Stack direction="column" gap={1} sx={STACK}>
			<Label text="Quest log" sx={{ fontSize: 28 }} />
			{quests.map((quest) => (
				<frame key={quest.id} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					<uilistlayout FillDirection={Enum.FillDirection.Horizontal} VerticalAlignment={Enum.VerticalAlignment.Center} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
					<frame LayoutOrder={0} Size={new UDim2(1, -96, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						<Row text={quest.title} secondary={quest.summary} wrap selected={quest.id === pickedId} divider onActivated={() => open(quest.id)} />
					</frame>
					<Chip label={quest.status} variant={quest.status === "Tracked" || quest.status === "Done" ? "filled" : "outlined"} color={quest.status === "Tracked" ? "primary" : "default"} />
				</frame>
			))}
		</Stack>
	);

	const detail =
		picked === undefined ? (
			<EmptyListHint text="No quest selected." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				{narrow ? <Button text="Back" size="small" variant="text" onLeftClick={() => setPane("list")} /> : undefined}
				<Label text={picked.title} sx={{ fontSize: 28 }} />
				<Chip label={picked.status} variant={picked.status === "Tracked" || picked.status === "Done" ? "filled" : "outlined"} color={picked.status === "Tracked" ? "primary" : "default"} />
				<Label text={picked.summary} wrap />
				{picked.objectives.map((objective) => (
					<ObjectiveRow key={objective.name} objective={objective} />
				))}
				<Label text={`Reward: ${picked.reward}`} sx={{ TextColor3: theme.palette.text.secondary }} />
				<Note
					value={picked.note}
					onLink={(payload) => {
						const linked = findQuest(quests, payload.href);
						if (linked !== undefined) open(linked.id);
						else setNotice(payload.text);
					}}
				/>
				{picked.status !== "Done" ? (
					<Stack direction="row" gap={1} wrap sx={STACK}>
						<Button
							text={picked.status === "Tracked" ? "Tracking" : "Track"}
							size="small"
							variant={picked.status === "Tracked" ? "contained" : "outlined"}
							disabled={picked.status === "Dropped"}
							onLeftClick={() => setStatus(picked.id, "Tracked", `Tracking ${picked.title}`)}
						/>
						<Button
							text="Drop"
							size="small"
							variant="text"
							disabled={picked.status === "Dropped"}
							onLeftClick={() => setStatus(picked.id, "Dropped", `Dropped ${picked.title}`)}
						/>
						<Button text="Turn in" size="small" variant="contained" disabled={!readyToTurnIn(picked)} onLeftClick={() => setTurnIn(true)} />
					</Stack>
				) : (
					<Label text="Turned in." sx={{ TextColor3: theme.palette.text.secondary }} />
				)}
			</Stack>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Log unavailable" message="The desk could not open this list." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="text" width={narrow ? 300 : 240} height={18} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No quests yet." height={72} />
		) : narrow ? (
			pane === "list" ? list : detail
		) : (
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 16)} SortOrder={Enum.SortOrder.LayoutOrder} />
				<frame LayoutOrder={0} Size={new UDim2(0, 420, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					{list}
				</frame>
				<frame LayoutOrder={1} Size={new UDim2(1, -436, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					{detail}
				</frame>
			</frame>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<Dialog
				open={turnIn && picked !== undefined}
				title="Turn in"
				onClose={() => setTurnIn(false)}
				actions={
					<>
						<Button text="Cancel" size="small" variant="text" onLeftClick={() => setTurnIn(false)} />
						<Button
							text="Turn in"
							size="small"
							variant="contained"
							disabled={picked === undefined || !readyToTurnIn(picked)}
							onLeftClick={() => {
								if (picked !== undefined) setStatus(picked.id, "Done", `Turned in ${picked.title}`);
							}}
						/>
					</>
				}
			>
				{picked !== undefined ? <Label text={`Hand ${picked.title} to the desk. Reward: ${picked.reward}.`} wrap /> : undefined}
			</Dialog>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Quest Log",
	description: "A quest list with objectives, a note, and turn-in.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <QuestLog {...args} />,
};
