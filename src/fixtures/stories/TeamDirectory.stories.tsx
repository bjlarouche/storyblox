import React, { useState } from "@rbxts/react";
import {
	Alert,
	AppBar,
	Avatar,
	Badge,
	Button,
	Checkbox,
	Chip,
	Dialog,
	Drawer,
	FormHelperText,
	Input,
	Menu,
	Pagination,
	Paper,
	ScrollView,
	Select,
	Skeleton,
	Stack,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { Sparkline, Table, useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
	page: number;
	menuOpen: boolean;
	editorOpen: boolean;
}

interface Person {
	id: string;
	name: string;
	role: string;
	team: string;
	status: string;
	activity: number[];
}

interface Draft {
	id?: string;
	name: string;
	role: string;
	team: string;
	status: string;
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const PAGE = 6;
const TEAMS = ["All", "Studio", "Field", "Archive"];
const ROLES = ["Designer", "Editor", "Producer", "Guide"];
const STATUSES = ["All", "Active", "Away", "Invited"];
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const COLUMNS = [
	{ header: "", width: 0.06 },
	{ header: "Name", flex: 2.4, sortable: true },
	{ header: "Role", flex: 1.2, sortable: true },
	{ header: "Team", flex: 1.2, sortable: true },
	{ header: "Status", flex: 1.3 },
	{ header: "Activity", width: 0.16 },
	{ header: "", width: 0.1, align: "right" },
];

const SEED: Person[] = [
	{ id: "avery", name: "Avery Cole", role: "Designer", team: "Studio", status: "Active", activity: [2, 4, 3, 6, 5, 7] },
	{ id: "blair", name: "Blair Nguyen", role: "Editor", team: "Field", status: "Away", activity: [5, 4, 4, 2, 3, 1] },
	{ id: "casey", name: "Casey Ortiz", role: "Producer", team: "Archive", status: "Active", activity: [1, 2, 2, 3, 4, 4] },
	{ id: "devon", name: "Devon Shah", role: "Guide", team: "Studio", status: "Invited", activity: [0, 0, 1, 1, 2, 1] },
	{ id: "ellis", name: "Ellis Park", role: "Designer", team: "Field", status: "Active", activity: [3, 3, 5, 4, 6, 6] },
	{ id: "frankie", name: "Frankie Adeyemi", role: "Editor", team: "Archive", status: "Away", activity: [4, 3, 2, 2, 1, 2] },
	{ id: "greer", name: "Greer Holtz", role: "Producer", team: "Studio", status: "Active", activity: [2, 3, 3, 5, 4, 6] },
	{ id: "harper", name: "Harper Quinn", role: "Guide", team: "Field", status: "Active", activity: [1, 2, 4, 3, 3, 5] },
	{ id: "indigo", name: "Indigo Marlow", role: "Designer", team: "Archive", status: "Invited", activity: [0, 1, 1, 0, 2, 1] },
	{ id: "jordan", name: "Jordan Blake", role: "Editor", team: "Studio", status: "Active", activity: [4, 5, 5, 6, 7, 6] },
	{ id: "kai", name: "Kai Petrov", role: "Producer", team: "Field", status: "Away", activity: [6, 5, 3, 3, 2, 2] },
	{ id: "lane", name: "Lane Okonkwo", role: "Guide", team: "Archive", status: "Active", activity: [2, 2, 3, 3, 4, 5] },
];

function hasId(ids: string[], id: string) {
	for (const item of ids) if (item === id) return true;
	return false;
}

function fieldOf(person: Person, column: number) {
	if (column === 2) return person.role;
	if (column === 3) return person.team;
	return person.name;
}

function listed(people: Person[], query: string, team: string, status: string, column: number, direction: string, phase: Args["phase"]) {
	const rows: Person[] = [];
	if (phase === "empty") return rows;
	const needle = string.lower(query);
	for (const person of people) {
		if (team !== "All" && person.team !== team) continue;
		if (status !== "All" && person.status !== status) continue;
		if (needle.size() > 0 && string.find(string.lower(person.name), needle, 1, true) === undefined) continue;
		rows.push(person);
	}
	rows.sort((a, b) => {
		const left = fieldOf(a, column);
		const right = fieldOf(b, column);
		return direction === "desc" ? right < left : left < right;
	});
	return rows;
}

function pageSlice(rows: Person[], page: number) {
	const start = (page - 1) * PAGE;
	const slice: Person[] = [];
	for (let index = 0; index < rows.size(); index++) {
		if (index >= start && index < start + PAGE) slice.push(rows[index]);
	}
	return slice;
}

function countStatus(rows: Person[], status: string) {
	let total = 0;
	for (const row of rows) if (row.status === status) total += 1;
	return total;
}

function badgeColor(status: string): "success" | "error" | "primary" {
	if (status === "Away") return "error";
	if (status === "Invited") return "primary";
	return "success";
}

function TextLine(props: { text: string; variant?: "h3" | "body" | "caption"; color?: "textPrimary" | "textSecondary" }) {
	return (
		<Typography
			text={props.text}
			variant={props.variant ?? "body"}
			color={props.color ?? "textPrimary"}
			sx={{ Size: new UDim2(1, 0, 0, props.variant === "h3" ? 28 : 20), AutomaticSize: Enum.AutomaticSize.None }}
		/>
	);
}

function NameCell(props: { name: string }) {
	const { theme } = useTheme();
	return (
		<frame Size={new UDim2(1, 0, 0, 28)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} VerticalAlignment={Enum.VerticalAlignment.Center} Padding={new UDim(0, 8)} />
			<Avatar name={props.name} size={28} />
			<textlabel
				Text={props.name}
				Size={new UDim2(1, -36, 1, 0)}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.body}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>
		</frame>
	);
}

function StatusCell(props: { status: string }) {
	const { theme } = useTheme();
	return (
		<Badge variant="dot" color={badgeColor(props.status)}>
			<textlabel
				Text={props.status}
				AutomaticSize={Enum.AutomaticSize.XY}
				Size={new UDim2(0, 0, 0, 0)}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.body}
				TextColor3={theme.palette.text.primary}
			/>
		</Badge>
	);
}

function MoreButton(props: { id: string; onOpen: (anchor: TextButton, id: string) => void }) {
	const [button, setButton] = useState<TextButton>();
	return (
		<Button
			ref={setButton}
			text="More"
			variant="text"
			size="small"
			onLeftClick={() => button !== undefined && props.onOpen(button, props.id)}
		/>
	);
}

function Summary(props: { rows: Person[] }) {
	const cards = [
		{ label: "People", value: tostring(props.rows.size()) },
		{ label: "Active", value: tostring(countStatus(props.rows, "Active")) },
		{ label: "Away", value: tostring(countStatus(props.rows, "Away")) },
	];
	return (
		<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 8)} />
			{cards.map((card) => (
				<Paper key={card.label} elevation="flat" sx={{ Size: new UDim2(0.33, -8, 0, 0), AutomaticSize: Enum.AutomaticSize.Y, p: 2 }}>
					<Stack direction="column" gap={1} sx={STACK}>
						<TextLine text={card.label} variant="caption" color="textSecondary" />
						<TextLine text={card.value} variant="h3" />
					</Stack>
				</Paper>
			))}
		</frame>
	);
}

function MemberForm(props: { draft: Draft; onChange: (draft: Draft) => void }) {
	const draft = props.draft;
	const named = draft.name.size() >= 2;
	return (
		<Stack direction="column" gap={1} sx={STACK}>
			<Input text={draft.name} placeholder="Name" onTextChanged={(text: string) => props.onChange({ ...draft, name: text })} />
			{!named && <FormHelperText text="Use at least 2 characters." hasError />}
			<Select
				value={draft.role}
				options={ROLES.map((role) => ({ label: role, value: role }))}
				onChange={(role: string) => props.onChange({ ...draft, role })}
				sx={{ Size: new UDim2(1, 0, 0, 36) }}
			/>
			<Select
				value={draft.team}
				options={["Studio", "Field", "Archive"].map((team) => ({ label: team, value: team }))}
				onChange={(team: string) => props.onChange({ ...draft, team })}
				sx={{ Size: new UDim2(1, 0, 0, 36) }}
			/>
			<Select
				value={draft.status}
				options={["Active", "Away", "Invited"].map((status) => ({ label: status, value: status }))}
				onChange={(status: string) => props.onChange({ ...draft, status })}
				sx={{ Size: new UDim2(1, 0, 0, 36) }}
			/>
		</Stack>
	);
}

function blankDraft(): Draft {
	return { name: "", role: "Designer", team: "Studio", status: "Invited" };
}

function TeamDirectory(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const [phase, setPhase] = useArg(args.phase);
	const [page, setPage] = useArg(args.page);
	const [menuOpen, setMenuOpen] = useArg(args.menuOpen);
	const [editorOpen, setEditorOpen] = useArg(args.editorOpen);
	const [query, setQuery] = useState("");
	const [team, setTeam] = useState("All");
	const [status, setStatus] = useState("All");
	const [sortColumn, setSortColumn] = useState(1);
	const [sortDirection, setSortDirection] = useState("asc");
	const [people, setPeople] = useState(SEED);
	const [picked, setPicked] = useState<string[]>([]);
	const [selectedId, setSelectedId] = useState<string>();
	const [draft, setDraft] = useState<Draft>(blankDraft());
	const [anchor, setAnchor] = useState<TextButton>();
	const [menuId, setMenuId] = useState<string>();

	const rows = listed(people, query, team, status, sortColumn, sortDirection, phase);
	const count = math.max(1, math.ceil(rows.size() / PAGE));
	const shownPage = math.clamp(page, 1, count);
	const slice = pageSlice(rows, shownPage);
	let selectedIndex: number | undefined;
	for (let index = 0; index < slice.size(); index++) {
		if (slice[index].id === selectedId) selectedIndex = index;
	}

	const toggle = (id: string, value: boolean) => {
		if (value && !hasId(picked, id)) setPicked([...picked, id]);
		else if (!value) {
			const rest: string[] = [];
			for (const item of picked) if (item !== id) rest.push(item);
			setPicked(rest);
		}
	};
	const openNew = () => {
		setDraft(blankDraft());
		setEditorOpen(true);
	};
	const openEdit = (person: Person) => {
		setDraft({ id: person.id, name: person.name, role: person.role, team: person.team, status: person.status });
		setEditorOpen(true);
		setMenuOpen(false);
	};
	const save = () => {
		if (draft.name.size() < 2) return;
		if (draft.id === undefined) {
			const created: Person = {
				id: `person-${people.size() + 1}`,
				name: draft.name,
				role: draft.role,
				team: draft.team,
				status: draft.status,
				activity: [1, 1, 2, 2, 3],
			};
			const nextPeople = [...people, created];
			setPeople(nextPeople);
		} else {
			const nextPeople: Person[] = [];
			for (const person of people) {
				if (person.id !== draft.id) nextPeople.push(person);
				else nextPeople.push({ ...person, name: draft.name, role: draft.role, team: draft.team, status: draft.status });
			}
			setPeople(nextPeople);
		}
		setEditorOpen(false);
	};
	const removeIds = (ids: string[]) => {
		const nextPeople: Person[] = [];
		for (const person of people) if (!hasId(ids, person.id)) nextPeople.push(person);
		setPeople(nextPeople);
		const rest: string[] = [];
		for (const id of picked) if (!hasId(ids, id)) rest.push(id);
		setPicked(rest);
		if (selectedId !== undefined && hasId(ids, selectedId)) setSelectedId(undefined);
		setMenuOpen(false);
	};
	const openMenu = (button: TextButton, id: string) => {
		setAnchor(button);
		setMenuId(id);
		setMenuOpen(true);
	};

	const cells: Array<Array<string | React.Element>> = [];
	for (const person of slice) {
		cells.push([
			<Checkbox value={hasId(picked, person.id)} onChange={(value: boolean) => toggle(person.id, value)} />,
			<NameCell name={person.name} />,
			person.role,
			person.team,
			<StatusCell status={person.status} />,
			<Sparkline values={person.activity} width={96} height={28} />,
			<MoreButton id={person.id} onOpen={openMenu} />,
		]);
	}

	const menuPerson = people.filter((person) => person.id === menuId)[0];
	const form = <MemberForm draft={draft} onChange={setDraft} />;
	const saveButton = <Button text="Save" variant="contained" color="primary" disabled={draft.name.size() < 2} onLeftClick={save} />;

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants={true}>
			<AppBar title="Directory" elevation="raised">
				<Button text="Add" variant="contained" color="primary" size="small" onLeftClick={openNew} />
			</AppBar>
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar), Size: new UDim2(1, 0, 1, -bar), p: 2 }}>
				{phase === "loading" ? (
					<Stack direction="column" gap={1} sx={STACK}>
						<Skeleton variant="rounded" width={narrow ? 340 : 720} height={72} />
						<Skeleton variant="text" width={narrow ? 340 : 720} lines={6} />
					</Stack>
				) : phase === "error" ? (
					<Alert severity="error" title="Directory did not load" message="The people list could not be read. Try again." onClose={() => setPhase("ready")} />
				) : (
					<Stack direction="column" gap={2} sx={STACK}>
						<Stack direction={narrow ? "column" : "row"} gap={1} alignItems="center" sx={STACK}>
							<Input text={query} placeholder="Search names" onTextChanged={(text: string) => { setQuery(text); setPage(1); }} sx={{ Size: new UDim2(0, narrow ? 340 : 240, 0, 36) }} />
							<Select
								value={status}
								options={STATUSES.map((label) => ({ label, value: label }))}
								onChange={(value: string) => { setStatus(value); setPage(1); }}
								sx={{ Size: new UDim2(0, 160, 0, 36) }}
							/>
						</Stack>
						<Stack direction="row" gap={1} sx={STACK}>
							{TEAMS.map((label) => (
								<Chip key={label} label={label} size="small" selected={team === label} onActivated={() => { setTeam(label); setPage(1); }} />
							))}
						</Stack>
						<Summary rows={rows} />
						{picked.size() > 0 && (
							<Paper elevation="flat" sx={{ ...STACK, p: 1 }}>
								<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
									<TextLine text={`${picked.size()} selected`} />
									<Button text="Clear" variant="text" size="small" onLeftClick={() => setPicked([])} />
									<Button text="Remove" variant="outlined" size="small" onLeftClick={() => removeIds(picked)} />
								</Stack>
							</Paper>
						)}
						{rows.size() === 0 ? (
							<TextLine text={phase === "empty" ? "No people yet." : "No one matches."} color="textSecondary" />
						) : narrow ? (
							<Stack direction="column" gap={1} sx={STACK}>
								{slice.map((person) => (
									<Paper key={person.id} elevation="flat" sx={{ ...STACK, p: 2 }}>
										<Stack direction="column" gap={1} sx={STACK}>
											<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
												<Checkbox value={hasId(picked, person.id)} onChange={(value: boolean) => toggle(person.id, value)} />
												<NameCell name={person.name} />
												<MoreButton id={person.id} onOpen={openMenu} />
											</Stack>
											<TextLine text={`${person.role} · ${person.team}`} variant="caption" color="textSecondary" />
											<StatusCell status={person.status} />
											<Sparkline values={person.activity} width={280} height={32} />
										</Stack>
									</Paper>
								))}
							</Stack>
						) : (
							<Table
								dense
								columns={COLUMNS}
								rows={cells}
								selected={selectedIndex}
								sortColumn={sortColumn}
								sortDirection={sortDirection}
								onSort={(column: number) => {
									if (column === sortColumn) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
									else {
										setSortColumn(column);
										setSortDirection("asc");
									}
									setPage(1);
								}}
								onRowActivated={(index: number) => setSelectedId(slice[index].id)}
							/>
						)}
						{rows.size() > 0 && <Pagination count={count} page={shownPage} onChange={(nextPage: number) => setPage(nextPage)} />}
					</Stack>
				)}
			</ScrollView>
			<Menu
				anchor={anchor}
				open={menuOpen}
				dense
				items={[
					{ id: "edit", text: "Edit" },
					{ id: "remove", text: "Remove" },
				]}
				onSelect={(id: string) => {
					if (menuPerson === undefined) return;
					if (id === "edit") openEdit(menuPerson);
					else removeIds([menuPerson.id]);
				}}
				onClose={() => setMenuOpen(false)}
			/>
			<Drawer open={narrow && editorOpen} edge="right" width={340} onClose={() => setEditorOpen(false)}>
				<Stack direction="column" gap={2} sx={{ ...STACK, p: 2 }}>
					<TextLine text={draft.id === undefined ? "Add member" : "Edit member"} variant="h3" />
					{form}
					{saveButton}
				</Stack>
			</Drawer>
			<Dialog
				open={!narrow && editorOpen}
				title={draft.id === undefined ? "Add member" : "Edit member"}
				onClose={() => setEditorOpen(false)}
				actions={saveButton}
			>
				{form}
			</Dialog>
		</frame>
	);
}

export default {
	title: "Scenarios/Team Directory",
	description: "People directory with search, filters, summary cards, a rich table, phone cards, bulk selection, and an editor.",
	args: { viewport: "desktop", phase: "ready", page: 1, menuOpen: false, editorOpen: false },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
		page: { type: "number", min: 1, max: 3, step: 1 },
		menuOpen: { type: "boolean" },
		editorOpen: { type: "boolean" },
	},
	preview: { width: 1100, height: 760 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <TeamDirectory {...args} />,
};
