import React, { useEffect, useState } from "@rbxts/react";
import {
	AppBar,
	Avatar,
	Badge,
	Button,
	Chip,
	Divider,
	Icons,
	Input,
	Paper,
	ScrollView,
	Stack,
	Typography,
	useBreakpoints,
	useReducedMotion,
	useTheme,
} from "@rbxts/uiblox";

interface Thread {
	id: string;
	name: string;
	preview: string;
	time: string;
	unread: number;
	online: boolean;
	status: string;
	bot: boolean;
}

interface Msg {
	id: string;
	threadId: string;
	mine: boolean;
	author: string;
	body: string;
	time: string;
	file?: string;
	code?: string;
	reactions?: string[];
}

interface Live {
	chunks: string[];
	shown: number;
	code?: string;
}

const NARROW = 760;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const GREETING = ["The north gate is open. ", "I left the lamp check in a note. ", "Here is the gate script."];
const GREETING_CODE = "local gateOpen = true\nreturn gateOpen";
const REPLY = ["Logged. ", "I will watch the ridge until dusk. ", "Call this if the lamp drops."];
const REPLY_CODE = "local function lampOk()\n\treturn true\nend";

const THREADS: Thread[] = [
	{ id: "cove", name: "Cove", preview: "The north gate is open.", time: "9:16", unread: 0, online: true, status: "Online", bot: true },
	{ id: "pier", name: "Pier desk", preview: "The count is short by two.", time: "8:40", unread: 2, online: false, status: "Away", bot: false },
	{ id: "night", name: "Night notes", preview: "Lamp held through the last watch.", time: "Mon", unread: 0, online: false, status: "Last night", bot: false },
];

const SEED: Msg[] = [
	{ id: "u1", threadId: "cove", mine: true, author: "You", body: "Is the north gate open tonight?", time: "9:14" },
	{
		id: "b1",
		threadId: "cove",
		mine: false,
		author: "Cove",
		body: "Yes. The field team left this note before dusk.",
		time: "9:15",
		file: "ridge-note.txt",
		reactions: ["Noted", "Saved"],
	},
	{ id: "p1", threadId: "pier", mine: false, author: "Pier desk", body: "The count is short by two lanterns.", time: "8:02" },
	{ id: "p2", threadId: "pier", mine: true, author: "You", body: "I will recount them at the shed.", time: "8:11" },
	{ id: "n1", threadId: "night", mine: false, author: "Night notes", body: "Lamp held through the last watch.", time: "Mon" },
];

function joined(chunks: string[], shown: number) {
	let text = "";
	for (let index = 0; index < shown && index < chunks.size(); index++) text += chunks[index];
	return text;
}

function trim(value: string) {
	return value.gsub("^%s*(.-)%s*$", "%1")[0];
}

function TypingDots(props: { reduced: boolean }) {
	const { theme } = useTheme();
	const [tick, setTick] = useState(0);
	useEffect(() => {
		if (props.reduced) return;
		const thread = task.delay(0.35, () => setTick((value) => (value + 1) % 3));
		return () => task.cancel(thread);
	}, [tick, props.reduced]);
	return (
		<frame Size={new UDim2(1, 0, 0, 36)} BackgroundTransparency={1}>
			<frame Size={new UDim2(0, 72, 0, 28)} Position={UDim2.fromOffset(48, 0)} BackgroundColor3={theme.palette.surface.elevated} BorderSizePixel={0}>
				<uicorner CornerRadius={new UDim(0, 12)} />
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, 6)}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
				/>
				{[0, 1, 2].map((dot) => (
					<frame
						key={`dot-${dot}`}
						Size={UDim2.fromOffset(6, 6)}
						BackgroundColor3={theme.palette.text.secondary}
						BackgroundTransparency={props.reduced || dot <= tick ? 0.15 : 0.7}
						BorderSizePixel={0}
					>
						<uicorner CornerRadius={new UDim(1, 0)} />
					</frame>
				))}
			</frame>
		</frame>
	);
}

function CodeBlock(props: { text: string }) {
	const { theme } = useTheme();
	return (
		<Paper elevation="outlined" sx={{ ...STACK, bgcolor: "surface.input" }}>
			<textlabel
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				Font={Enum.Font.Code}
				Text={props.text}
				TextColor3={theme.palette.text.primary}
				TextSize={theme.typography.fontSizes.caption}
				TextWrapped
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
			/>
		</Paper>
	);
}

function Bubble(props: {
	message: Msg;
	picks: { [label: string]: boolean };
	onReact: (label: string) => void;
}) {
	const { theme } = useTheme();
	const message = props.message;
	const ink = message.mine ? theme.palette.primary.on : theme.palette.text.primary;
	const fill = message.mine ? theme.palette.primary.main : theme.palette.surface.elevated;
	return (
		<frame Size={STACK.Size} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			{!message.mine && (
				<frame Position={UDim2.fromOffset(0, 2)} Size={UDim2.fromOffset(36, 36)} BackgroundTransparency={1}>
					<Avatar name={message.author} size={36} />
				</frame>
			)}
			<frame
				AnchorPoint={new Vector2(message.mine ? 1 : 0, 0)}
				Position={message.mine ? new UDim2(1, -8, 0, 0) : UDim2.fromOffset(44, 0)}
				Size={new UDim2(0.78, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundColor3={fill}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, 14)} />
				{!message.mine && <uistroke Color={theme.palette.border} Transparency={0.45} Thickness={1} />}
				<uipadding PaddingTop={new UDim(0, 8)} PaddingBottom={new UDim(0, 8)} PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
				<Stack direction="column" gap={0.75} sx={STACK}>
					<Typography text={message.body} color={message.mine ? "inherit" : "textPrimary"} sx={{ ...STACK, TextColor3: ink }} />
					{message.file !== undefined && (
						<Paper elevation="outlined" sx={{ ...STACK, bgcolor: message.mine ? "primary.hover" : "surface.paper" }}>
							<Typography text={message.file} variant="caption" sx={{ TextColor3: ink, Size: new UDim2(1, 0, 0, 16) }} />
							<Typography text="Field note" variant="caption" color="textSecondary" sx={{ Size: new UDim2(1, 0, 0, 16) }} />
						</Paper>
					)}
					{message.code !== undefined && <CodeBlock text={message.code} />}
					{message.reactions !== undefined && (
						<Stack direction="row" gap={0.5} sx={{ Size: new UDim2(1, 0, 0, 28), AutomaticSize: Enum.AutomaticSize.None }}>
							{message.reactions.map((label) => (
								<Chip
									key={label}
									label={label}
									size="small"
									variant={props.picks[label] === true ? "filled" : "outlined"}
									color="primary"
									selected={props.picks[label] === true}
									onActivated={() => props.onReact(label)}
								/>
							))}
						</Stack>
					)}
					<Typography
						text={message.time}
						variant="caption"
						color={message.mine ? "inherit" : "textSecondary"}
						align="right"
						sx={{ Size: new UDim2(1, 0, 0, 14), TextColor3: message.mine ? theme.palette.primary.on : theme.palette.text.secondary }}
					/>
				</Stack>
			</frame>
		</frame>
	);
}

function ThreadRow(props: { thread: Thread; selected: boolean; onSelect: () => void }) {
	const { theme } = useTheme();
	const thread = props.thread;
	return (
		<textbutton
			Size={new UDim2(1, 0, 0, 72)}
			BackgroundColor3={props.selected ? theme.palette.action.selected : theme.palette.surface.paper}
			BackgroundTransparency={props.selected ? 0 : 1}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			Event={{ Activated: props.onSelect }}
		>
			<frame Position={UDim2.fromOffset(12, 14)} Size={UDim2.fromOffset(44, 44)} BackgroundTransparency={1}>
				<Badge variant="dot" color="success" invisible={!thread.online}>
					<Avatar name={thread.name} size={44} />
				</Badge>
			</frame>
			<Typography
				text={thread.name}
				variant="body"
				sx={{ Position: UDim2.fromOffset(68, 12), Size: new UDim2(1, -120, 0, 20) }}
			/>
			<Typography
				text={thread.preview}
				variant="caption"
				color="textSecondary"
				noWrap
				sx={{ Position: UDim2.fromOffset(68, 36), Size: new UDim2(1, -88, 0, 18) }}
			/>
			<Typography
				text={thread.time}
				variant="caption"
				color="textSecondary"
				align="right"
				sx={{ Position: new UDim2(1, -64, 0, 14), Size: UDim2.fromOffset(52, 16) }}
			/>
			{thread.unread > 0 && (
				<frame Position={new UDim2(1, -36, 0, 38)} Size={UDim2.fromOffset(22, 22)} BackgroundTransparency={1}>
					<Badge count={thread.unread} color="primary">
						<frame Size={UDim2.fromOffset(1, 1)} BackgroundTransparency={1} />
					</Badge>
				</frame>
			)}
		</textbutton>
	);
}

function MessagingAssistant() {
	const { theme } = useTheme();
	const reduced = useReducedMotion();
	const [host, setHost] = useState<Frame>();
	const view = useBreakpoints(host);
	const narrow = view.width < NARROW;
	const bar = theme.spacing.calc(7);
	const [threads, setThreads] = useState(THREADS);
	const [selectedId, setSelectedId] = useState(THREADS[0].id);
	const [showList, setShowList] = useState(false);
	const [messages, setMessages] = useState(SEED);
	const [draft, setDraft] = useState("");
	const [picks, setPicks] = useState<{ [id: string]: { [label: string]: boolean } }>({ b1: { Noted: true } });
	const [live, setLive] = useState<Live | undefined>({ chunks: GREETING, shown: 0, code: GREETING_CODE });
	const selected = threads.find((thread) => thread.id === selectedId) ?? threads[0];
	const visible = messages.filter((message) => message.threadId === selected.id);
	const partial =
		live !== undefined && selected.bot && live.shown > 0 && live.shown < live.chunks.size()
			? joined(live.chunks, live.shown)
			: "";
	const canSend = trim(draft).size() > 0 && live === undefined;

	useEffect(() => {
		if (live === undefined) return;
		const wait = reduced ? 0.6 : 0.45;
		const step = reduced ? live.chunks.size() : live.shown + 1;
		const thread = task.delay(wait, () => {
			if (step < live.chunks.size()) {
				setLive({ ...live, shown: step });
				return;
			}
			const body = joined(live.chunks, live.chunks.size());
			setMessages((prev) => [
				...prev,
				{ id: `live-${prev.size()}`, threadId: "cove", mine: false, author: "Cove", body, time: "Now", code: live.code },
			]);
			setThreads((prev) => prev.map((item) => (item.id === "cove" ? { ...item, preview: body, time: "Now" } : item)));
			setLive(undefined);
		});
		return () => task.cancel(thread);
	}, [live, reduced]);

	const open = (thread: Thread) => {
		setSelectedId(thread.id);
		setShowList(false);
		setThreads((prev) => prev.map((item) => (item.id === thread.id ? { ...item, unread: 0 } : item)));
	};
	const send = () => {
		const body = trim(draft);
		if (body.size() === 0 || live !== undefined) return;
		setMessages((prev) => [
			...prev,
			{ id: `you-${prev.size()}`, threadId: selected.id, mine: true, author: "You", body, time: "Now" },
		]);
		setDraft("");
		if (selected.bot) setLive({ chunks: REPLY, shown: 0, code: REPLY_CODE });
	};

	const list = (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={theme.palette.surface.paper} BorderSizePixel={0}>
			<ScrollView>
				<Stack direction="column" gap={0} sx={STACK}>
					{threads.map((thread) => (
						<ThreadRow key={thread.id} thread={thread} selected={thread.id === selected.id} onSelect={() => open(thread)} />
					))}
				</Stack>
			</ScrollView>
		</frame>
	);

	const conversation = (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0}>
			<frame Size={new UDim2(1, 0, 0, 64)} BackgroundColor3={theme.palette.surface.paper} BorderSizePixel={0}>
				<uigradient
					Rotation={90}
					Color={new ColorSequence(theme.palette.surface.elevated, theme.palette.surface.paper)}
				/>
				{narrow && (
					<Button text="Back" size="small" variant="text" sx={{ Position: UDim2.fromOffset(8, 16) }} onLeftClick={() => setShowList(true)} />
				)}
				<frame Position={UDim2.fromOffset(narrow ? 72 : 12, 10)} Size={UDim2.fromOffset(44, 44)} BackgroundTransparency={1}>
					<Badge variant="dot" color="success" invisible={!selected.online}>
						<Avatar name={selected.name} size={44} />
					</Badge>
				</frame>
				<Typography text={selected.name} variant="subtitle2" sx={{ Position: UDim2.fromOffset(narrow ? 124 : 64, 12), Size: new UDim2(1, -140, 0, 20) }} />
				<Typography
					text={selected.status}
					variant="caption"
					color="textSecondary"
					sx={{ Position: UDim2.fromOffset(narrow ? 124 : 64, 34), Size: new UDim2(1, -140, 0, 16) }}
				/>
			</frame>
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, 64), Size: new UDim2(1, 0, 1, -136), p: 1.5 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Divider text="Today" />
					{visible.map((message) => (
						<Bubble
							key={message.id}
							message={message}
							picks={picks[message.id] ?? {}}
							onReact={(label) =>
								setPicks((prev) => {
									const row = prev[message.id] ?? {};
									return { ...prev, [message.id]: { ...row, [label]: row[label] !== true } };
								})
							}
						/>
					))}
					{partial.size() > 0 && (
						<Bubble
							message={{ id: "partial", threadId: selected.id, mine: false, author: selected.name, body: partial, time: "Now" }}
							picks={{}}
							onReact={() => {}}
						/>
					)}
					{live !== undefined && selected.bot && live.shown === 0 && <TypingDots reduced={reduced} />}
				</Stack>
			</ScrollView>
			<frame Position={new UDim2(0, 0, 1, -72)} Size={new UDim2(1, 0, 0, 72)} BackgroundColor3={theme.palette.surface.paper} BorderSizePixel={0}>
				<Divider />
				<Input
					text={draft}
					placeholder={selected.bot ? "Message Cove" : "Write a message"}
					variant="outlined"
					width={new UDim(1, -96)}
					sx={{ Position: UDim2.fromOffset(12, 16) }}
					onTextChanged={setDraft}
					onEnterPressed={() => send()}
				/>
				<Button
					text="Send"
					icon={Icons.Collapsed}
					variant="contained"
					color="primary"
					disabled={!canSend}
					sx={{ AnchorPoint: new Vector2(1, 0.5), Position: new UDim2(1, -12, 0.5, 0) }}
					onLeftClick={send}
				/>
			</frame>
		</frame>
	);

	return (
		<frame
			ref={setHost}
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={theme.palette.surface.canvas}
			BorderSizePixel={0}
		>
			<AppBar title="Assistant" elevation="raised" />
			<frame Position={new UDim2(0, 0, 0, bar)} Size={new UDim2(1, 0, 1, -bar)} BackgroundTransparency={1}>
				{narrow ? (
					showList ? list : conversation
				) : (
					<>
						<frame Size={new UDim2(0, 300, 1, 0)} BackgroundTransparency={1}>
							{list}
						</frame>
						<frame Position={UDim2.fromOffset(300, 0)} Size={new UDim2(1, -300, 1, 0)} BackgroundTransparency={1}>
							{conversation}
						</frame>
					</>
				)}
			</frame>
		</frame>
	);
}

export default {
	title: "Scenarios/Messaging Assistant",
	description: "Assistant thread with a live reply, notes, and a narrow single pane.",
	preview: { kind: "gui", width: 1120, height: 760 },
	tags: ["scenario"],
	render: () => <MessagingAssistant />,
};
