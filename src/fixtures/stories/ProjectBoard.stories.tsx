import React, { useRef, useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	AppBar,
	Avatar,
	Badge,
	Button,
	Chip,
	Dialog,
	Drawer,
	FormHelperText,
	Input,
	LinearProgress,
	Menu,
	NumberInput,
	ScrollView,
	Select,
	Skeleton,
	Stack,
	Tooltip,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface DragRect {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

interface ReorderHandle {
	drag: { active: boolean; id?: string; overId?: string; x: number; y: number };
	begin: (id: string, input: InputObject) => boolean;
	cancel: () => void;
	suppressClick: () => boolean;
}

const reorderApi = Uiblox as unknown as {
	useReorderDrag: (onDrop: (fromId: string, overId?: string) => void, getRects: () => DragRect[]) => ReorderHandle;
	placeItem: <T>(items: readonly T[], from: number, to: number) => T[];
	transferId: (source: readonly string[], dest: readonly string[], id: string, index: number) => { source: string[]; dest: string[] };
};

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
	lane: "Backlog" | "Doing" | "Done";
	menuOpen: boolean;
	editorOpen: boolean;
	editing: boolean;
}

interface Task {
	id: string;
	title: string;
	column: string;
	priority: string;
	owner: string;
	due: string;
	done: number;
	total: number;
}

interface Draft {
	id?: string;
	title: string;
	column: string;
	priority: string;
	owner: string;
	due: string;
	done: number;
	total: number;
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const LANES = ["Backlog", "Doing", "Done"];
const PRIORITIES = ["All", "High", "Medium", "Low"];
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };

const SEED: Task[] = [
	{ id: "welcome", title: "Draft the welcome note", column: "Backlog", priority: "High", owner: "Avery Cole", due: "Oct 8", done: 1, total: 4 },
	{ id: "photos", title: "Sort the field photos", column: "Backlog", priority: "Medium", owner: "Blair Nguyen", due: "Oct 9", done: 0, total: 3 },
	{ id: "empty", title: "Rewrite the empty state", column: "Doing", priority: "Low", owner: "Casey Ortiz", due: "Oct 10", done: 2, total: 5 },
	{ id: "margins", title: "Check the print margins", column: "Doing", priority: "High", owner: "Devon Shah", due: "Oct 11", done: 3, total: 3 },
	{ id: "interview", title: "File the interview notes", column: "Doing", priority: "Medium", owner: "Avery Cole", due: "Oct 12", done: 1, total: 2 },
	{ id: "weekly", title: "Publish the weekly summary", column: "Done", priority: "Low", owner: "Blair Nguyen", due: "Oct 6", done: 4, total: 4 },
	{ id: "archive", title: "Label the archive boxes", column: "Done", priority: "Medium", owner: "Casey Ortiz", due: "Oct 7", done: 2, total: 2 },
	{ id: "hold", title: "Confirm the room hold", column: "Backlog", priority: "High", owner: "Devon Shah", due: "Oct 13", done: 0, total: 1 },
];

function laneKey(name: string) {
	return `lane:${name}`;
}

function laneName(id: string) {
	if (string.sub(id, 1, 5) !== "lane:") return undefined;
	return string.sub(id, 6);
}

function findTask(tasks: readonly Task[], id: string) {
	for (const task of tasks) if (task.id === id) return task;
	return undefined;
}

function idsIn(tasks: readonly Task[], lane: string) {
	const ids: string[] = [];
	for (const task of tasks) if (task.column === lane) ids.push(task.id);
	return ids;
}

function indexIn(ids: readonly string[], id: string) {
	for (let index = 0; index < ids.size(); index++) if (ids[index] === id) return index;
	return -1;
}

function replaceLane(tasks: readonly Task[], lane: string, ids: readonly string[]) {
	const listed: Task[] = [];
	let wrote = false;
	for (const task of tasks) {
		if (task.column !== lane) {
			listed.push(task);
			continue;
		}
		if (wrote) continue;
		wrote = true;
		for (const id of ids) {
			const found = findTask(tasks, id);
			if (found) listed.push(found);
		}
	}
	return listed;
}

function rewriteLanes(tasks: readonly Task[], sourceLane: string, sourceIds: readonly string[], destLane: string, destIds: readonly string[]) {
	const listed: Task[] = [];
	let wroteSource = false;
	let wroteDest = false;
	const emit = (ids: readonly string[], lane: string) => {
		for (const id of ids) {
			const found = findTask(tasks, id);
			if (found) listed.push({ ...found, column: lane });
		}
	};
	for (const task of tasks) {
		if (task.column === sourceLane) {
			if (!wroteSource) {
				wroteSource = true;
				emit(sourceIds, sourceLane);
			}
			continue;
		}
		if (task.column === destLane) {
			if (!wroteDest) {
				wroteDest = true;
				emit(destIds, destLane);
			}
			continue;
		}
		listed.push(task);
	}
	if (!wroteDest) emit(destIds, destLane);
	return listed;
}

function asTasks(tasks: readonly Task[]) {
	const listed: Task[] = [];
	for (const task of tasks) listed.push(task);
	return listed;
}

function applyDrop(tasks: readonly Task[], fromId: string, overId?: string) {
	if (overId === undefined || overId === fromId) return asTasks(tasks);
	const moving = findTask(tasks, fromId);
	if (moving === undefined) return asTasks(tasks);
	const droppedLane = laneName(overId);
	let dest = moving.column;
	let index = 0;
	if (droppedLane !== undefined) {
		dest = droppedLane;
		const destIds = idsIn(tasks, dest);
		index = dest === moving.column ? math.max(0, destIds.size() - 1) : destIds.size();
	} else {
		const over = findTask(tasks, overId);
		if (over === undefined) return asTasks(tasks);
		dest = over.column;
		index = math.max(0, indexIn(idsIn(tasks, dest), overId));
	}
	if (dest === moving.column) {
		const ids = idsIn(tasks, dest);
		return replaceLane(tasks, dest, reorderApi.placeItem(ids, indexIn(ids, fromId), index));
	}
	const moved = reorderApi.transferId(idsIn(tasks, moving.column), idsIn(tasks, dest), fromId, index);
	return rewriteLanes(tasks, moving.column, moved.source, dest, moved.dest);
}

function visibleTasks(tasks: readonly Task[], query: string, priority: string, phase: Args["phase"]) {
	const rows: Task[] = [];
	if (phase === "empty") return rows;
	const needle = string.lower(query);
	for (const task of tasks) {
		if (priority !== "All" && task.priority !== priority) continue;
		if (needle.size() > 0 && string.find(string.lower(task.title), needle, 1, true) === undefined) continue;
		rows.push(task);
	}
	return rows;
}

function countLane(tasks: readonly Task[], lane: string) {
	let total = 0;
	for (const task of tasks) if (task.column === lane) total += 1;
	return total;
}

function priorityColor(priority: string): "error" | "primary" | "success" {
	if (priority === "High") return "error";
	if (priority === "Low") return "success";
	return "primary";
}

function blankDraft(): Draft {
	return { title: "", column: "Backlog", priority: "Medium", owner: "Avery Cole", due: "Oct 14", done: 0, total: 3 };
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

function MoreButton(props: { onOpen: (anchor: TextButton) => void; pin?: (anchor: TextButton) => void }) {
	const [button, setButton] = useState<TextButton>();
	return (
		<Button
			ref={(instance: TextButton | undefined) => {
				setButton(instance);
				if (instance && props.pin) props.pin(instance);
			}}
			text="More"
			variant="text"
			size="small"
			onLeftClick={() => button !== undefined && props.onOpen(button)}
		/>
	);
}

function TaskCard(props: {
	task: Task;
	hot: boolean;
	lifted: boolean;
	onBegin: (id: string, input: InputObject) => void;
	onOpen: (task: Task) => void;
	onMenu: (anchor: TextButton, task: Task) => void;
	pin?: (anchor: TextButton) => void;
	suppressClick: () => boolean;
	bind: (id: string, gui?: GuiObject) => void;
	order: number;
}) {
	const { theme } = useTheme();
	const task = props.task;
	const ratio = task.total > 0 ? task.done / task.total : 0;
	return (
		<textbutton
			ref={(gui) => props.bind(task.id, gui)}
			Size={new UDim2(1, 0, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundColor3={props.hot ? theme.palette.action.selected : theme.palette.surface.paper}
			BackgroundTransparency={props.lifted ? 0.4 : 0}
			BorderSizePixel={0}
			Text=""
			AutoButtonColor={false}
			LayoutOrder={props.order}
			Event={{
				InputBegan: (_, input) => props.onBegin(task.id, input),
				Activated: () => {
					if (props.suppressClick()) return;
					props.onOpen(task);
				},
			}}
		>
			<uicorner CornerRadius={new UDim(0, 8)} />
			<uipadding PaddingTop={new UDim(0, 8)} PaddingBottom={new UDim(0, 8)} PaddingLeft={new UDim(0, 8)} PaddingRight={new UDim(0, 8)} />
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 6)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame Size={new UDim2(1, 0, 0, 28)} BackgroundTransparency={1} LayoutOrder={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} VerticalAlignment={Enum.VerticalAlignment.Center} Padding={new UDim(0, 8)} />
				<Avatar name={task.owner} size={28} />
				<textlabel
					Text={task.owner}
					Size={new UDim2(1, -120, 1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.secondary}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextTruncate={Enum.TextTruncate.AtEnd}
				/>
				<MoreButton onOpen={(anchor) => props.onMenu(anchor, task)} pin={props.pin} />
			</frame>
			<textlabel
				Text={task.title}
				LayoutOrder={2}
				Size={new UDim2(1, 0, 0, 40)}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.body}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
				TextWrapped={true}
			/>
			<frame Size={new UDim2(1, 0, 0, 22)} BackgroundTransparency={1} LayoutOrder={3}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} VerticalAlignment={Enum.VerticalAlignment.Center} Padding={new UDim(0, 8)} />
				<Badge variant="dot" color={priorityColor(task.priority)}>
					<textlabel
						Text={task.priority}
						AutomaticSize={Enum.AutomaticSize.XY}
						Size={new UDim2(0, 0, 0, 0)}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.default}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.text.primary}
					/>
				</Badge>
				<Tooltip text={`Due ${task.due}`}>
					<textlabel
						Text={task.due}
						AutomaticSize={Enum.AutomaticSize.XY}
						Size={new UDim2(0, 0, 0, 0)}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.default}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.text.secondary}
					/>
				</Tooltip>
			</frame>
			<LinearProgress value={ratio} sx={{ Size: new UDim2(1, 0, 0, 6), LayoutOrder: 4 }} />
			<textlabel
				Text={`${task.done} of ${task.total}`}
				LayoutOrder={5}
				Size={new UDim2(1, 0, 0, 16)}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.secondary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</textbutton>
	);
}

function TaskForm(props: { draft: Draft; onChange: (draft: Draft) => void }) {
	const draft = props.draft;
	return (
		<Stack direction="column" gap={1} sx={STACK}>
			<Input text={draft.title} placeholder="Task title" onTextChanged={(text: string) => props.onChange({ ...draft, title: text })} />
			{draft.title.size() < 3 && <FormHelperText text="Use at least 3 characters." hasError />}
			<Select value={draft.column} options={LANES.map((lane) => ({ label: lane, value: lane }))} onChange={(column: string) => props.onChange({ ...draft, column })} sx={{ Size: new UDim2(1, 0, 0, 36) }} />
			<Select
				value={draft.priority}
				options={[
					{ label: "High", value: "High" },
					{ label: "Medium", value: "Medium" },
					{ label: "Low", value: "Low" },
				]}
				onChange={(priority: string) => props.onChange({ ...draft, priority })}
				sx={{ Size: new UDim2(1, 0, 0, 36) }}
			/>
			<Input text={draft.due} placeholder="Due" onTextChanged={(due: string) => props.onChange({ ...draft, due })} />
			<Input text={draft.owner} placeholder="Owner" onTextChanged={(owner: string) => props.onChange({ ...draft, owner })} />
			<NumberInput value={draft.done} min={0} max={draft.total} step={1} onChange={(done: number) => props.onChange({ ...draft, done })} />
			<NumberInput value={draft.total} min={1} max={12} step={1} onChange={(total: number) => props.onChange({ ...draft, total, done: math.min(draft.done, total) })} />
		</Stack>
	);
}

function ProjectBoard(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const [phase, setPhase] = useArg(args.phase);
	const [lane, setLane] = useArg<Args["lane"]>(args.lane);
	const [menuOpen, setMenuOpen] = useArg(args.menuOpen);
	const [editorOpen, setEditorOpen] = useArg(args.editorOpen);
	const [editing] = useArg(args.editing);
	const [query, setQuery] = useState("");
	const [priority, setPriority] = useState("All");
	const [tasks, setTasks] = useState(SEED);
	const [draft, setDraft] = useState<Draft>(blankDraft());
	const [detailId, setDetailId] = useState<string>();
	const [anchor, setAnchor] = useState<TextButton>();
	const [menuTask, setMenuTask] = useState<Task>();
	const [root, setRoot] = useState<Frame>();
	const slots = useRef<Record<string, GuiObject | undefined>>({});
	const tasksRef = useRef(tasks);
	tasksRef.current = tasks;

	const readRects = () => {
		const rects: DragRect[] = [];
		const push = (id: string) => {
			const gui = slots.current[id];
			if (gui === undefined) return;
			rects.push({
				id,
				x: gui.AbsolutePosition.X,
				y: gui.AbsolutePosition.Y,
				width: gui.AbsoluteSize.X,
				height: gui.AbsoluteSize.Y,
			});
		};
		for (const name of LANES) push(laneKey(name));
		for (const task of tasksRef.current) push(task.id);
		return rects;
	};

	const drag = reorderApi.useReorderDrag((fromId, overId) => {
		setTasks(applyDrop(tasksRef.current, fromId, overId));
	}, readRects);

	const rows = visibleTasks(tasks, query, priority, phase);
	const detail = detailId !== undefined ? findTask(tasks, detailId) : undefined;
	const showEditor = editorOpen;
	const showDetail = detail !== undefined && !showEditor;
	const lanes = narrow ? [lane] : LANES;
	const ghost = drag.drag.active ? findTask(tasks, drag.drag.id ?? "") : undefined;
	const originX = root !== undefined ? root.AbsolutePosition.X : 0;
	const originY = root !== undefined ? root.AbsolutePosition.Y : 0;

	const openNew = () => {
		setDraft(blankDraft());
		setDetailId(undefined);
		setEditorOpen(true);
	};
	const openEdit = (task: Task) => {
		setDraft({
			id: task.id,
			title: task.title,
			column: task.column,
			priority: task.priority,
			owner: task.owner,
			due: task.due,
			done: task.done,
			total: task.total,
		});
		setDetailId(undefined);
		setEditorOpen(true);
		setMenuOpen(false);
	};
	const save = () => {
		if (draft.title.size() < 3) return;
		if (draft.id === undefined) {
			const created: Task = {
				id: `task-${tasks.size() + 1}`,
				title: draft.title,
				column: draft.column,
				priority: draft.priority,
				owner: draft.owner,
				due: draft.due,
				done: draft.done,
				total: draft.total,
			};
			const listed = [...tasks, created];
			setTasks(listed);
		} else {
			const listed: Task[] = [];
			for (const task of tasks) {
				if (task.id !== draft.id) listed.push(task);
				else
					listed.push({
						...task,
						title: draft.title,
						column: draft.column,
						priority: draft.priority,
						owner: draft.owner,
						due: draft.due,
						done: draft.done,
						total: draft.total,
					});
			}
			setTasks(listed);
		}
		setEditorOpen(false);
	};
	const moveTask = (task: Task, dest: string) => {
		setTasks(applyDrop(tasks, task.id, laneKey(dest)));
		setMenuOpen(false);
	};

	const hotLane = (name: string) => {
		if (!drag.drag.active || drag.drag.overId === undefined) return false;
		if (drag.drag.overId === laneKey(name)) return true;
		const over = findTask(tasks, drag.drag.overId);
		return over !== undefined && over.column === name;
	};

	const shownDraft =
		editorOpen && editing && draft.title.size() === 0
			? {
					id: SEED[0].id,
					title: SEED[0].title,
					column: SEED[0].column,
					priority: SEED[0].priority,
					owner: SEED[0].owner,
					due: SEED[0].due,
					done: SEED[0].done,
					total: SEED[0].total,
				}
			: draft;
	const form = <TaskForm draft={shownDraft} onChange={setDraft} />;
	const shownMenu = menuTask ?? (menuOpen ? SEED[0] : undefined);
	const saveButton = <Button text="Save" variant="contained" color="primary" disabled={draft.title.size() < 3} onLeftClick={save} />;

	return (
		<frame ref={setRoot} Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants={true}>
			<AppBar title="Board" elevation="raised">
				<Button text="Add" variant="contained" color="primary" size="small" onLeftClick={openNew} />
			</AppBar>
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar), Size: new UDim2(1, 0, 1, -bar), p: 2 }}>
				{phase === "loading" ? (
					<Stack direction="column" gap={1} sx={STACK}>
						<Skeleton variant="rounded" width={narrow ? 340 : 1000} height={72} />
						<Skeleton variant="text" width={narrow ? 340 : 1000} lines={5} />
					</Stack>
				) : phase === "error" ? (
					<Alert severity="error" title="Board did not load" message="The tasks could not be read. Try again." onClose={() => setPhase("ready")} />
				) : (
					<Stack direction="column" gap={2} sx={STACK}>
						<Stack direction={narrow ? "column" : "row"} gap={1} alignItems="center" sx={STACK}>
							<Input
								text={query}
								placeholder="Search tasks"
								onTextChanged={(text: string) => setQuery(text)}
								sx={{ Size: new UDim2(0, narrow ? 340 : 240, 0, 36) }}
							/>
							<Stack direction="row" gap={1} sx={STACK}>
								{PRIORITIES.map((label) => (
									<Chip key={label} label={label} size="small" selected={priority === label} onActivated={() => setPriority(label)} />
								))}
							</Stack>
						</Stack>
						<Stack direction="row" gap={1} sx={STACK}>
							{LANES.map((name) => (
								<Chip
									key={name}
									label={`${name} ${countLane(rows, name)}`}
									size="small"
									selected={narrow && lane === name}
									onActivated={() => narrow && setLane(name as Args["lane"])}
								/>
							))}
						</Stack>
						{rows.size() === 0 ? (
							<TextLine text={phase === "empty" ? "No tasks yet." : "No tasks match."} color="textSecondary" />
						) : (
							<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
								<uilistlayout
									FillDirection={narrow ? Enum.FillDirection.Vertical : Enum.FillDirection.Horizontal}
									Padding={new UDim(0, 12)}
									SortOrder={Enum.SortOrder.LayoutOrder}
								/>
								{lanes.map((name, order) => {
									const cards: Task[] = [];
									for (const task of rows) if (task.column === name) cards.push(task);
									return (
										<frame
											key={name}
											ref={(gui) => {
												slots.current[laneKey(name)] = gui;
											}}
											LayoutOrder={order}
											Size={narrow ? new UDim2(1, 0, 0, 0) : new UDim2(0.33, -8, 0, 0)}
											AutomaticSize={Enum.AutomaticSize.Y}
											BackgroundColor3={hotLane(name) ? theme.palette.action.selected : theme.palette.surface.input}
											BorderSizePixel={0}
										>
											<uicorner CornerRadius={new UDim(0, 8)} />
											<uipadding PaddingTop={new UDim(0, 8)} PaddingBottom={new UDim(0, 8)} PaddingLeft={new UDim(0, 8)} PaddingRight={new UDim(0, 8)} />
											<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
											<textlabel
												Text={`${name}  ${cards.size()}`}
												LayoutOrder={0}
												Size={new UDim2(1, 0, 0, 24)}
												BackgroundTransparency={1}
												Font={theme.typography.fontFamilies.semibold}
												TextSize={theme.typography.fontSizes.body}
												TextColor3={theme.palette.text.primary}
												TextXAlignment={Enum.TextXAlignment.Left}
											/>
											{cards.size() === 0 ? (
												<textlabel
													Text="Nothing here"
													LayoutOrder={1}
													Size={new UDim2(1, 0, 0, 24)}
													BackgroundTransparency={1}
													Font={theme.typography.fontFamilies.default}
													TextSize={theme.typography.fontSizes.caption}
													TextColor3={theme.palette.text.secondary}
													TextXAlignment={Enum.TextXAlignment.Left}
												/>
											) : (
												cards.map((task, index) => (
													<TaskCard
														key={task.id}
														order={index + 1}
														task={task}
														hot={drag.drag.overId === task.id}
														lifted={drag.drag.active && drag.drag.id === task.id}
														onBegin={drag.begin}
														onOpen={(opened) => setDetailId(opened.id)}
														onMenu={(button, opened) => {
															setAnchor(button);
															setMenuTask(opened);
															setMenuOpen(true);
														}}
														pin={
															menuOpen && task.id === "welcome"
																? (instance) => {
																		if (anchor !== instance) setAnchor(instance);
																	}
																: undefined
														}
														suppressClick={drag.suppressClick}
														bind={(id, gui) => {
															slots.current[id] = gui;
														}}
													/>
												))
											)}
										</frame>
									);
								})}
							</frame>
						)}
					</Stack>
				)}
			</ScrollView>
			{ghost !== undefined && drag.drag.active && (
				<textlabel
					Text={ghost.title}
					Position={new UDim2(0, drag.drag.x - originX + 12, 0, drag.drag.y - originY + 12)}
					Size={new UDim2(0, 180, 0, 28)}
					BackgroundColor3={theme.palette.surface.paper}
					BackgroundTransparency={0.15}
					TextColor3={theme.palette.text.primary}
					Font={theme.typography.fontFamilies.default}
					TextSize={14}
					TextXAlignment={Enum.TextXAlignment.Left}
					ZIndex={30}
				/>
			)}
			<Menu
				anchor={anchor}
				open={menuOpen && shownMenu !== undefined}
				dense
				items={[
					{ id: "edit", text: "Edit" },
					{ id: "Backlog", text: "Move to Backlog" },
					{ id: "Doing", text: "Move to Doing" },
					{ id: "Done", text: "Move to Done" },
				]}
				onSelect={(id: string) => {
					if (shownMenu === undefined) return;
					if (id === "edit") openEdit(shownMenu);
					else moveTask(shownMenu, id);
				}}
				onClose={() => setMenuOpen(false)}
			/>
			<Drawer open={narrow && (showEditor || showDetail)} edge="right" width={340} onClose={() => { setEditorOpen(false); setDetailId(undefined); }}>
				<Stack direction="column" gap={2} sx={{ ...STACK, p: 2 }}>
					{showEditor ? (
						<>
							<TextLine text={shownDraft.id === undefined ? "Add task" : "Edit task"} variant="h3" />
							{form}
							{saveButton}
						</>
					) : detail !== undefined ? (
						<>
							<TextLine text={detail.title} variant="h3" />
							<TextLine text={`${detail.owner} · ${detail.column}`} color="textSecondary" />
							<TextLine text={`Due ${detail.due} · ${detail.priority}`} color="textSecondary" />
							<LinearProgress value={detail.total > 0 ? detail.done / detail.total : 0} sx={{ Size: new UDim2(1, 0, 0, 8) }} />
							<TextLine text={`${detail.done} of ${detail.total}`} variant="caption" color="textSecondary" />
							<Button text="Edit" variant="contained" color="primary" onLeftClick={() => openEdit(detail)} />
						</>
					) : undefined}
				</Stack>
			</Drawer>
			<Dialog
				open={!narrow && showEditor}
				title={shownDraft.id === undefined ? "Add task" : "Edit task"}
				onClose={() => setEditorOpen(false)}
				actions={saveButton}
			>
				{form}
			</Dialog>
			<Dialog open={!narrow && showDetail} title={detail?.title ?? "Task"} onClose={() => setDetailId(undefined)} actions={<Button text="Edit" variant="contained" color="primary" onLeftClick={() => detail !== undefined && openEdit(detail)} />}>
				{detail !== undefined && (
					<Stack direction="column" gap={1} sx={STACK}>
						<TextLine text={`${detail.owner} · ${detail.column}`} color="textSecondary" />
						<TextLine text={`Due ${detail.due} · ${detail.priority}`} color="textSecondary" />
						<LinearProgress value={detail.total > 0 ? detail.done / detail.total : 0} sx={{ Size: new UDim2(1, 0, 0, 8) }} />
						<TextLine text={`${detail.done} of ${detail.total}`} variant="caption" color="textSecondary" />
					</Stack>
				)}
			</Dialog>
		</frame>
	);
}

export default {
	title: "Scenarios/Project Board",
	description: "Task board with search, status chips, draggable cards, a move menu, and an editor.",
	args: { viewport: "desktop", phase: "ready", lane: "Backlog", menuOpen: false, editorOpen: false, editing: false },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
		lane: { type: "enum", options: ["Backlog", "Doing", "Done"] },
		menuOpen: { type: "boolean" },
		editorOpen: { type: "boolean" },
		editing: { type: "boolean" },
	},
	preview: { width: 1100, height: 760 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <ProjectBoard {...args} />,
};
