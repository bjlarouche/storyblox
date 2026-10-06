import React, { useRef, useState } from "@rbxts/react";
import {
	Alert,
	Avatar,
	Badge,
	Button,
	Chip,
	Drawer,
	EmptyListHint,
	Icon,
	Icons,
	ListItem,
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

interface AlertNote {
	id: string;
	title: string;
	blurb: string;
	detail: string;
	person?: string;
	kind: "mention" | "system";
	group: "Today" | "Earlier";
	when: string;
	read: boolean;
}

interface RowProps {
	text: string;
	secondary?: string;
	wrap?: boolean;
	divider?: boolean;
	selected?: boolean;
	leading?: React.ReactNode;
	onActivated?: () => void;
}

const Row = ListItem as unknown as (props: RowProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const FILTERS = ["All", "Unread", "Mentions", "System"];
const GROUPS = ["Today", "Earlier"];

const SEED: AlertNote[] = [
	{
		id: "tide",
		title: "Mara mentioned you",
		blurb: "On the tide note, before anyone leaves the pier.",
		detail: "Mara Voss mentioned you on the tide note. She asked for the return time to be read back.",
		person: "Mara Voss",
		kind: "mention",
		group: "Today",
		when: "12 min",
		read: false,
	},
	{
		id: "crate",
		title: "Crate count is in",
		blurb: "Owen left the morning count on the dock list.",
		detail: "Owen Pell finished the crate count. Two coils of line and one lamp are still out.",
		person: "Owen Pell",
		kind: "mention",
		group: "Today",
		when: "2h",
		read: false,
	},
	{
		id: "gate",
		title: "Gate closes at dusk",
		blurb: "The field gate shuts when the light drops.",
		detail: "The field gate closes at dusk. Wait at the cove bench if you are still on the ridge.",
		kind: "system",
		group: "Today",
		when: "3h",
		read: true,
	},
	{
		id: "ridge",
		title: "Ivo mentioned the walk",
		blurb: "The ridge marker is the last post before the dune.",
		detail: "Ivo Lane mentioned you on the ridge walk. Keep the next marker in sight.",
		person: "Ivo Lane",
		kind: "mention",
		group: "Earlier",
		when: "Yesterday",
		read: false,
	},
	{
		id: "lamp",
		title: "Lamp is back",
		blurb: "The dock lamp was returned to the morning crate.",
		detail: "The dock lamp is back on the crate. The next crew can take it out again.",
		kind: "system",
		group: "Earlier",
		when: "Yesterday",
		read: true,
	},
	{
		id: "visit",
		title: "First visit is filed",
		blurb: "The desk kept the name and the return time.",
		detail: "The first visit note is filed. Ask the desk if you want it dropped.",
		kind: "system",
		group: "Earlier",
		when: "Mon",
		read: false,
	},
];

function matches(note: AlertNote, filter: string) {
	if (filter === "Unread") return note.read !== true;
	if (filter === "Mentions") return note.kind === "mention";
	if (filter === "System") return note.kind === "system";
	return true;
}

function unreadCount(notes: AlertNote[]) {
	let count = 0;
	for (const note of notes) {
		if (note.read !== true) count += 1;
	}
	return count;
}

function cloneNotes(notes: AlertNote[]) {
	const copy: AlertNote[] = [];
	for (const note of notes) copy.push({ ...note });
	return copy;
}

function withRead(notes: AlertNote[], id: string, read: boolean) {
	const copy: AlertNote[] = [];
	for (const note of notes) copy.push(note.id === id ? { ...note, read } : { ...note });
	return copy;
}

function Lead(props: { note: AlertNote }) {
	const mark =
		props.note.person !== undefined ? (
			<Avatar name={props.note.person} size={32} />
		) : (
			<Icon icon={Icons.HelpDesk} size="sm" />
		);
	return (
		<Badge variant="dot" color="primary" invisible={props.note.read}>
			{mark}
		</Badge>
	);
}

function AlertRow(props: {
	note: AlertNote;
	selected: boolean;
	onOpen: (id: string) => void;
	onAnchor: (id: string, anchor: GuiObject) => void;
	onMore: (id: string) => void;
}) {
	return (
		<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0, 4)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={0} Size={new UDim2(1, -132, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
				<Row
					text={props.note.title}
					secondary={props.note.blurb}
					wrap
					divider
					selected={props.selected}
					leading={<Lead note={props.note} />}
					onActivated={() => props.onOpen(props.note.id)}
				/>
			</frame>
			<Typography text={props.note.when} color="textSecondary" variant="caption" />
			<Tooltip text="More actions">
				<Button
					text="More"
					size="small"
					variant="text"
					onLeftClick={() => props.onMore(props.note.id)}
					ref={(anchor) => {
						if (anchor !== undefined) props.onAnchor(props.note.id, anchor);
					}}
				/>
			</Tooltip>
		</frame>
	);
}

function NotificationCenter(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [notes, setNotes] = useState(SEED);
	const [filter, setFilter] = useState("All");
	const [openId, setOpenId] = useState("");
	const [menuId, setMenuId] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState<GuiObject>();
	const [undo, setUndo] = useState<AlertNote[]>();
	const [notice, setNotice] = useState("");
	const anchors = useRef<{ [id: string]: GuiObject }>({});
	const column = narrow ? size.width - 24 : 720;
	const unread = unreadCount(notes);

	const apply = (nextNotes: AlertNote[], message: string) => {
		setUndo(cloneNotes(notes));
		setNotes(nextNotes);
		setNotice(message);
	};
	const findNote = (id: string) => {
		for (const note of notes) {
			if (note.id === id) return note;
		}
		return undefined;
	};
	const openNote = (id: string) => {
		const note = findNote(id);
		setOpenId(id);
		if (note !== undefined && note.read !== true) apply(withRead(notes, id, true), "Marked read");
	};
	const toggleRead = (id: string) => {
		const note = findNote(id);
		if (note === undefined) return;
		const read = note.read !== true;
		apply(withRead(notes, id, read), read ? "Marked read" : "Marked unread");
	};
	const markAll = () => {
		const copy: AlertNote[] = [];
		for (const note of notes) copy.push({ ...note, read: true });
		apply(copy, "All alerts marked read");
	};

	const shown: AlertNote[] = [];
	for (const note of notes) {
		if (matches(note, filter)) shown.push(note);
	}
	const menuNote = findNote(menuId);
	const openNoteData = findNote(openId);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: { phone: 1, desktop: 2 } }}>
				<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					<frame
						AnchorPoint={new Vector2(0.5, 0)}
						Position={UDim2.fromScale(0.5, 0)}
						Size={new UDim2(0, column, 0, 0)}
						AutomaticSize={Enum.AutomaticSize.Y}
						BackgroundTransparency={1}
						BorderSizePixel={0}
					>
						<Stack direction="column" gap={1} sx={STACK}>
							<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
								<Badge count={unread} color="primary">
									<Typography text="Alerts" variant="h2" />
								</Badge>
								<Typography text={`${unread} unread`} color="textSecondary" />
								<Tooltip text="Mark every alert read">
									<Button text="Mark all" size="small" variant="outlined" disabled={unread === 0} onLeftClick={markAll} />
								</Tooltip>
							</Stack>
							<Stack direction="row" gap={1} wrap sx={STACK}>
								{FILTERS.map((name) => (
									<Chip key={name} label={name} selected={filter === name} variant={filter === name ? "filled" : "outlined"} onActivated={() => setFilter(name)} />
								))}
							</Stack>
							{phase === "error" ? (
								<Alert severity="error" title="Alerts unavailable" message="The desk could not open this list." onClose={() => setPhase("ready")} />
							) : phase === "loading" ? (
								<Stack direction="column" gap={1} sx={STACK}>
									{[0, 1, 2, 3].map((value) => (
										<Skeleton key={value} variant="text" width={column - 48} height={18} />
									))}
								</Stack>
							) : phase === "empty" || shown.size() === 0 ? (
								<EmptyListHint text={phase === "empty" ? "No alerts yet." : "Nothing in this view."} height={72} />
							) : (
								GROUPS.map((group) => {
									const rows: AlertNote[] = [];
									for (const note of shown) {
										if (note.group === group) rows.push(note);
									}
									if (rows.size() === 0) return undefined;
									return (
										<Stack key={group} direction="column" gap={0} sx={STACK}>
											<Typography text={group} variant="h3" />
											{rows.map((note) => (
												<AlertRow
													key={note.id}
													note={note}
													selected={note.id === openId}
													onOpen={openNote}
													onAnchor={(id, anchor) => {
														anchors.current[id] = anchor;
													}}
													onMore={(id) => {
														setMenuAnchor(anchors.current[id]);
														setMenuId(id);
														setMenuOpen(true);
													}}
												/>
											))}
										</Stack>
									);
								})
							)}
						</Stack>
					</frame>
				</frame>
			</ScrollView>
			<Menu
				anchor={menuAnchor}
				open={menuOpen && menuNote !== undefined}
				items={
					menuNote === undefined
						? []
						: [
								{ id: "read", text: menuNote.read ? "Mark unread" : "Mark read" },
								{ id: "open", text: "Open" },
							]
				}
				onSelect={(id) => {
					setMenuOpen(false);
					if (id === "read") toggleRead(menuId);
					else setOpenId(menuId);
				}}
				onClose={() => setMenuOpen(false)}
			/>
			<Drawer open={openNoteData !== undefined} edge="right" width={narrow ? 320 : 400} onClose={() => setOpenId("")}>
				{openNoteData !== undefined ? (
					<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
						<Typography text={openNoteData.group} color="textSecondary" variant="caption" />
						<Typography text={openNoteData.title} variant="h2" />
						<Typography text={openNoteData.when} color="textSecondary" />
						<Typography text={openNoteData.detail} />
						<Button
							text={openNoteData.read ? "Mark unread" : "Mark read"}
							size="small"
							variant="outlined"
							onLeftClick={() => toggleRead(openNoteData.id)}
						/>
					</Stack>
				) : undefined}
			</Drawer>
			<Snackbar
				message={notice}
				open={notice.size() > 0}
				variant={ToastVariants.success}
				action={undo !== undefined ? "Undo" : undefined}
				onAction={() => {
					if (undo !== undefined) setNotes(undo);
					setUndo(undefined);
					setNotice("");
				}}
				onDismiss={() => {
					setUndo(undefined);
					setNotice("");
				}}
			/>
		</frame>
	);
}

export default {
	title: "Scenarios/Notification Center",
	description: "Responsive alert inbox with unread marks and undo.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <NotificationCenter {...args} />,
};
