import React, { useState } from "@rbxts/react";
import {
	Alert,
	Button,
	EmptyListHint,
	ListItem,
	Markdown,
	Paper,
	ScrollView,
	Skeleton,
	Snackbar,
	Stack,
	ToastVariants,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Letter {
	id: string;
	title: string;
	date: string;
	greeting: string;
	body: string;
	sign: string;
}

interface BodyProps {
	value?: string;
	onLink?: (payload: { text: string; href: string }) => void;
}

const Body = Markdown as unknown as (props: BodyProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const PAGE = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const LETTERS: Letter[] = [
	{
		id: "pier",
		title: "West pier",
		date: "6 Oct",
		greeting: "Hello Owen,",
		body: "The lamp on the [west pier](west-pier) is lit again, so the path is easy to follow.\n\nI left the spare key under the [blue dish](blue-dish) if you arrive after dusk.",
		sign: "Mara",
	},
	{
		id: "table",
		title: "Sunday table",
		date: "5 Oct",
		greeting: "Hello Mara,",
		body: "There is a place for you at the [sunday table](sunday-table), beside the window.\n\nBring the [small bowl](small-bowl) if you still have it from last week.",
		sign: "Owen",
	},
	{
		id: "hour",
		title: "Quiet hour",
		date: "4 Oct",
		greeting: "Hello Ivo,",
		body: "The hall is empty during the [quiet hour](quiet-hour), if you want the long table.\n\nI pinned the [gate note](gate-note) above the desk so it is easy to find.",
		sign: "Rae",
	},
	{
		id: "key",
		title: "Spare key",
		date: "3 Oct",
		greeting: "Hello Rae,",
		body: "The spare key is on the [hook](hook) by the side door, not in the drawer.\n\nLock the [shed](shed) when you leave, and leave the lamp burning.",
		sign: "Ivo",
	},
];

function LetterScreen(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [index, setIndex] = useState(0);
	const [reading, setReading] = useState(false);
	const [notice, setNotice] = useState("");
	const letter = LETTERS[index];
	const showList = !narrow || !reading;
	const showLetter = !narrow || reading;

	const list = (
		<Stack direction="column" gap={0} sx={STACK}>
			{LETTERS.map((item, itemIndex) => (
				<ListItem
					key={item.id}
					text={item.title}
					secondary={item.date}
					selected={itemIndex === index}
					onActivated={() => {
						setIndex(itemIndex);
						setReading(true);
					}}
				/>
			))}
		</Stack>
	);

	const page =
		letter === undefined ? (
			<EmptyListHint text="No letter open." height={72} />
		) : (
			<Paper elevation="outlined" sx={PAGE}>
				<Stack direction="column" gap={1} sx={STACK}>
					{narrow && <Button text="All letters" size="small" variant="text" onLeftClick={() => setReading(false)} />}
					<Typography text={letter.date} color="textSecondary" sx={SHRINK} />
					<Typography text={letter.greeting} variant="h6" sx={SHRINK} />
					<Body value={letter.body} onLink={(payload) => setNotice(payload.text)} />
					<Typography text={letter.sign} sx={SHRINK} />
					<Stack direction="row" gap={1} sx={STACK}>
						<Button text="Previous" size="small" variant="outlined" disabled={index <= 0} onLeftClick={() => setIndex(index - 1)} />
						<Button
							text="Next"
							size="small"
							variant="outlined"
							disabled={index >= LETTERS.size() - 1}
							onLeftClick={() => setIndex(index + 1)}
						/>
					</Stack>
				</Stack>
			</Paper>
		);

	const ready = (
		<Stack direction={narrow ? "column" : "row"} gap={2} alignItems="start" sx={STACK}>
			{showList ? (
				<Stack direction="column" gap={1} sx={{ Size: narrow ? new UDim2(1, 0, 0, 0) : new UDim2(0, 280, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
					<Typography text="Letters" variant="h5" sx={SHRINK} />
					{list}
				</Stack>
			) : undefined}
			{showLetter ? (
				<Stack direction="column" gap={1} sx={{ Size: narrow ? new UDim2(1, 0, 0, 0) : new UDim2(1, -300, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
					{page}
				</Stack>
			) : undefined}
		</Stack>
	);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Letters unavailable" message="The desk could not open this stack." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				<Skeleton variant="text" width={160} height={24} />
				<Skeleton variant="rectangular" width={narrow ? 340 : 640} height={180} />
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No letters on the desk." height={72} />
		) : (
			ready
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.default} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Letter",
	description: "A short stack of letters with links that stay in the sentence.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <LetterScreen {...args} />,
};
