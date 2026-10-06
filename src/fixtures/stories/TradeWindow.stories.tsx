import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Button,
	Chip,
	Dialog,
	EmptyListHint,
	NumberInput,
	Paper,
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

interface Goods {
	id: string;
	label: string;
	owned: number;
}

interface Offer {
	id: string;
	count: number;
}

interface LabelProps {
	text?: string;
	wrap?: boolean;
	sx?: { fontSize?: number; TextColor3?: Color3 };
}

interface QtyProps {
	value: number;
	min?: number;
	max?: number;
	step?: number;
	stepper?: boolean;
	size?: "small";
	width?: UDim;
	onChange: (value: number) => void;
}

interface DeskDialogProps {
	open: boolean;
	title?: string;
	fullWidth?: boolean;
	onClose: () => void;
	children?: React.ReactNode;
	actions?: React.ReactNode;
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const Qty = NumberInput as unknown as (props: QtyProps) => React.Element;
const DeskDialog = Dialog as unknown as (props: DeskDialogProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const YOU: Goods[] = [
	{ id: "salt", label: "Salt", owned: 6 },
	{ id: "twine", label: "Twine", owned: 4 },
	{ id: "nails", label: "Nails", owned: 10 },
	{ id: "cork", label: "Cork", owned: 3 },
];

const OWEN: Goods[] = [
	{ id: "wool", label: "Wool", owned: 5 },
	{ id: "flint", label: "Flint", owned: 8 },
	{ id: "tallow", label: "Tallow", owned: 2 },
	{ id: "char", label: "Char", owned: 7 },
];

function labelOf(stock: Goods[], id: string) {
	for (const item of stock) if (item.id === id) return item.label;
	return id;
}

function ownedOf(stock: Goods[], id: string) {
	for (const item of stock) if (item.id === id) return item.owned;
	return 0;
}

function lineCount(offer: Offer[], id: string) {
	for (const line of offer) if (line.id === id) return line.count;
	return 0;
}

function putLine(offer: Offer[], id: string, count: number) {
	const copy: Offer[] = [];
	let found = false;
	for (const line of offer) {
		if (line.id === id) {
			found = true;
			if (count > 0) copy.push({ id, count });
		} else copy.push(line);
	}
	if (!found && count > 0) copy.push({ id, count });
	return copy;
}

function settle(stock: Goods[], give: Offer[], receive: Offer[], names: Goods[]) {
	const copy: Goods[] = [];
	for (const item of stock) copy.push({ ...item });
	const adjust = (id: string, delta: number) => {
		for (const item of copy) {
			if (item.id !== id) continue;
			item.owned += delta;
			return;
		}
		if (delta > 0) copy.push({ id, label: labelOf(names, id), owned: delta });
	};
	for (const line of give) adjust(line.id, -line.count);
	for (const line of receive) adjust(line.id, line.count);
	const kept: Goods[] = [];
	for (const item of copy) if (item.owned > 0) kept.push(item);
	return kept;
}

function OfferLines(props: { offer: Offer[]; stock: Goods[]; empty: string }) {
	if (props.offer.size() === 0) return <Label text={props.empty} wrap />;
	return (
		<Stack direction="column" gap={0} sx={STACK}>
			{props.offer.map((line) => (
				<Label key={line.id} text={`${line.count} ${labelOf(props.stock, line.id)}`} wrap />
			))}
		</Stack>
	);
}

function Pack(props: {
	title: string;
	stock: Goods[];
	offer: Offer[];
	ready: boolean;
	onCount: (id: string, count: number) => void;
	onReady: () => void;
}) {
	return (
		<Paper sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
			<Stack direction="column" gap={1} sx={STACK}>
				<Label text={props.title} sx={{ fontSize: 22 }} />
				<Chip label={props.ready ? "Ready" : "Waiting"} variant={props.ready ? "filled" : "outlined"} color={props.ready ? "primary" : "default"} />
				<Stack direction="row" gap={1} wrap sx={STACK}>
					{props.stock.map((item) => (
						<Chip
							key={item.id}
							label={`${item.label} ${item.owned}`}
							variant={lineCount(props.offer, item.id) > 0 ? "filled" : "outlined"}
							onActivated={() => {
								const current = lineCount(props.offer, item.id);
								if (current >= item.owned) return;
								props.onCount(item.id, current === 0 ? 1 : current);
							}}
						/>
					))}
				</Stack>
				{props.offer.size() === 0 ? (
					<Label text="Nothing offered." wrap />
				) : (
					props.offer.map((line) => {
						const owned = ownedOf(props.stock, line.id);
						return (
							<Stack key={line.id} direction="row" gap={1} alignItems="center" wrap sx={STACK}>
								<Label text={`${labelOf(props.stock, line.id)} ${line.count}/${owned}`} />
								<Qty
									value={line.count}
									min={1}
									max={owned > 0 ? owned : 1}
									step={1}
									stepper
									size="small"
									width={new UDim(0, 48)}
									onChange={(count) => props.onCount(line.id, count)}
								/>
								<Button text="Drop" size="small" variant="text" onLeftClick={() => props.onCount(line.id, 0)} />
							</Stack>
						);
					})
				)}
				<Button text={props.ready ? "Not ready" : "Ready"} size="small" variant={props.ready ? "outlined" : "contained"} onLeftClick={props.onReady} />
			</Stack>
		</Paper>
	);
}

function TradeWindow(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [yours, setYours] = useState(YOU);
	const [theirs, setTheirs] = useState(OWEN);
	const [yourOffer, setYourOffer] = useState<Offer[]>([]);
	const [theirOffer, setTheirOffer] = useState<Offer[]>([]);
	const [youReady, setYouReady] = useState(false);
	const [themReady, setThemReady] = useState(false);
	const [confirm, setConfirm] = useState(false);
	const [notice, setNotice] = useState("");
	const moves = yourOffer.size() + theirOffer.size() > 0;
	const bothReady = youReady && themReady && moves;

	const setYoursCount = (id: string, count: number) => {
		const owned = ownedOf(yours, id);
		const capped = count > owned ? owned : count;
		setYourOffer(putLine(yourOffer, id, capped));
		setYouReady(false);
		setConfirm(false);
	};
	const setTheirsCount = (id: string, count: number) => {
		const owned = ownedOf(theirs, id);
		const capped = count > owned ? owned : count;
		setTheirOffer(putLine(theirOffer, id, capped));
		setThemReady(false);
		setConfirm(false);
	};
	const commit = () => {
		setYours(settle(yours, yourOffer, theirOffer, theirs));
		setTheirs(settle(theirs, theirOffer, yourOffer, yours));
		setYourOffer([]);
		setTheirOffer([]);
		setYouReady(false);
		setThemReady(false);
		setConfirm(false);
		setNotice("Trade kept");
	};

	const packs = (
		<Stack direction="column" gap={1} sx={STACK}>
			<Label text="Trade window" sx={{ fontSize: 28 }} />
			<Label text="With Owen Pell" sx={{ TextColor3: theme.palette.text.secondary }} />
			{narrow ? (
				<Stack direction="column" gap={1} sx={STACK}>
					<Pack title="Your pack" stock={yours} offer={yourOffer} ready={youReady} onCount={setYoursCount} onReady={() => setYouReady(!youReady)} />
					<Pack title="Owen Pell" stock={theirs} offer={theirOffer} ready={themReady} onCount={setTheirsCount} onReady={() => setThemReady(!themReady)} />
				</Stack>
			) : (
				<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 16)} VerticalAlignment={Enum.VerticalAlignment.Top} SortOrder={Enum.SortOrder.LayoutOrder} />
					<frame LayoutOrder={0} Size={new UDim2(0.5, -8, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						<Pack title="Your pack" stock={yours} offer={yourOffer} ready={youReady} onCount={setYoursCount} onReady={() => setYouReady(!youReady)} />
					</frame>
					<frame LayoutOrder={1} Size={new UDim2(0.5, -8, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						<Pack title="Owen Pell" stock={theirs} offer={theirOffer} ready={themReady} onCount={setTheirsCount} onReady={() => setThemReady(!themReady)} />
					</frame>
				</frame>
			)}
			<Button text="Review" variant="contained" disabled={!bothReady} onLeftClick={() => setConfirm(true)} />
		</Stack>
	);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Window unavailable" message="The desk could not open this trade." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="rectangular" width={narrow ? 340 : 480} height={72} />
				))}
			</Stack>
		) : phase === "empty" || (yours.size() === 0 && theirs.size() === 0) ? (
			<EmptyListHint text="Both packs are empty." height={72} />
		) : (
			packs
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<DeskDialog
				open={confirm}
				title="Confirm trade"
				fullWidth
				onClose={() => setConfirm(false)}
				actions={
					<>
						<Button text="Cancel" size="small" variant="text" onLeftClick={() => setConfirm(false)} />
						<Button text="Confirm" size="small" variant="contained" disabled={!bothReady} onLeftClick={commit} />
					</>
				}
			>
				<Stack direction="column" gap={1} sx={STACK}>
					<Label text="You give" sx={{ fontSize: 18 }} />
					<OfferLines offer={yourOffer} stock={yours} empty="You give nothing." />
					<Label text="You receive" sx={{ fontSize: 18 }} />
					<OfferLines offer={theirOffer} stock={theirs} empty="You receive nothing." />
				</Stack>
			</DeskDialog>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Trade Window",
	description: "Two packs, two offers, and a confirm list.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <TradeWindow {...args} />,
};
