import React, { useState } from "@rbxts/react";
import {
	Alert,
	Button,
	Card,
	Chip,
	Drawer,
	EmptyListHint,
	Input,
	Rating,
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

interface Review {
	id: string;
	title: string;
	blurb: string;
	note: string;
	person: string;
	stars: number;
	status: "Posted" | "Held";
	helpful: number;
}

interface StarsProps {
	value: number;
	readOnly?: boolean;
	size?: "small" | "medium" | "large";
}

interface ShelfCardProps {
	title?: string;
	subtitle?: string;
	elevation?: "flat" | "raised" | "outlined";
	fullWidth?: boolean;
	actions?: React.ReactNode;
	children?: React.ReactNode;
}

const Stars = Rating as unknown as (props: StarsProps) => React.Element;
const ShelfCard = Card as unknown as (props: ShelfCardProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const FILTERS = ["All", "Posted", "Held", "High"];

const SEED: Review[] = [
	{
		id: "dune",
		title: "North dune",
		blurb: "Late light on the open sand, and room to sit.",
		note: "Late light on the open sand, and room to sit. The wind stays low until dusk. Mara would walk it again.",
		person: "Mara Voss",
		stars: 4,
		status: "Posted",
		helpful: 6,
	},
	{
		id: "cove",
		title: "Cove bench",
		blurb: "A still hour by the water.",
		note: "A still hour by the water. The bench faces the cove and the lamp stays lit. Owen left it as he found it.",
		person: "Owen Pell",
		stars: 5,
		status: "Posted",
		helpful: 9,
	},
	{
		id: "pier",
		title: "Quiet pier",
		blurb: "The boards creak, then go quiet.",
		note: "The boards creak, then go quiet. Hold the rail if the tide is up. Ivo waited out one shower there.",
		person: "Ivo Lane",
		stars: 3,
		status: "Held",
		helpful: 2,
	},
	{
		id: "gate",
		title: "Field gate",
		blurb: "Dusk closes the path.",
		note: "Dusk closes the path. The gate shuts when the light drops. Wait at the cove if you are still out.",
		person: "Desk notes",
		stars: 4,
		status: "Posted",
		helpful: 3,
	},
	{
		id: "ridge",
		title: "Ridge mark",
		blurb: "Wind, and a long walk between posts.",
		note: "Wind, and a long walk between posts. Keep the next marker in sight. Mara turned back once when the light went.",
		person: "Mara Voss",
		stars: 2,
		status: "Held",
		helpful: 1,
	},
	{
		id: "shelf",
		title: "Tide shelf",
		blurb: "Low water and a flat walk.",
		note: "Low water and a flat walk. The shelf shows for an hour, then the tide takes it. Owen marked the dry line.",
		person: "Owen Pell",
		stars: 5,
		status: "Posted",
		helpful: 4,
	},
];

function matches(review: Review, query: string, filter: string) {
	if (filter === "Posted" || filter === "Held") {
		if (review.status !== filter) return false;
	}
	if (filter === "High" && review.stars < 4) return false;
	const needle = query.lower();
	if (needle.size() === 0) return true;
	const hay = `${review.title} ${review.blurb} ${review.person}`.lower();
	return string.find(hay, needle, 1, true) !== undefined;
}

function findReview(list: Review[], id: string) {
	for (const review of list) if (review.id === id) return review;
	return undefined;
}

function ReviewCard(props: { review: Review; onOpen: (id: string) => void }) {
	return (
		<ShelfCard
			fullWidth
			elevation="raised"
			title={props.review.title}
			subtitle={props.review.person}
			actions={<Button text="Read" size="small" variant="text" onLeftClick={() => props.onOpen(props.review.id)} />}
		>
			<Stack direction="column" gap={1} sx={STACK}>
				<Stars value={props.review.stars} readOnly size="small" />
				<Typography text={props.review.blurb} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y, TextWrapped: true }} />
				<Chip label={props.review.status} variant={props.review.status === "Posted" ? "filled" : "outlined"} />
			</Stack>
		</ShelfCard>
	);
}

function ReviewShelf(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const columns = narrow ? 1 : 2;
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [reviews, setReviews] = useState(SEED);
	const [openId, setOpenId] = useState("");
	const [notice, setNotice] = useState("");
	const open = findReview(reviews, openId);
	const shown: Review[] = [];
	for (const review of reviews) if (matches(review, query, filter)) shown.push(review);
	const rows: Review[][] = [];
	for (let index = 0; index < shown.size(); index += columns) {
		const row: Review[] = [];
		for (let column = 0; column < columns; column++) {
			const review = shown[index + column];
			if (review !== undefined) row.push(review);
		}
		rows.push(row);
	}

	const markHelpful = () => {
		if (open === undefined) return;
		const copy: Review[] = [];
		for (const review of reviews) copy.push(review.id === open.id ? { ...review, helpful: review.helpful + 1 } : review);
		setReviews(copy);
		setNotice("Marked helpful");
	};

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Reviews" variant="h2" sx={{ Size: new UDim2(1, 0, 0, 32) }} />
					<Input text={query} placeholder="Search places" onTextChanged={setQuery} />
					<Stack direction="row" gap={1} wrap sx={STACK}>
						{FILTERS.map((name) => (
							<Chip key={name} label={name} selected={filter === name} variant={filter === name ? "filled" : "outlined"} onActivated={() => setFilter(name)} />
						))}
					</Stack>
					{phase === "error" ? (
						<Alert severity="error" title="Reviews unavailable" message="The desk could not open this shelf." onClose={() => setPhase("ready")} />
					) : phase === "loading" ? (
						<Stack direction="column" gap={1} sx={STACK}>
							{[0, 1, 2].map((value) => (
								<Skeleton key={value} variant="rectangular" width={narrow ? 320 : 480} height={96} />
							))}
						</Stack>
					) : phase === "empty" || shown.size() === 0 ? (
						<EmptyListHint text={phase === "empty" ? "No reviews yet." : "Nothing in this view."} height={72} />
					) : (
						<Stack direction="column" gap={1} sx={STACK}>
							{rows.map((row, index) => (
								<frame
									key={`row-${index}`}
									Size={new UDim2(1, 0, 0, 0)}
									AutomaticSize={Enum.AutomaticSize.Y}
									BackgroundTransparency={1}
									BorderSizePixel={0}
								>
									<uilistlayout
										FillDirection={Enum.FillDirection.Horizontal}
										Padding={new UDim(0, 12)}
										SortOrder={Enum.SortOrder.LayoutOrder}
									/>
									{row.map((review, column) => (
										<frame
											key={review.id}
											LayoutOrder={column}
											Size={new UDim2(1 / columns, columns > 1 ? -6 : 0, 0, 0)}
											AutomaticSize={Enum.AutomaticSize.Y}
											BackgroundTransparency={1}
											BorderSizePixel={0}
										>
											<ReviewCard review={review} onOpen={setOpenId} />
										</frame>
									))}
								</frame>
							))}
						</Stack>
					)}
				</Stack>
			</ScrollView>
			<Drawer open={open !== undefined} edge="right" width={narrow ? 320 : 420} onClose={() => setOpenId("")}>
				{open !== undefined ? (
					<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
						<Typography text={open.title} variant="h2" sx={{ Size: new UDim2(1, 0, 0, 32) }} />
						<Stars value={open.stars} readOnly />
						<Typography text={open.person} color="textSecondary" sx={{ Size: new UDim2(1, 0, 0, 20) }} />
						<Chip label={open.status} variant={open.status === "Posted" ? "filled" : "outlined"} />
						<Typography text={open.note} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y, TextWrapped: true }} />
						<Typography text={`${open.helpful} found this helpful`} variant="caption" color="textSecondary" sx={{ Size: new UDim2(1, 0, 0, 16) }} />
						<Stack direction="row" gap={1} sx={STACK}>
							<Button text="Helpful" size="small" variant="outlined" onLeftClick={markHelpful} />
							<Button text="Share" size="small" variant="text" onLeftClick={() => setNotice(`Kept ${open.title}`)} />
						</Stack>
					</Stack>
				) : undefined}
			</Drawer>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Review Shelf",
	description: "A catalog of place reviews with read-only ratings.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <ReviewShelf {...args} />,
};
