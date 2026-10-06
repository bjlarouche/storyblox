import React, { useState } from "@rbxts/react";
import {
	Alert,
	AppBar,
	Button,
	Dialog,
	Drawer,
	EmptyListHint,
	FormHelperText,
	Input,
	ListItem,
	Markdown,
	ScrollView,
	Skeleton,
	Snackbar,
	Stack,
	ToastVariants,
	Tooltip,
	TreeView,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Article {
	id: string;
	topic: string;
	title: string;
	blurb: string;
	body: string;
	related: string[];
}

interface RowProps {
	text: string;
	secondary?: string;
	wrap?: boolean;
	divider?: boolean;
	selected?: boolean;
	onActivated?: () => void;
}

const Row = ListItem as unknown as (props: RowProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const FILL = { Size: new UDim2(1, 0, 1, 0) };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const TOPICS = ["Start", "Field", "Account"];

const ARTICLES: Article[] = [
	{
		id: "welcome",
		topic: "Start",
		title: "Welcome",
		blurb: "How the field desk answers questions from the ridge, the dock, and the trail.",
		related: ["first", "route"],
		body: "# Welcome\n\nThe field desk keeps short notes for people who work outside.\n\n## What you will find\n\n- How to start a first visit\n- How the north route is marked\n- How sign-in and privacy work\n\n> Notes here are written by the desk.",
	},
	{
		id: "first",
		topic: "Start",
		title: "First visit",
		blurb: "What to bring, who to tell, and where to wait if the gate is closed.",
		related: ["welcome", "supplies"],
		body: "# First visit\n\nArrive at the cove marker and give the desk your name.\n\n## Bring\n\n- A filled bottle\n- The dock list if you are carrying supplies\n- A return time the crew can read\n\nIf the gate is shut, wait on the bench and send a note.",
	},
	{
		id: "route",
		topic: "Field",
		title: "North route",
		blurb: "Markers, wind, and when to stop instead of pushing through the ridge.",
		related: ["supplies", "welcome"],
		body: "# North route\n\nThe north route stays open after sunrise.\n\n## Before you leave\n\n- Read the ridge wind note\n- Pack the dock list\n- Tell the crew your return time\n\n> Keep the next marker in sight when the light drops.\n\n## If the path is closed\n\nWait at the cove. Do not cut across the dune.",
	},
	{
		id: "supplies",
		topic: "Field",
		title: "Dock supplies",
		blurb: "What the morning crate should hold before anyone leaves the pier.",
		related: ["route", "first"],
		body: "# Dock supplies\n\nThe morning crate sits at the end of the pier.\n\n## Count\n\n1. Two coils of line\n2. One lamp with a spare\n3. The tide card for the day\n\nReplace anything you take before the next crew arrives.",
	},
	{
		id: "signin",
		topic: "Account",
		title: "Signing in",
		blurb: "When the desk asks for a name, and what to do if it does not match.",
		related: ["privacy", "welcome"],
		body: "# Signing in\n\nUse the name the crew already knows.\n\n## If it does not match\n\n- Check the spelling on your last note\n- Ask the desk to read it back\n- Wait while they look up the visit\n\nA wrong name does not lock you out. It only slows the lookup.",
	},
	{
		id: "privacy",
		topic: "Account",
		title: "What we keep",
		blurb: "Visit notes stay with the desk and are not posted on the trail.",
		related: ["signin", "welcome"],
		body: "# What we keep\n\nThe desk keeps your name, your return time, and the notes you send.\n\n## We do not keep\n\n- A copy of the route map\n- Recordings from the ridge\n- Notes you asked us to drop\n\nAsk the desk to drop a note and it leaves the book.",
	},
];

function findArticle(id: string) {
	for (const article of ARTICLES) {
		if (article.id === id) return article;
	}
	return ARTICLES[0];
}

function listedArticles(query: string, topic: string) {
	const needle = query.lower();
	const out: Article[] = [];
	for (const article of ARTICLES) {
		if (needle.size() === 0 && article.topic !== topic) continue;
		if (needle.size() > 0) {
			const hay = `${article.title} ${article.blurb}`.lower();
			if (string.find(hay, needle, 1, true) === undefined) continue;
		}
		out.push(article);
	}
	return out;
}

function topicTree(onTopic: (name: string) => void) {
	return {
		title: "Topics",
		branches: TOPICS.map((name) => ({
			title: name,
			leaves: [],
			onClick: () => onTopic(name),
		})),
	};
}

function TicketFields(props: {
	subject: string;
	detail: string;
	error: string;
	onSubject: (value: string) => void;
	onDetail: (value: string) => void;
}) {
	return (
		<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
			<Input text={props.subject} placeholder="Subject" width={new UDim(1, 0)} onInput={props.onSubject} />
			{props.error.size() > 0 ? <FormHelperText text={props.error} hasError /> : undefined}
			<Input text={props.detail} placeholder="What should we look at?" width={new UDim(1, 0)} onInput={props.onDetail} />
		</Stack>
	);
}

function NoteList(props: { articles: Article[]; current: string; onOpen: (id: string) => void }) {
	return (
		<ScrollView sx={FILL}>
			<Stack direction="column" gap={0} sx={STACK}>
				{props.articles.map((article) => (
					<Row
						key={article.id}
						text={article.title}
						secondary={article.blurb}
						wrap
						divider
						selected={article.id === props.current}
						onActivated={() => props.onOpen(article.id)}
					/>
				))}
			</Stack>
		</ScrollView>
	);
}

function NoteBody(props: { article: Article; onOpen: (id: string) => void; onVote: (kind: string) => void }) {
	return (
		<ScrollView sx={FILL}>
			<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
				<Typography text={props.article.topic} color="textSecondary" variant="caption" />
				<Typography text={props.article.title} variant="h2" />
				<Markdown value={props.article.body} />
				<Typography text="Related" variant="h3" />
				{props.article.related.map((id) => {
					const article = findArticle(id);
					return (
						<Row
							key={id}
							text={article.title}
							secondary={article.blurb}
							wrap
							onActivated={() => props.onOpen(id)}
						/>
					);
				})}
				<Stack direction="row" gap={1} sx={STACK}>
					<Tooltip text="This page answered the question">
						<Button text="Helpful" size="small" variant="outlined" onLeftClick={() => props.onVote("up")} />
					</Tooltip>
					<Tooltip text="This page needs a clearer note">
						<Button text="Not helpful" size="small" variant="outlined" onLeftClick={() => props.onVote("down")} />
					</Tooltip>
				</Stack>
			</Stack>
		</ScrollView>
	);
}

function HelpCenter(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const searchRow = narrow ? 96 : 52;
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [query, setQuery] = useState("");
	const [topic, setTopic] = useState("Start");
	const [articleId, setArticleId] = useState("welcome");
	const [pane, setPane] = useState<"topics" | "articles" | "read">("articles");
	const [ticket, setTicket] = useState(false);
	const [subject, setSubject] = useState("");
	const [detail, setDetail] = useState("");
	const [ticketError, setTicketError] = useState("");
	const [notice, setNotice] = useState("");

	const listed = listedArticles(query, topic);
	const article = findArticle(articleId);
	const showTopics = !narrow || pane === "topics";
	const showList = !narrow || pane === "articles";
	const showArticle = !narrow || pane === "read";

	const chooseTopic = (name: string) => {
		setTopic(name);
		if (query.size() === 0) {
			for (const item of ARTICLES) {
				if (item.topic === name) {
					setArticleId(item.id);
					break;
				}
			}
		}
		if (narrow) setPane("articles");
	};
	const openArticle = (id: string) => {
		const item = findArticle(id);
		setArticleId(item.id);
		setTopic(item.topic);
		if (narrow) setPane("read");
	};
	const goBack = () => {
		if (pane === "read") setPane("articles");
		else setPane("topics");
	};
	const sendTicket = () => {
		const cleaned = subject.gsub("^%s*(.-)%s*$", "%1")[0];
		if (cleaned.size() < 2) {
			setTicketError("Add a short subject");
			return;
		}
		setTicket(false);
		setTicketError("");
		setSubject("");
		setDetail("");
		setNotice("Sent to the field desk");
	};
	const vote = (kind: string) => {
		setNotice(kind === "up" ? "Marked helpful" : "Marked for a clearer note");
	};

	const fields = (
		<TicketFields
			subject={subject}
			detail={detail}
			error={ticketError}
			onSubject={(value) => {
				setSubject(value);
				setTicketError("");
			}}
			onDetail={setDetail}
		/>
	);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<AppBar title="Help Center" elevation="raised">
				{phase === "error" ? <Button text="Retry" size="small" variant="outlined" onLeftClick={() => setPhase("ready")} /> : undefined}
			</AppBar>
			<frame
				Position={new UDim2(0, 8, 0, bar)}
				Size={new UDim2(1, -16, 0, searchRow)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				{narrow ? (
					<Stack direction="column" gap={1} sx={STACK}>
						<Stack direction="row" gap={1} sx={STACK}>
							{pane !== "topics" ? <Button text="Back" size="small" variant="text" onLeftClick={goBack} /> : undefined}
							<Button text="Topics" size="small" variant="outlined" onLeftClick={() => setPane("topics")} />
							<Button text="Contact" size="small" variant="contained" onLeftClick={() => setTicket(true)} />
						</Stack>
						<Input
							text={query}
							placeholder="Search notes"
							width={new UDim(1, 0)}
							onInput={(value) => {
								setQuery(value);
								if (value.size() > 0) setPane("articles");
							}}
						/>
					</Stack>
				) : (
					<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
						<Input text={query} placeholder="Search notes" width={new UDim(0, 360)} onInput={setQuery} />
						<Button text="Contact" size="small" variant="contained" onLeftClick={() => setTicket(true)} />
					</Stack>
				)}
			</frame>
			<frame
				Position={new UDim2(0, 0, 0, bar + searchRow)}
				Size={new UDim2(1, 0, 1, -(bar + searchRow))}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				{phase === "error" ? (
					<Alert severity="error" title="Notes unavailable" message="The desk could not open this page." onClose={() => setPhase("ready")} />
				) : undefined}
				{phase !== "error" ? <uilistlayout FillDirection={Enum.FillDirection.Horizontal} SortOrder={Enum.SortOrder.LayoutOrder} /> : undefined}
				{phase !== "error" && showTopics ? (
					<frame Size={narrow ? FILL.Size : new UDim2(0, 220, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0} LayoutOrder={1}>
						<TreeView tree={topicTree(chooseTopic)} selected={topic} />
					</frame>
				) : undefined}
				{phase !== "error" && showList ? (
					<frame Size={narrow ? FILL.Size : new UDim2(0, 320, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0} LayoutOrder={2}>
						{phase === "loading" ? (
							<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
								{[0, 1, 2, 3].map((value) => (
									<Skeleton key={value} variant="text" width={240} height={18} />
								))}
							</Stack>
						) : phase === "empty" ? (
							<EmptyListHint text="No notes are published yet." height={72} />
						) : listed.size() === 0 ? (
							<EmptyListHint text="No notes match this search." height={72} />
						) : (
							<NoteList articles={listed} current={articleId} onOpen={openArticle} />
						)}
					</frame>
				) : undefined}
				{phase !== "error" && showArticle ? (
					<frame Size={narrow ? FILL.Size : new UDim2(1, -540, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0} LayoutOrder={3}>
						{phase === "loading" || phase === "empty" ? (
							<EmptyListHint text="Pick a note when the list is ready." height={72} />
						) : (
							<NoteBody article={article} onOpen={openArticle} onVote={vote} />
						)}
					</frame>
				) : undefined}
			</frame>
			{narrow ? (
				<Drawer open={ticket} edge="right" width={320} onClose={() => setTicket(false)}>
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography text="Write the desk" variant="h3" sx={{ ...STACK, p: 2 }} />
						{fields}
						<Stack direction="row" gap={1} sx={{ ...STACK, p: 2 }}>
							<Button text="Cancel" size="small" variant="text" onLeftClick={() => setTicket(false)} />
							<Button text="Send" size="small" variant="contained" onLeftClick={sendTicket} />
						</Stack>
					</Stack>
				</Drawer>
			) : (
				<Dialog
					open={ticket}
					title="Write the desk"
					onClose={() => setTicket(false)}
					actions={
						<>
							<Button text="Cancel" size="small" variant="text" onLeftClick={() => setTicket(false)} />
							<Button text="Send" size="small" variant="contained" onLeftClick={sendTicket} />
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
	title: "Scenarios/Help Center",
	description: "Responsive notes with topics, articles, and a desk ticket.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <HelpCenter {...args} />,
};
