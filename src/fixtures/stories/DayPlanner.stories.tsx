import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Button,
	Chip,
	DateRangePicker,
	Dialog,
	Drawer,
	EmptyListHint,
	FormHelperText,
	FormLabel,
	Input,
	ListItem,
	ScrollView,
	Skeleton,
	Snackbar,
	Stack,
	Tabs,
	ToastVariants,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface ClockValue {
	hour: number;
	minute: number;
}

interface ClockProps {
	value: ClockValue;
	onChange: (value: ClockValue) => void;
	step?: number;
}

interface Block {
	id: string;
	title: string;
	note: string;
	day: number;
	start: ClockValue;
	finish: ClockValue;
	tag: string;
	reminder: string;
}

const kit = Uiblox as unknown as { TimeField: (props: ClockProps) => React.Element };
const Clock = kit.TimeField;

interface RowProps {
	text: string;
	secondary?: string;
	divider?: boolean;
	wrap?: boolean;
	onActivated?: () => void;
}

const Row = ListItem as unknown as (props: RowProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const TAGS = ["Field", "Dock", "Route", "Crew"];
const REMINDERS = ["None", "10 min", "30 min"];
const VIEWS = [
	{ label: "Day", value: "day" },
	{ label: "Week", value: "week" },
];

const SEED: Block[] = [
	{ id: "crate", title: "Crate check", note: "Count the line and the lamp", day: 20261006, start: { hour: 7, minute: 30 }, finish: { hour: 8, minute: 0 }, tag: "Dock", reminder: "None" },
	{ id: "walk", title: "Ridge walk", note: "Keep the markers in sight", day: 20261006, start: { hour: 8, minute: 0 }, finish: { hour: 9, minute: 30 }, tag: "Field", reminder: "10 min" },
	{ id: "tide", title: "Tide note", note: "Read the card before anyone leaves", day: 20261006, start: { hour: 11, minute: 0 }, finish: { hour: 11, minute: 30 }, tag: "Route", reminder: "30 min" },
	{ id: "meal", title: "Crew meal", note: "At the cove bench", day: 20261007, start: { hour: 12, minute: 0 }, finish: { hour: 13, minute: 0 }, tag: "Crew", reminder: "None" },
	{ id: "lamp", title: "Lamp return", note: "Put the lamp back on the crate", day: 20261008, start: { hour: 16, minute: 0 }, finish: { hour: 16, minute: 30 }, tag: "Dock", reminder: "10 min" },
];

function leapYear(year: number) {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function monthDays(year: number, month: number) {
	if (month === 2 && leapYear(year)) return 29;
	return MONTH_LENGTHS[month - 1] ?? 30;
}

function shiftDay(stamp: number, delta: number) {
	let year = math.floor(stamp / 10000);
	let month = math.floor(stamp / 100) % 100;
	let day = (stamp % 100) + delta;
	while (day > monthDays(year, month)) {
		day -= monthDays(year, month);
		month += 1;
		if (month > 12) {
			month = 1;
			year += 1;
		}
	}
	while (day < 1) {
		month -= 1;
		if (month < 1) {
			month = 12;
			year -= 1;
		}
		day += monthDays(year, month);
	}
	return year * 10000 + month * 100 + day;
}

function dayLabel(stamp: number) {
	const month = math.floor(stamp / 100) % 100;
	const day = stamp % 100;
	return `${MONTHS[month - 1] ?? "Day"} ${day}`;
}

function clockLabel(value: ClockValue) {
	const hour = value.hour < 10 ? `0${value.hour}` : `${value.hour}`;
	const minute = value.minute < 10 ? `0${value.minute}` : `${value.minute}`;
	return `${hour}:${minute}`;
}

function minutes(value: ClockValue) {
	return value.hour * 60 + value.minute;
}

function rangesOverlap(left: Block, right: Block) {
	return minutes(left.start) < minutes(right.finish) && minutes(right.start) < minutes(left.finish);
}

function blocksOn(events: Block[], stamp: number) {
	const found: Block[] = [];
	for (const block of events) {
		if (block.day === stamp) found.push(block);
	}
	found.sort((left, right) => minutes(left.start) < minutes(right.start));
	return found;
}

function DayGroup(props: { stamp: number; events: Block[]; onOpen: (block: Block) => void }) {
	const blocks = blocksOn(props.events, props.stamp);
	return (
		<Stack direction="column" gap={0} sx={STACK}>
			<Typography text={dayLabel(props.stamp)} variant="h3" />
			{blocks.size() === 0 ? (
				<Typography text="Nothing scheduled" color="textSecondary" />
			) : (
				blocks.map((block) => (
					<Row
						key={block.id}
						text={block.title}
						secondary={`${clockLabel(block.start)}–${clockLabel(block.finish)} · ${block.tag} · ${block.note}`}
						divider
						wrap
						onActivated={() => props.onOpen(block)}
					/>
				))
			)}
		</Stack>
	);
}

function EditorFields(props: {
	title: string;
	note: string;
	start: ClockValue;
	finish: ClockValue;
	tag: string;
	reminder: string;
	error: string;
	onTitle: (value: string) => void;
	onNote: (value: string) => void;
	onStart: (value: ClockValue) => void;
	onFinish: (value: ClockValue) => void;
	onTag: (value: string) => void;
	onReminder: (value: string) => void;
}) {
	return (
		<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
			<FormLabel text="Title" />
			<Input text={props.title} placeholder="Block title" width={new UDim(1, 0)} onInput={props.onTitle} />
			<FormLabel text="Note" />
			<Input text={props.note} placeholder="What happens" width={new UDim(1, 0)} onInput={props.onNote} />
			<FormLabel text="Start" />
			<Clock value={props.start} step={15} onChange={props.onStart} />
			<FormLabel text="End" />
			<Clock value={props.finish} step={15} onChange={props.onFinish} />
			<FormLabel text="Tag" />
			<Stack direction="row" gap={1} wrap sx={STACK}>
				{TAGS.map((tag) => (
					<Chip key={tag} label={tag} selected={props.tag === tag} variant={props.tag === tag ? "filled" : "outlined"} onActivated={() => props.onTag(tag)} />
				))}
			</Stack>
			<FormLabel text="Reminder" />
			<Stack direction="row" gap={1} wrap sx={STACK}>
				{REMINDERS.map((reminder) => (
					<Chip
						key={reminder}
						label={reminder}
						selected={props.reminder === reminder}
						variant={props.reminder === reminder ? "filled" : "outlined"}
						onActivated={() => props.onReminder(reminder)}
					/>
				))}
			</Stack>
			{props.error.size() > 0 ? <FormHelperText text={props.error} hasError /> : undefined}
		</Stack>
	);
}

function DayPlanner(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [events, setEvents] = useState(SEED);
	const [day, setDay] = useState(20261006);
	const [viewYear, setViewYear] = useState(2026);
	const [viewMonth, setViewMonth] = useState(10);
	const [view, setView] = useState("day");
	const [editorOpen, setEditorOpen] = useState(false);
	const [editingId, setEditingId] = useState("");
	const [draftTitle, setDraftTitle] = useState("");
	const [draftNote, setDraftNote] = useState("");
	const [draftStart, setDraftStart] = useState<ClockValue>({ hour: 9, minute: 0 });
	const [draftFinish, setDraftFinish] = useState<ClockValue>({ hour: 10, minute: 0 });
	const [draftTag, setDraftTag] = useState("Field");
	const [draftReminder, setDraftReminder] = useState("None");
	const [draftError, setDraftError] = useState("");
	const [serial, setSerial] = useState(1);
	const [notice, setNotice] = useState("");

	const span = view === "week" ? 7 : 1;
	const stamps: number[] = [];
	for (let index = 0; index < span; index++) stamps.push(shiftDay(day, index));
	const heading = view === "week" ? `${dayLabel(stamps[0])} – ${dayLabel(stamps[stamps.size() - 1])}` : dayLabel(day);
	const visible = phase === "empty" ? [] : events;

	const openBlock = (block: Block) => {
		setEditingId(block.id);
		setDraftTitle(block.title);
		setDraftNote(block.note);
		setDraftStart(block.start);
		setDraftFinish(block.finish);
		setDraftTag(block.tag);
		setDraftReminder(block.reminder);
		setDraftError("");
		setEditorOpen(true);
	};
	const openNew = () => {
		setEditingId("");
		setDraftTitle("");
		setDraftNote("");
		setDraftStart({ hour: 9, minute: 0 });
		setDraftFinish({ hour: 10, minute: 0 });
		setDraftTag("Field");
		setDraftReminder("None");
		setDraftError("");
		setEditorOpen(true);
	};
	const move = (delta: number) => {
		const nextDay = shiftDay(day, view === "week" ? delta * 7 : delta);
		setDay(nextDay);
		setViewYear(math.floor(nextDay / 10000));
		setViewMonth(math.floor(nextDay / 100) % 100);
	};
	const save = () => {
		const title = draftTitle.gsub("^%s*(.-)%s*$", "%1")[0];
		if (title.size() < 2) {
			setDraftError("Add a title");
			return;
		}
		if (minutes(draftFinish) <= minutes(draftStart)) {
			setDraftError("End must be after the start");
			return;
		}
		const targetDay = editingId.size() > 0 ? (events.find((block) => block.id === editingId)?.day ?? day) : day;
		const candidate: Block = {
			id: editingId.size() > 0 ? editingId : `block-${serial}`,
			title,
			note: draftNote,
			day: targetDay,
			start: draftStart,
			finish: draftFinish,
			tag: draftTag,
			reminder: draftReminder,
		};
		for (const block of events) {
			if (block.id === candidate.id || block.day !== candidate.day) continue;
			if (rangesOverlap(block, candidate)) {
				setDraftError("That overlaps another block");
				return;
			}
		}
		if (editingId.size() === 0) setSerial(serial + 1);
		const rest: Block[] = [];
		for (const block of events) {
			if (block.id !== candidate.id) rest.push(block);
		}
		rest.push(candidate);
		setEvents(rest);
		setEditorOpen(false);
		setNotice("Block saved");
	};
	const removeBlock = () => {
		setEvents(events.filter((block) => block.id !== editingId));
		setEditorOpen(false);
		setNotice("Block removed");
	};

	const fields = (
		<EditorFields
			title={draftTitle}
			note={draftNote}
			start={draftStart}
			finish={draftFinish}
			tag={draftTag}
			reminder={draftReminder}
			error={draftError}
			onTitle={(value) => {
				setDraftTitle(value);
				setDraftError("");
			}}
			onNote={setDraftNote}
			onStart={setDraftStart}
			onFinish={setDraftFinish}
			onTag={setDraftTag}
			onReminder={setDraftReminder}
		/>
	);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: { phone: 1, desktop: 2 } }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Stack direction={narrow ? "column" : "row"} gap={1} alignItems="center" sx={STACK}>
						<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
							<Button text="Prev" size="small" variant="outlined" onLeftClick={() => move(-1)} />
							<Typography text={heading} variant="h3" />
							<Button text="Next" size="small" variant="outlined" onLeftClick={() => move(1)} />
						</Stack>
						<Tabs value={view} options={VIEWS} onChange={setView} />
						<Button text="New block" size="small" variant="contained" onLeftClick={openNew} />
					</Stack>
					{phase === "error" ? (
						<Alert severity="error" title="Planner unavailable" message="The desk could not open this day." onClose={() => setPhase("ready")} />
					) : phase === "loading" ? (
						<Stack direction="column" gap={1} sx={STACK}>
							{[0, 1, 2, 3].map((value) => (
								<Skeleton key={value} variant="text" width={narrow ? 280 : 420} height={18} />
							))}
						</Stack>
					) : (
						<Stack direction={narrow ? "column" : "row"} gap={2} alignItems="start" sx={STACK}>
							{narrow ? undefined : (
								<frame Size={new UDim2(0, 300, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
									<DateRangePicker
										year={viewYear}
										month={viewMonth}
										value={{ start: day, finish: day }}
										onChange={(value) => {
											if (value.start === undefined) return;
											setDay(value.start);
										}}
										onMonthChange={(year, month) => {
											setViewYear(year);
											setViewMonth(month);
										}}
									/>
								</frame>
							)}
							<frame Size={new UDim2(narrow ? 1 : 1, narrow ? 0 : -320, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
								{phase === "empty" ? (
									<EmptyListHint text="Nothing is scheduled." height={72} />
								) : (
									<Stack direction="column" gap={2} sx={STACK}>
										{stamps.map((stamp) => (
											<DayGroup key={stamp} stamp={stamp} events={visible} onOpen={openBlock} />
										))}
									</Stack>
								)}
							</frame>
						</Stack>
					)}
				</Stack>
			</ScrollView>
			{narrow ? (
				<Drawer open={editorOpen} edge="right" width={320} onClose={() => setEditorOpen(false)}>
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography text={editingId.size() > 0 ? "Edit block" : "New block"} variant="h3" sx={{ ...STACK, p: 2 }} />
						{fields}
						<Stack direction="row" gap={1} sx={{ ...STACK, p: 2 }}>
							<Button text="Cancel" size="small" variant="text" onLeftClick={() => setEditorOpen(false)} />
							{editingId.size() > 0 ? <Button text="Remove" size="small" variant="outlined" onLeftClick={removeBlock} /> : undefined}
							<Button text="Save" size="small" variant="contained" onLeftClick={save} />
						</Stack>
					</Stack>
				</Drawer>
			) : (
				<Dialog
					open={editorOpen}
					title={editingId.size() > 0 ? "Edit block" : "New block"}
					onClose={() => setEditorOpen(false)}
					actions={
						<>
							<Button text="Cancel" size="small" variant="text" onLeftClick={() => setEditorOpen(false)} />
							{editingId.size() > 0 ? <Button text="Remove" size="small" variant="outlined" onLeftClick={removeBlock} /> : undefined}
							<Button text="Save" size="small" variant="contained" onLeftClick={save} />
						</>
					}
				>
					{fields}
				</Dialog>
			)}
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Day Planner",
	description: "Responsive day and week agenda with timed blocks.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <DayPlanner {...args} />,
};
