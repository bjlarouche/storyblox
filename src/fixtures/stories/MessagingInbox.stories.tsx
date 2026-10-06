import React, { useRef, useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	AppBar,
	Avatar,
	Badge,
	Box,
	Button,
	Chip,
	Divider,
	Drawer,
	EmptyListHint,
	Input,
	InputProps,
	Menu,
	ScrollView,
	Skeleton,
	Snackbar,
	Stack,
	Switch,
	ToastVariants,
	Tooltip,
	Typography,
	useTheme,
	VirtualList,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Thread {
	id: string;
	name: string;
	preview: string;
	time: string;
	unread: number;
	online: boolean;
	status: string;
}

interface Message {
	id: string;
	threadId: string;
	author: string;
	body: string;
	time: string;
	mine?: boolean;
	attachment?: string;
}

interface MultilineProps extends InputProps {
	multiline?: boolean;
	minRows?: number;
	maxRows?: number;
}

const MultilineInput = Uiblox.Input as unknown as (props: MultilineProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const THREADS: Thread[] = [
	{ id: "arden", name: "Arden Pike", preview: "The field notes are ready.", time: "9:42", unread: 3, online: true, status: "Active now" },
	{ id: "mira", name: "Mira Sol", preview: "I added the revised route.", time: "8:18", unread: 0, online: true, status: "Active now" },
	{ id: "team", name: "North Crew", preview: "Tomas: Clear skies here.", time: "Mon", unread: 7, online: false, status: "4 members" },
	{ id: "sela", name: "Sela Moon", preview: "That timing works for me.", time: "Sun", unread: 0, online: false, status: "Away" },
	{ id: "tomas", name: "Tomas Reed", preview: "Shared a document", time: "Fri", unread: 1, online: false, status: "Last active Friday" },
	{ id: "river", name: "River House", preview: "The inventory count is even.", time: "Thu", unread: 0, online: false, status: "6 members" },
];

const SEED_MESSAGES: Message[] = [
	{ id: "m1", threadId: "arden", author: "Arden Pike", body: "Morning. Did the north route stay open overnight?", time: "9:31" },
	{ id: "m2", threadId: "arden", author: "You", body: "Yes. The field team checked it just after sunrise.", time: "9:34", mine: true },
	{ id: "m3", threadId: "arden", author: "Arden Pike", body: "Great. I grouped the observations into one note.", time: "9:38", attachment: "route-notes.md" },
	{ id: "m4", threadId: "arden", author: "You", body: "Thanks — I will read it before the afternoon handoff.", time: "9:40", mine: true },
	{ id: "m5", threadId: "arden", author: "Arden Pike", body: "The field notes are ready.", time: "9:42" },
	{ id: "m6", threadId: "mira", author: "Mira Sol", body: "I added the revised route.", time: "8:18", attachment: "north-route.map" },
	{ id: "m7", threadId: "team", author: "Tomas Reed", body: "Clear skies here. We can keep the early handoff.", time: "8:05" },
	{ id: "m8", threadId: "sela", author: "Sela Moon", body: "That timing works for me.", time: "Sun" },
	{ id: "m9", threadId: "tomas", author: "Tomas Reed", body: "Shared the final field brief.", time: "Fri", attachment: "field-brief.txt" },
	{ id: "m10", threadId: "river", author: "River House", body: "The inventory count is even.", time: "Thu" },
];

function ConversationRow(props: { thread: Thread; selected: boolean; onSelect: () => void }) {
	const { theme } = useTheme();
	const thread = props.thread;
	return (
		<textbutton
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={props.selected ? theme.palette.action.selected : theme.palette.surface.paper}
			BackgroundTransparency={props.selected ? 0 : 1}
			BorderSizePixel={0}
			Text=""
			AutoButtonColor={false}
			Event={{ Activated: props.onSelect }}
		>
			<frame Position={UDim2.fromOffset(12, 17)} Size={UDim2.fromOffset(44, 44)} BackgroundTransparency={1}>
				<Badge variant="dot" color="success" invisible={!thread.online}>
					<Avatar name={thread.name} size={44} />
				</Badge>
			</frame>
			<textlabel
				Position={UDim2.fromOffset(68, 13)}
				Size={new UDim2(1, -126, 0, 22)}
				BackgroundTransparency={1}
				Font={thread.unread > 0 ? theme.typography.fontFamilies.semibold : theme.typography.fontFamilies.default}
				Text={thread.name}
				TextColor3={theme.palette.text.primary}
				TextSize={theme.typography.fontSizes.body}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>
			<textlabel
				Position={UDim2.fromOffset(68, 37)}
				Size={new UDim2(1, -92, 0, 20)}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				Text={thread.preview}
				TextColor3={theme.palette.text.secondary}
				TextSize={theme.typography.fontSizes.caption}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>
			<textlabel
				Position={new UDim2(1, -56, 0, 14)}
				Size={UDim2.fromOffset(44, 18)}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				Text={thread.time}
				TextColor3={theme.palette.text.secondary}
				TextSize={theme.typography.fontSizes.caption}
				TextXAlignment={Enum.TextXAlignment.Right}
			/>
			{thread.unread > 0 && (
				<frame Position={new UDim2(1, -34, 0, 42)} Size={UDim2.fromOffset(18, 18)} BackgroundTransparency={1}>
					<Badge count={thread.unread} color="primary">
						<frame Size={UDim2.fromOffset(1, 1)} BackgroundTransparency={1} />
					</Badge>
				</frame>
			)}
		</textbutton>
	);
}

function ConversationList(props: {
	threads: Thread[];
	selectedId: string;
	query: string;
	onQuery: (query: string) => void;
	onSelect: (thread: Thread) => void;
	phase: Args["phase"];
}) {
	const { theme } = useTheme();
	const listed = props.threads.filter((thread) => string.find(string.lower(thread.name), string.lower(props.query), 1, true)[0] !== undefined);
	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={theme.palette.surface.paper} BorderSizePixel={0}>
			<frame Position={UDim2.fromOffset(12, 12)} Size={new UDim2(1, -24, 0, 40)} BackgroundTransparency={1}>
				<Input text={props.query} placeholder="Search conversations" width={new UDim(1, 0)} onInput={props.onQuery} />
			</frame>
			<frame Position={UDim2.fromOffset(0, 64)} Size={new UDim2(1, 0, 1, -64)} BackgroundTransparency={1}>
				{props.phase === "loading" ? (
					<Stack direction="column" gap={1} sx={{ ...STACK, p: 1 }}>
						{[0, 1, 2, 3, 4].map((value) => <Skeleton key={value} variant="rounded" width={300} height={62} />)}
					</Stack>
				) : props.phase === "error" ? (
					<Alert severity="error" title="Inbox unavailable" message="Conversations could not be loaded." />
				) : props.phase === "empty" || listed.size() === 0 ? (
					<EmptyListHint text="No conversations. Try a different search." height={72} />
				) : (
					<VirtualList
						items={listed}
						getKey={(thread) => thread.id}
						itemHeight={78}
						renderItem={(thread) => (
							<ConversationRow
								thread={thread}
								selected={thread.id === props.selectedId}
								onSelect={() => props.onSelect(thread)}
							/>
						)}
					/>
				)}
			</frame>
		</frame>
	);
}

function DaySeparator() {
	return (
		<Stack direction="row" gap={1} alignItems="center" sx={{ ...STACK, py: 1 }}>
			<Divider />
			<Typography text="Today" variant="caption" color="textSecondary" />
			<Divider />
		</Stack>
	);
}

function MessageRow(props: {
	message: Message;
	onMenu: (message: Message, anchor: TextButton) => void;
}) {
	const { theme } = useTheme();
	const message = props.message;
	const height = message.attachment !== undefined ? 92 : 68;
	return (
		<frame Size={new UDim2(1, 0, 0, height)} BackgroundTransparency={1}>
			<frame
				AnchorPoint={new Vector2(message.mine ? 1 : 0, 0)}
				Position={new UDim2(message.mine ? 1 : 0, message.mine ? -8 : 8, 0, 0)}
				Size={new UDim2(0.72, 0, 0, height - 8)}
				BackgroundColor3={message.mine ? theme.palette.primary.main : theme.palette.surface.input}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, 12)} />
				<uipadding
					PaddingLeft={new UDim(0, 10)}
					PaddingRight={new UDim(0, 10)}
					PaddingTop={new UDim(0, 7)}
					PaddingBottom={new UDim(0, 7)}
				/>
				<textlabel
					Size={new UDim2(1, -30, 0, 18)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					Text={message.mine ? "You" : message.author}
					TextColor3={message.mine ? theme.palette.primary.on : theme.palette.text.primary}
					TextSize={theme.typography.fontSizes.caption}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
				<textlabel
					Position={UDim2.fromOffset(0, 20)}
					Size={new UDim2(1, 0, 0, 34)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					Text={message.body}
					TextColor3={message.mine ? theme.palette.primary.on : theme.palette.text.primary}
					TextSize={theme.typography.fontSizes.body}
					TextWrapped
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Top}
				/>
				{textAttachment(message, theme)}
				<textlabel
					AnchorPoint={new Vector2(1, 0)}
					Position={new UDim2(1, 0, 0, 0)}
					Size={UDim2.fromOffset(28, 18)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					Text={message.time}
					TextColor3={message.mine ? theme.palette.primary.on : theme.palette.text.secondary}
					TextSize={theme.typography.fontSizes.caption}
					TextXAlignment={Enum.TextXAlignment.Right}
				/>
				<frame
					AnchorPoint={new Vector2(1, 1)}
					Position={UDim2.fromScale(1, 1)}
					Size={UDim2.fromOffset(26, 22)}
					BackgroundTransparency={1}
				>
					<Tooltip text="Message actions">
						<textbutton
							Size={UDim2.fromOffset(26, 22)}
							BackgroundTransparency={1}
							Font={theme.typography.fontFamilies.semibold}
							Text="•••"
							TextColor3={message.mine ? theme.palette.primary.on : theme.palette.text.secondary}
							TextSize={14}
							Event={{ Activated: (anchor) => props.onMenu(message, anchor) }}
						/>
					</Tooltip>
				</frame>
			</frame>
		</frame>
	);
}

function textAttachment(message: Message, theme: ReturnType<typeof useTheme>["theme"]) {
	if (message.attachment === undefined) return undefined;
	return (
		<textlabel
			Position={UDim2.fromOffset(0, 56)}
			Size={new UDim2(1, -34, 0, 22)}
			BackgroundColor3={message.mine ? theme.palette.primary.hover : theme.palette.surface.elevated}
			BorderSizePixel={0}
			Font={theme.typography.fontFamilies.default}
			Text={`  ${message.attachment}`}
			TextColor3={message.mine ? theme.palette.primary.on : theme.palette.text.link}
			TextSize={theme.typography.fontSizes.caption}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextTruncate={Enum.TextTruncate.AtEnd}
		>
			<uicorner CornerRadius={new UDim(0, 6)} />
		</textlabel>
	);
}

function ThreadView(props: {
	thread: Thread;
	messages: Message[];
	narrow: boolean;
	draft: string;
	onDraft: (draft: string) => void;
	onBack: () => void;
	onInfo: () => void;
	onSend: () => void;
	onMenu: (message: Message, anchor: TextButton) => void;
}) {
	const { theme } = useTheme();
	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0}>
			<frame Size={new UDim2(1, 0, 0, 64)} BackgroundColor3={theme.palette.surface.paper} BorderSizePixel={0}>
				{props.narrow && (
					<Button
						text="Back"
						size="small"
						variant="outlined"
						sx={{ Position: UDim2.fromOffset(10, 14) }}
						onLeftClick={props.onBack}
					/>
				)}
				<frame Position={UDim2.fromOffset(props.narrow ? 82 : 14, 10)} Size={UDim2.fromOffset(44, 44)} BackgroundTransparency={1}>
					<Badge variant="dot" color="success" invisible={!props.thread.online}>
						<Avatar name={props.thread.name} size={44} />
					</Badge>
				</frame>
				<Typography
					text={props.thread.name}
					variant="subtitle2"
					sx={{ Position: UDim2.fromOffset(props.narrow ? 138 : 68, 11), Size: new UDim2(1, -210, 0, 22) }}
				/>
				<Typography
					text={props.thread.status}
					variant="caption"
					color="textSecondary"
					sx={{ Position: UDim2.fromOffset(props.narrow ? 138 : 68, 34), Size: new UDim2(1, -210, 0, 18) }}
				/>
				<Button
					text="Info"
					size="small"
					variant="outlined"
					sx={{ AnchorPoint: new Vector2(1, 0), Position: new UDim2(1, -10, 0, 14) }}
					onLeftClick={props.onInfo}
				/>
			</frame>
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, 64), Size: new UDim2(1, 0, 1, -176), p: 1 }}>
				<Stack direction="column" gap={0.5} sx={STACK}>
					<DaySeparator />
					{props.messages.map((message) => (
						<MessageRow key={message.id} message={message} onMenu={props.onMenu} />
					))}
					<Typography text={`${props.thread.name} is typing…`} variant="caption" color="textSecondary" sx={{ px: 1 }} />
				</Stack>
			</ScrollView>
			<frame
				Position={new UDim2(0, 0, 1, -112)}
				Size={new UDim2(1, 0, 0, 112)}
				BackgroundColor3={theme.palette.surface.paper}
				BorderSizePixel={0}
			>
				<uipadding
					PaddingLeft={new UDim(0, 10)}
					PaddingRight={new UDim(0, 10)}
					PaddingTop={new UDim(0, 9)}
					PaddingBottom={new UDim(0, 9)}
				/>
				<MultilineInput
					text={props.draft}
					placeholder="Write a message"
					variant="outlined"
					width={new UDim(1, -74)}
					multiline
					minRows={2}
					maxRows={4}
					onInput={props.onDraft}
					onTextChanged={props.onDraft}
				/>
				<Button
					text="Send"
					variant="contained"
					color="primary"
					disabled={props.draft.gsub("%s", "")[0].size() === 0}
					sx={{ AnchorPoint: new Vector2(1, 1), Position: UDim2.fromScale(1, 1) }}
					onLeftClick={props.onSend}
				/>
			</frame>
		</frame>
	);
}

function MessagingInbox(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [selectedId, setSelectedId] = useState(THREADS[0].id);
	const [phoneThread, setPhoneThread] = useState(false);
	const [query, setQuery] = useState("");
	const [messages, setMessages] = useState(SEED_MESSAGES);
	const [draft, setDraft] = useState("");
	const [infoOpen, setInfoOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState<TextButton>();
	const [menuMessage, setMenuMessage] = useState<Message>();
	const [notice, setNotice] = useState("");
	const selected = THREADS.find((thread) => thread.id === selectedId) ?? THREADS[0];
	const threadMessages = messages.filter((message) => message.threadId === selected.id);

	const choose = (thread: Thread) => {
		setSelectedId(thread.id);
		setPhoneThread(true);
	};
	const send = () => {
		const body = draft.gsub("^%s*(.-)%s*$", "%1")[0];
		if (body.size() === 0) return;
		setMessages([
			...messages,
			{
				id: `sent-${messages.size()}`,
				threadId: selected.id,
				author: "You",
				body,
				time: "Now",
				mine: true,
			},
		]);
		setDraft("");
		setNotice("Message sent");
	};
	const openMessageMenu = (message: Message, anchor: TextButton) => {
		setMenuMessage(message);
		setMenuAnchor(anchor);
		setMenuOpen(true);
	};

	const list = (
		<ConversationList
			threads={THREADS}
			selectedId={selectedId}
			query={query}
			onQuery={setQuery}
			onSelect={choose}
			phase={phase}
		/>
	);
	const thread = (
		<ThreadView
			thread={selected}
			messages={threadMessages}
			narrow={narrow}
			draft={draft}
			onDraft={setDraft}
			onBack={() => setPhoneThread(false)}
			onInfo={() => setInfoOpen(true)}
			onSend={send}
			onMenu={openMessageMenu}
		/>
	);

	return (
		<frame
			Size={new UDim2(0, size.width, 0, size.height)}
			BackgroundColor3={theme.palette.surface.canvas}
			BorderSizePixel={0}
			ClipsDescendants
		>
			<AppBar title="Inbox" elevation="raised">
				{phase === "error" && <Button text="Retry" size="small" variant="outlined" onLeftClick={() => setPhase("ready")} />}
			</AppBar>
			<frame Position={new UDim2(0, 0, 0, bar)} Size={new UDim2(1, 0, 1, -bar)} BackgroundTransparency={1}>
				{narrow ? (
					phoneThread && phase === "ready" ? thread : list
				) : (
					<>
						<frame Size={new UDim2(0, 340, 1, 0)} BackgroundTransparency={1}>{list}</frame>
						<frame Position={UDim2.fromOffset(340, 0)} Size={new UDim2(1, -340, 1, 0)} BackgroundTransparency={1}>
							{phase === "ready" ? thread : (
								<Box sx={{ Size: UDim2.fromScale(1, 1), bgcolor: "surface.canvas", p: 3 }}>
									<Typography text="Select a conversation when the inbox is ready." color="textSecondary" />
								</Box>
							)}
						</frame>
					</>
				)}
			</frame>
			<Menu
				anchor={menuAnchor}
				open={menuOpen}
				items={[
					{ id: "reply", text: "Reply" },
					{ id: "remove", text: "Remove from view" },
				]}
				onSelect={(id) => {
					setMenuOpen(false);
					if (id === "reply" && menuMessage !== undefined) setDraft(`${menuMessage.author}: `);
					if (id === "remove" && menuMessage !== undefined) {
						setMessages(messages.filter((message) => message.id !== menuMessage.id));
						setNotice("Message removed");
					}
				}}
				onClose={() => setMenuOpen(false)}
			/>
			<Drawer open={infoOpen} edge="right" width={320} onClose={() => setInfoOpen(false)}>
				<Stack direction="column" gap={2} sx={{ ...STACK, p: 2 }}>
					<Avatar name={selected.name} size={56} />
					<Typography text={selected.name} variant="h6" />
					<Typography text={selected.status} color="textSecondary" />
					<Switch label="Mute notifications" value={false} onChange={() => {}} />
					<Typography text="Shared files" variant="subtitle2" />
					{threadMessages
						.filter((message) => message.attachment !== undefined)
						.map((message) => <Chip key={message.id} label={message.attachment ?? ""} size="small" variant="outlined" />)}
				</Stack>
			</Drawer>
			<Snackbar
				message={notice}
				open={notice.size() > 0}
				variant={ToastVariants.success}
				onDismiss={() => setNotice("")}
			/>
		</frame>
	);
}

export default {
	title: "Scenarios/Messaging Inbox",
	description: "Responsive conversation list and message thread.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <MessagingInbox {...args} />,
};
