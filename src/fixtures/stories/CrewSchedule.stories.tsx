import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Button,
	Chip,
	Drawer,
	EmptyListHint,
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

interface ClockValue {
	hour: number;
	minute: number;
}

interface Shift {
	person: string;
	day: string;
	role: string;
	start: ClockValue;
	finish: ClockValue;
}

interface LabelProps {
	text?: string;
	sx?: { fontSize?: number; TextColor3?: Color3 };
}

interface GridColumn {
	id: string;
	label: string;
}

interface GridRow {
	id: string;
	label: string;
	cells: { columnId: string; text?: string }[];
}

interface RosterProps {
	columns: GridColumn[];
	rows: GridRow[];
	narrow?: boolean;
	day?: number;
	empty?: string;
	onCell?: (rowId: string, columnId: string) => void;
}

interface ClockProps {
	value: ClockValue;
	onChange: (value: ClockValue) => void;
}

interface FormState {
	person: string;
	day: string;
	role: string;
	start: ClockValue;
	finish: ClockValue;
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const Roster = (Uiblox as unknown as { WeekGrid: (props: RosterProps) => React.Element }).WeekGrid;
const Clock = (Uiblox as unknown as { TimeField: (props: ClockProps) => React.Element }).TimeField;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const ROLES = ["Gate", "Lamp", "Desk", "Pier"];
const DAYS: GridColumn[] = [
	{ id: "mon", label: "Mon 6" },
	{ id: "tue", label: "Tue 7" },
	{ id: "wed", label: "Wed 8" },
	{ id: "thu", label: "Thu 9" },
	{ id: "fri", label: "Fri 10" },
	{ id: "sat", label: "Sat 11" },
	{ id: "sun", label: "Sun 12" },
];
const PEOPLE = [
	{ id: "mara", label: "Mara Voss" },
	{ id: "owen", label: "Owen Pell" },
	{ id: "ivo", label: "Ivo Lane" },
	{ id: "desk", label: "Desk notes" },
	{ id: "rae", label: "Rae Quinn" },
];

const SEED: Shift[] = [
	{ person: "mara", day: "mon", role: "Gate", start: { hour: 7, minute: 0 }, finish: { hour: 15, minute: 0 } },
	{ person: "mara", day: "wed", role: "Lamp", start: { hour: 15, minute: 0 }, finish: { hour: 21, minute: 0 } },
	{ person: "mara", day: "fri", role: "Desk", start: { hour: 9, minute: 0 }, finish: { hour: 17, minute: 0 } },
	{ person: "owen", day: "tue", role: "Pier", start: { hour: 8, minute: 0 }, finish: { hour: 12, minute: 0 } },
	{ person: "owen", day: "thu", role: "Gate", start: { hour: 7, minute: 0 }, finish: { hour: 15, minute: 0 } },
	{ person: "owen", day: "sat", role: "Lamp", start: { hour: 15, minute: 0 }, finish: { hour: 21, minute: 0 } },
	{ person: "ivo", day: "mon", role: "Desk", start: { hour: 9, minute: 0 }, finish: { hour: 17, minute: 0 } },
	{ person: "ivo", day: "tue", role: "Desk", start: { hour: 9, minute: 0 }, finish: { hour: 17, minute: 0 } },
	{ person: "ivo", day: "fri", role: "Pier", start: { hour: 8, minute: 0 }, finish: { hour: 12, minute: 0 } },
	{ person: "desk", day: "wed", role: "Gate", start: { hour: 7, minute: 0 }, finish: { hour: 15, minute: 0 } },
	{ person: "desk", day: "sun", role: "Lamp", start: { hour: 15, minute: 0 }, finish: { hour: 21, minute: 0 } },
	{ person: "rae", day: "thu", role: "Pier", start: { hour: 8, minute: 0 }, finish: { hour: 12, minute: 0 } },
	{ person: "rae", day: "sat", role: "Desk", start: { hour: 9, minute: 0 }, finish: { hour: 17, minute: 0 } },
	{ person: "rae", day: "sun", role: "Gate", start: { hour: 7, minute: 0 }, finish: { hour: 15, minute: 0 } },
];

function personLabel(id: string) {
	for (const person of PEOPLE) if (person.id === id) return person.label;
	return id;
}

function dayLabel(id: string) {
	for (const day of DAYS) if (day.id === id) return day.label;
	return id;
}

function findShift(shifts: Shift[], person: string, day: string) {
	for (const shift of shifts) if (shift.person === person && shift.day === day) return shift;
	return undefined;
}

function hasRole(shifts: Shift[], person: string, role: string) {
	if (role === "All") return true;
	for (const shift of shifts) if (shift.person === person && shift.role === role) return true;
	return false;
}

function CrewSchedule(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [shifts, setShifts] = useState(SEED);
	const [filter, setFilter] = useState("All");
	const [dayIndex, setDayIndex] = useState(0);
	const [form, setForm] = useState<FormState | undefined>(undefined);
	const [notice, setNotice] = useState("");

	const rows: GridRow[] = [];
	for (const person of PEOPLE) {
		if (!hasRole(shifts, person.id, filter)) continue;
		const cells: { columnId: string; text?: string }[] = [];
		for (const day of DAYS) {
			const shift = findShift(shifts, person.id, day.id);
			const shown = shift !== undefined && (filter === "All" || shift.role === filter);
			if (shown && shift !== undefined) cells.push({ columnId: day.id, text: shift.role });
		}
		rows.push({ id: person.id, label: person.label, cells });
	}

	const openCell = (person: string, day: string) => {
		const found = findShift(shifts, person, day);
		setForm({
			person,
			day,
			role: found !== undefined ? found.role : filter === "All" ? "Gate" : filter,
			start: found !== undefined ? found.start : { hour: 9, minute: 0 },
			finish: found !== undefined ? found.finish : { hour: 17, minute: 0 },
		});
	};
	const save = () => {
		if (form === undefined) return;
		const copy: Shift[] = [];
		let replaced = false;
		for (const shift of shifts) {
			if (shift.person === form.person && shift.day === form.day) {
				copy.push({ person: form.person, day: form.day, role: form.role, start: form.start, finish: form.finish });
				replaced = true;
			} else copy.push(shift);
		}
		if (!replaced) copy.push({ person: form.person, day: form.day, role: form.role, start: form.start, finish: form.finish });
		setShifts(copy);
		setNotice(`Kept ${personLabel(form.person)} on ${dayLabel(form.day)}`);
		setForm(undefined);
	};
	const clear = () => {
		if (form === undefined) return;
		const copy: Shift[] = [];
		for (const shift of shifts) if (shift.person !== form.person || shift.day !== form.day) copy.push(shift);
		setShifts(copy);
		setNotice(`Cleared ${personLabel(form.person)} on ${dayLabel(form.day)}`);
		setForm(undefined);
	};
	const moveDay = (delta: number) => {
		const landed = dayIndex + delta;
		if (landed < 0 || landed >= DAYS.size()) return;
		setDayIndex(landed);
	};

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Roster unavailable" message="The desk could not open this week." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="text" width={narrow ? 280 : 640} height={18} />
				))}
			</Stack>
		) : phase === "empty" || rows.size() === 0 ? (
			<EmptyListHint text={phase === "empty" ? "No crew this week." : "No one on that shift."} height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Label text="Crew schedule" sx={{ fontSize: 28 }} />
				<Label text="6 Oct to 12 Oct" sx={{ TextColor3: theme.palette.text.secondary }} />
				<Stack direction="row" gap={1} wrap sx={STACK}>
					{["All", ...ROLES].map((role) => (
						<Chip key={role} label={role} variant={filter === role ? "filled" : "outlined"} color={filter === role ? "primary" : "default"} onActivated={() => setFilter(role)} />
					))}
				</Stack>
				{narrow ? (
					<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
						<Button text="Earlier" size="small" variant="text" disabled={dayIndex === 0} onLeftClick={() => moveDay(-1)} />
						<Label text={DAYS[dayIndex].label} />
						<Button text="Later" size="small" variant="text" disabled={dayIndex === DAYS.size() - 1} onLeftClick={() => moveDay(1)} />
					</Stack>
				) : undefined}
				<Roster
					columns={DAYS}
					rows={rows}
					narrow={narrow}
					day={dayIndex}
					empty="Off"
					onCell={openCell}
				/>
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<Drawer open={form !== undefined} edge="right" width={narrow ? 320 : 400} onClose={() => setForm(undefined)}>
				{form !== undefined ? (
					<Stack direction="column" gap={1} sx={STACK}>
						<Label text={personLabel(form.person)} sx={{ fontSize: 22 }} />
						<Label text={dayLabel(form.day)} sx={{ TextColor3: theme.palette.text.secondary }} />
						<Label text="Start" sx={{ fontSize: 12 }} />
						<Clock value={form.start} onChange={(value) => setForm({ ...form, start: value })} />
						<Label text="Finish" sx={{ fontSize: 12 }} />
						<Clock value={form.finish} onChange={(value) => setForm({ ...form, finish: value })} />
						<Stack direction="row" gap={1} wrap sx={STACK}>
							{ROLES.map((role) => (
								<Chip key={role} label={role} variant={form.role === role ? "filled" : "outlined"} color={form.role === role ? "primary" : "default"} onActivated={() => setForm({ ...form, role })} />
							))}
						</Stack>
						<Stack direction="row" gap={1} sx={STACK}>
							<Button text="Save" size="small" variant="contained" onLeftClick={save} />
							<Button text="Clear" size="small" variant="text" onLeftClick={clear} />
						</Stack>
					</Stack>
				) : undefined}
			</Drawer>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Crew Schedule",
	description: "A week roster with one row per person.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <CrewSchedule {...args} />,
};
