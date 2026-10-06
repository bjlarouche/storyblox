import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import { Alert, Button, Chip, EmptyListHint, ListItem, ScrollView, Skeleton, Stack, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Day {
	id: string;
	date: string;
	title: string;
	paragraphs: string[];
	quote: string;
	stat: string;
	tags: string[];
}

interface LabelProps {
	text?: string;
	wrap?: boolean;
	sx?: { fontSize?: number; TextColor3?: Color3 };
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const DAYS: Day[] = [
	{
		id: "dune",
		date: "6 Oct",
		title: "North dune",
		paragraphs: [
			"The sand was warm well after the light dropped. I walked the open face until the wind came up from the water.",
			"Tracks from the evening crossed the ridge and stopped at a flat patch. Nothing else moved while I wrote.",
		],
		quote: "Warm sand, and the wind only after the light is gone.",
		stat: "4 km · clear · dusk",
		tags: ["Sand", "Dusk"],
	},
	{
		id: "cove",
		date: "7 Oct",
		title: "Cove bench",
		paragraphs: [
			"The bench faces the still water. A heron held one spot until the lamp on the dock was lit.",
			"I stayed for the hour between the last walkers and the tide. The cove stayed quiet the whole time.",
		],
		quote: "One heron, one lamp, and an hour with no other sound.",
		stat: "1 hour · still · morning",
		tags: ["Water", "Morning"],
	},
	{
		id: "pier",
		date: "8 Oct",
		title: "Quiet pier",
		paragraphs: [
			"The boards creaked on the way out and then settled. Under them, a crab kept to the wet line.",
			"I did not go past the last post. The rail was enough, and the shower passed while I waited.",
		],
		quote: "Creak, then quiet, then the rail.",
		stat: "Short walk · wet · night",
		tags: ["Boards", "Night"],
	},
	{
		id: "gate",
		date: "9 Oct",
		title: "Field gate",
		paragraphs: [
			"The gate was still open at dusk. A hare crossed once and did not come back.",
			"I closed nothing. The path shuts itself when the light drops, and I was already on the cove side.",
		],
		quote: "Leave the gate. The light does the rest.",
		stat: "Dusk · open · one crossing",
		tags: ["Path", "Dusk"],
	},
	{
		id: "ridge",
		date: "10 Oct",
		title: "Ridge mark",
		paragraphs: [
			"The marker was the last post I could see. Wind kept the next one hidden for a long stretch.",
			"A lizard held the sunny face of the stone. I turned back when the light left the path below.",
		],
		quote: "If the next post disappears, turn around.",
		stat: "Midday · wind · turned back",
		tags: ["Ridge", "Sun"],
	},
];

function indexOfDay(id: string) {
	for (let index = 0; index < DAYS.size(); index++) if (DAYS[index].id === id) return index;
	return 0;
}

function Quote(props: { text: string; ink: Color3 }) {
	return <Label text={props.text} wrap sx={{ TextColor3: props.ink, fontSize: 18 }} />;
}

function FieldJournal(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [pickedId, setPickedId] = useState(DAYS[0].id);
	const [pane, setPane] = useState<"list" | "entry">("list");
	const ink = theme.palette.text.secondary;
	const index = indexOfDay(pickedId);
	const day = DAYS[index];

	const open = (id: string) => {
		setPickedId(id);
		if (narrow) setPane("entry");
	};
	const shift = (delta: number) => {
		const landed = index + delta;
		if (landed < 0 || landed >= DAYS.size()) return;
		open(DAYS[landed].id);
	};

	const list = (
		<Stack direction="column" gap={1} sx={STACK}>
			<Label text="Field journal" sx={{ fontSize: 28 }} />
			{DAYS.map((entry) => (
				<ListItem
					key={entry.id}
					text={entry.title}
					secondary={entry.date}
					selected={entry.id === day.id}
					divider
					onActivated={() => open(entry.id)}
				/>
			))}
		</Stack>
	);

	const entry = (
		<Stack direction="column" gap={1} sx={STACK}>
			{narrow ? <Button text="Back" size="small" variant="text" onLeftClick={() => setPane("list")} /> : undefined}
			<Label text={day.date} sx={{ TextColor3: ink }} />
			<Label text={day.title} sx={{ fontSize: 28 }} />
			{day.paragraphs.map((paragraph) => (
				<Label key={paragraph} text={paragraph} wrap />
			))}
			<Quote text={day.quote} ink={ink} />
			<Label text={day.stat} sx={{ TextColor3: ink }} />
			<Stack direction="row" gap={1} wrap sx={STACK}>
				{day.tags.map((tag) => (
					<Chip key={tag} label={tag} variant="outlined" />
				))}
			</Stack>
			<Stack direction="row" gap={1} sx={STACK}>
				<Button text="Previous" size="small" variant="outlined" disabled={index === 0} onLeftClick={() => shift(-1)} />
				<Button text="Next" size="small" variant="outlined" disabled={index === DAYS.size() - 1} onLeftClick={() => shift(1)} />
			</Stack>
		</Stack>
	);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Journal unavailable" message="The desk could not open these notes." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="text" width={narrow ? 300 : 420} height={18} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No notes yet." height={72} />
		) : narrow ? (
			pane === "list" ? list : entry
		) : (
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 16)} SortOrder={Enum.SortOrder.LayoutOrder} />
				<frame LayoutOrder={0} Size={new UDim2(0, 320, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					{list}
				</frame>
				<frame LayoutOrder={1} Size={new UDim2(1, -336, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					{entry}
				</frame>
			</frame>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Field Journal",
	description: "A reading screen for field notes.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <FieldJournal {...args} />,
};
