import React, { useState } from "@rbxts/react";
import {
	Alert,
	Avatar,
	Badge,
	Box,
	Button,
	Chip,
	Dialog,
	Drawer,
	EmptyListHint,
	FormHelperText,
	Input,
	ListItem,
	Markdown,
	Menu,
	ScrollView,
	Skeleton,
	Snackbar,
	Stack,
	Tabs,
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

interface Friend {
	id: string;
	name: string;
	presence: string;
}

interface Entry {
	id: string;
	when: string;
	body: string;
}

const Preview = Markdown as unknown as (props: PreviewProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const TABS = [
	{ label: "About", value: "about" },
	{ label: "Activity", value: "activity" },
	{ label: "Inventory", value: "inventory" },
];
const FRIENDS: Friend[] = [
	{ id: "mara", name: "Mara Voss", presence: "On the dock" },
	{ id: "owen", name: "Owen Pell", presence: "Away from the ridge" },
	{ id: "ivo", name: "Ivo Lane", presence: "On the ridge" },
];
const ENTRIES: Entry[] = [
	{ id: "lamp", when: "This morning", body: "Left the [dock lamp](lamp) on the morning crate." },
	{ id: "route", when: "Yesterday", body: "Walked the [north route](route) before the wind rose." },
	{ id: "mara", when: "Yesterday", body: "Asked [Mara Voss](mara) to read the return time back." },
];
const EQUIPPED = ["Lamp", "Line", "Tide card"];
const BADGES = ["First visit", "Ridge hand", "Dock count"];
const BIO = "Nia keeps the morning crate and walks the ridge when the wind is low.\n\nThe [north route](route) is marked after sunrise. The [dock lamp](lamp) stays on the crate. [Mara Voss](mara) holds the tide card.";

function StatCard(props: { label: string; value: string; width: number }) {
	return (
		<Box
			sx={{
				Size: new UDim2(0, props.width, 0, 72),
				AutomaticSize: Enum.AutomaticSize.None,
				p: 1.5,
				radius: 1,
				bgcolor: "surface.paper",
			}}
		>
			<Stack direction="column" gap={0} sx={STACK}>
				<Typography text={props.value} variant="h3" sx={STACK} />
				<Typography text={props.label} color="textSecondary" variant="caption" sx={STACK} />
			</Stack>
		</Box>
	);
}

function PartyList(props: { onOpen: (name: string) => void }) {
	return (
		<Stack direction="column" gap={0} sx={STACK}>
			<Typography text="Party" variant="h3" sx={STACK} />
			{FRIENDS.map((friend) => (
				<ListItem
					key={friend.id}
					text={friend.name}
					secondary={friend.presence}
					divider
					onActivated={() => props.onOpen(friend.name)}
				/>
			))}
		</Stack>
	);
}

function EditFields(props: {
	name: string;
	presence: string;
	error: string;
	onName: (value: string) => void;
	onPresence: (value: string) => void;
}) {
	return (
		<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
			<Input text={props.name} placeholder="Display name" width={new UDim(1, 0)} onInput={props.onName} />
			{props.error.size() > 0 ? <FormHelperText text={props.error} hasError /> : undefined}
			<Input text={props.presence} placeholder="Presence" width={new UDim(1, 0)} onInput={props.onPresence} />
		</Stack>
	);
}

function ProfileBody(props: {
	tab: string;
	focus: string;
	narrow: boolean;
	onTab: (value: string) => void;
	onLink: (payload: LinkPayload) => void;
	onItem: (label: string) => void;
}) {
	return (
		<Stack direction="column" gap={1} sx={STACK}>
			<Tabs value={props.tab} options={TABS} onChange={props.onTab} />
			{props.tab === "about" ? (
				<Preview value={BIO} onLink={props.onLink} />
			) : props.tab === "activity" ? (
				<Stack direction="column" gap={2} sx={STACK}>
					{ENTRIES.map((entry) => (
						<Stack key={entry.id} direction="column" gap={0} sx={STACK}>
							<Typography text={entry.when} color="textSecondary" variant="caption" sx={STACK} />
							<Preview value={entry.body} onLink={props.onLink} />
						</Stack>
					))}
				</Stack>
			) : (
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Equipped" variant="subtitle2" sx={STACK} />
					<Stack direction="row" gap={1} wrap sx={STACK}>
						{EQUIPPED.map((label) => (
							<Chip
								key={label}
								label={label}
								selected={props.focus === label.lower()}
								variant={props.focus === label.lower() ? "filled" : "outlined"}
								onActivated={() => props.onItem(label)}
							/>
						))}
					</Stack>
					<Typography text="Badges" variant="subtitle2" sx={STACK} />
					<Stack direction="row" gap={1} wrap sx={STACK}>
						{BADGES.map((label) => (
							<Chip key={label} label={label} variant="outlined" onActivated={() => props.onItem(label)} />
						))}
					</Stack>
				</Stack>
			)}
			{props.narrow ? <PartyList onOpen={(name) => props.onLink({ text: name, href: name.lower() })} /> : undefined}
		</Stack>
	);
}

function PlayerProfile(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [name, setName] = useState("Nia Calder");
	const [presence, setPresence] = useState("On the ridge");
	const [draftName, setDraftName] = useState("Nia Calder");
	const [draftPresence, setDraftPresence] = useState("On the ridge");
	const [editError, setEditError] = useState("");
	const [editing, setEditing] = useState(false);
	const [following, setFollowing] = useState(false);
	const [tab, setTab] = useState("about");
	const [focus, setFocus] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState<GuiObject>();
	const [notice, setNotice] = useState("");
	const cardWidth = narrow ? 168 : 150;

	const openLink = (payload: LinkPayload) => {
		if (payload.href === "lamp") {
			setTab("inventory");
			setFocus("lamp");
		} else if (payload.href === "route") {
			setTab("activity");
		}
		setNotice(`Opened ${payload.text}`);
	};
	const save = () => {
		const cleaned = draftName.gsub("^%s*(.-)%s*$", "%1")[0];
		if (cleaned.size() < 2) {
			setEditError("Add a display name");
			return;
		}
		setName(cleaned);
		setPresence(draftPresence);
		setEditing(false);
		setEditError("");
		setNotice("Profile saved");
	};
	const fields = (
		<EditFields
			name={draftName}
			presence={draftPresence}
			error={editError}
			onName={(value) => {
				setDraftName(value);
				setEditError("");
			}}
			onPresence={setDraftPresence}
		/>
	);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: { phone: 1, desktop: 2 } }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Stack direction={narrow ? "column" : "row"} gap={2} alignItems="center" sx={STACK}>
						<Badge variant="dot" color="success">
							<Avatar name={name} size={64} />
						</Badge>
						<Stack direction="column" gap={0} sx={narrow ? STACK : { Size: new UDim2(0, 240, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
							<Typography text={name} variant="h2" sx={STACK} />
							<Typography text={presence} color="textSecondary" sx={STACK} />
							<Typography text="Level 12" variant="subtitle2" sx={STACK} />
						</Stack>
						<Stack direction="row" gap={1} wrap sx={STACK}>
							<Tooltip text="Keep this profile on your list">
								<Button
									text={following ? "Following" : "Follow"}
									size="small"
									variant={following ? "outlined" : "contained"}
									onLeftClick={() => {
										setFollowing(!following);
										setNotice(following ? "Removed from your list" : "Added to your list");
									}}
								/>
							</Tooltip>
							<Button text="Message" size="small" variant="outlined" onLeftClick={() => setNotice(`Note started for ${name}`)} />
							<Button ref={setMenuAnchor} text="More" size="small" variant="text" onLeftClick={() => setMenuOpen(true)} />
						</Stack>
					</Stack>
					{phase === "loading" ? (
						<Stack direction="row" gap={1} wrap sx={STACK}>
							{[0, 1, 2, 3].map((value) => (
								<Skeleton key={value} variant="rounded" width={cardWidth} height={72} />
							))}
						</Stack>
					) : phase === "error" ? (
						<Alert severity="error" title="Profile unavailable" message="The desk could not open this profile." onClose={() => setPhase("ready")} />
					) : (
						<>
							<Stack direction="row" gap={1} wrap sx={STACK}>
								<StatCard label="Visits" value="128" width={cardWidth} />
								<StatCard label="Routes" value="14" width={cardWidth} />
								<StatCard label="Notes" value="36" width={cardWidth} />
								<StatCard label="Crew" value="5" width={cardWidth} />
							</Stack>
							<Stack direction={narrow ? "column" : "row"} gap={2} alignItems="start" sx={STACK}>
								<frame Size={new UDim2(narrow ? 1 : 1, narrow ? 0 : -300, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
									{phase === "empty" ? (
										<EmptyListHint text="No notes on this profile yet." height={72} />
									) : (
										<ProfileBody
											tab={tab}
											focus={focus}
											narrow={narrow}
											onTab={setTab}
											onLink={openLink}
											onItem={(label) => {
												setFocus(label.lower());
												setNotice(`Opened ${label}`);
											}}
										/>
									)}
								</frame>
								{narrow ? undefined : (
									<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
										<PartyList onOpen={(friend) => setNotice(`Opened ${friend}`)} />
									</frame>
								)}
							</Stack>
						</>
					)}
				</Stack>
			</ScrollView>
			<Menu
				anchor={menuAnchor}
				open={menuOpen}
				items={[
					{ id: "edit", text: "Edit profile" },
					{ id: "copy", text: "Copy name" },
					{ id: "mute", text: "Mute notes" },
				]}
				onSelect={(id) => {
					setMenuOpen(false);
					if (id === "edit") {
						setDraftName(name);
						setDraftPresence(presence);
						setEditing(true);
					} else if (id === "copy") {
						setNotice("Name copied");
					} else {
						setNotice("Notes muted");
					}
				}}
				onClose={() => setMenuOpen(false)}
			/>
			{narrow ? (
				<Drawer open={editing} edge="right" width={320} onClose={() => setEditing(false)}>
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography text="Edit profile" variant="h3" sx={{ ...STACK, p: 2 }} />
						{fields}
						<Stack direction="row" gap={1} sx={{ ...STACK, p: 2 }}>
							<Button text="Cancel" size="small" variant="text" onLeftClick={() => setEditing(false)} />
							<Button text="Save" size="small" variant="contained" onLeftClick={save} />
						</Stack>
					</Stack>
				</Drawer>
			) : (
				<Dialog
					open={editing}
					title="Edit profile"
					onClose={() => setEditing(false)}
					actions={
						<>
							<Button text="Cancel" size="small" variant="text" onLeftClick={() => setEditing(false)} />
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
	title: "Scenarios/Player Profile",
	description: "Responsive profile with notes, party, and inventory.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <PlayerProfile {...args} />,
};
