import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Button,
	Chip,
	Dialog,
	EmptyListHint,
	Input,
	ListItem,
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

type PermitStatus = "Open" | "Review" | "Held" | "Approved" | "Changes";

interface ClockValue {
	hour: number;
	minute: number;
}

interface Permit {
	id: string;
	title: string;
	applicant: string;
	place: string;
	summary: string;
	paragraph: string;
	status: PermitStatus;
	when: ClockValue;
}

interface LabelProps {
	text?: string;
	wrap?: boolean;
	sx?: { fontSize?: number; TextColor3?: Color3 };
}

interface RowProps {
	text: string;
	secondary?: string;
	wrap?: boolean;
	selected?: boolean;
	divider?: boolean;
	onActivated?: () => void;
}

interface DeskDialogProps {
	open: boolean;
	title?: string;
	fullWidth?: boolean;
	onClose: () => void;
	children?: React.ReactNode;
	actions?: React.ReactNode;
}

interface ClockProps {
	value: ClockValue;
	onChange: (value: ClockValue) => void;
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const Row = ListItem as unknown as (props: RowProps) => React.Element;
const DeskDialog = Dialog as unknown as (props: DeskDialogProps) => React.Element;
const Clock = (Uiblox as unknown as { TimeField: (props: ClockProps) => React.Element }).TimeField;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const FIELD = new UDim(1, 0);
const VIEWPORT = {
	phone: { width: 320, height: 720 },
	desktop: { width: 1100, height: 760 },
};

const SEED: Permit[] = [
	{
		id: "lamp",
		title: "Cove lamp hours",
		applicant: "Mara Voss",
		place: "Cove bench",
		summary: "Keep the lamp lit until the path back is empty.",
		paragraph: "The bench faces the water. Leave the lamp on until the path to the gate is clear, then shut it and note the hour.",
		status: "Open",
		when: { hour: 18, minute: 30 },
	},
	{
		id: "gate",
		title: "Field gate pass",
		applicant: "Owen Pell",
		place: "Field gate",
		summary: "Cross after the light drops and close the gate behind.",
		paragraph: "The pass covers one evening. Wait on the cove side if the gate is already shut, and do not prop it.",
		status: "Review",
		when: { hour: 17, minute: 0 },
	},
	{
		id: "pier",
		title: "Pier cover",
		applicant: "Ivo Lane",
		place: "Quiet pier",
		summary: "Use the last post as cover while the boards are wet.",
		paragraph: "Stay at the rail until the rain passes. The cover is for the walk back, not for leaving gear overnight.",
		status: "Held",
		when: { hour: 8, minute: 0 },
	},
	{
		id: "ridge",
		title: "Ridge mark",
		applicant: "Desk notes",
		place: "Ridge mark",
		summary: "Walk the posts and stop when the next one disappears.",
		paragraph: "The mark is the last post you can still see. Turn back there. The stone and the lizard are not part of the walk.",
		status: "Approved",
		when: { hour: 10, minute: 15 },
	},
	{
		id: "tide",
		title: "Tide desk",
		applicant: "Mara Voss",
		place: "North dune",
		summary: "File the morning count before the water returns.",
		paragraph: "Two crates were still out. Recount them on the dock and bring the line to the desk before the tide covers the marks.",
		status: "Changes",
		when: { hour: 7, minute: 45 },
	},
];

function clockText(value: ClockValue) {
	const minute = value.minute < 10 ? `0${value.minute}` : `${value.minute}`;
	return `${value.hour}:${minute}`;
}

function findPermit(list: Permit[], id: string) {
	for (const permit of list) if (permit.id === id) return permit;
	return undefined;
}

function Field(props: { label: string; text: string; onTextChanged: (text: string) => void }) {
	return (
		<Stack direction="column" gap={0} sx={STACK}>
			<Label text={props.label} sx={{ fontSize: 12 }} />
			<Input text={props.text} width={FIELD} onTextChanged={props.onTextChanged} />
		</Stack>
	);
}

function PermitDesk(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [permits, setPermits] = useState(SEED);
	const [pickedId, setPickedId] = useState(SEED[0].id);
	const [pane, setPane] = useState<"list" | "detail">("list");
	const [review, setReview] = useState(false);
	const [applicant, setApplicant] = useState(SEED[0].applicant);
	const [place, setPlace] = useState(SEED[0].place);
	const [note, setNote] = useState("");
	const [when, setWhen] = useState(SEED[0].when);
	const [notice, setNotice] = useState("");
	const picked = findPermit(permits, pickedId);

	const open = (id: string) => {
		setPickedId(id);
		setReview(false);
		if (narrow) setPane("detail");
	};
	const fileReview = () => {
		if (picked === undefined) return;
		setApplicant(picked.applicant);
		setPlace(picked.place);
		setNote("");
		setWhen(picked.when);
		setReview(true);
	};
	const decide = (status: PermitStatus, message: string) => {
		if (picked === undefined) return;
		const copy: Permit[] = [];
		for (const permit of permits) {
			copy.push(permit.id === picked.id ? { ...permit, status, applicant, place, when } : permit);
		}
		setPermits(copy);
		setNotice(message);
		setReview(false);
	};

	const list = (
		<Stack direction="column" gap={1} sx={STACK}>
			<Label text="Permit desk" sx={{ fontSize: 28 }} />
			{permits.map((permit) => (
				<frame key={permit.id} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					<uilistlayout FillDirection={Enum.FillDirection.Horizontal} VerticalAlignment={Enum.VerticalAlignment.Center} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
					<frame LayoutOrder={0} Size={new UDim2(1, -108, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						<Row text={permit.title} secondary={permit.applicant} wrap selected={permit.id === pickedId} divider onActivated={() => open(permit.id)} />
					</frame>
					<Chip label={permit.status} variant={permit.status === "Review" || permit.status === "Approved" ? "filled" : "outlined"} color={permit.status === "Review" ? "primary" : "default"} />
				</frame>
			))}
		</Stack>
	);

	const detail =
		picked === undefined ? (
			<EmptyListHint text="No request selected." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				{narrow ? <Button text="Back" size="small" variant="text" onLeftClick={() => setPane("list")} /> : undefined}
				<Label text={picked.title} sx={{ fontSize: 28 }} />
				<Chip label={picked.status} variant={picked.status === "Review" || picked.status === "Approved" ? "filled" : "outlined"} color={picked.status === "Review" ? "primary" : "default"} />
				<Label text={picked.summary} wrap />
				<Label text={picked.applicant} />
				<Label text={picked.place} sx={{ TextColor3: theme.palette.text.secondary }} />
				<Label text={clockText(picked.when)} sx={{ TextColor3: theme.palette.text.secondary }} />
				<Button text="Review" size="small" variant="contained" onLeftClick={fileReview} />
			</Stack>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Desk unavailable" message="The desk could not open this list." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="text" width={narrow ? 240 : 280} height={18} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No requests yet." height={72} />
		) : narrow ? (
			pane === "list" ? list : detail
		) : (
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 16)} SortOrder={Enum.SortOrder.LayoutOrder} />
				<frame LayoutOrder={0} Size={new UDim2(0, 360, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					{list}
				</frame>
				<frame LayoutOrder={1} Size={new UDim2(1, -376, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
					{detail}
				</frame>
			</frame>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
			<DeskDialog
				open={review && picked !== undefined}
				title="Review request"
				fullWidth
				onClose={() => setReview(false)}
				actions={
					<>
						<Button text="Approve" size="small" variant="contained" onLeftClick={() => picked !== undefined && decide("Approved", `Approved ${picked.title}`)} />
						<Button text="Hold" size="small" variant="outlined" onLeftClick={() => picked !== undefined && decide("Held", `Held ${picked.title}`)} />
						<Button text="Request changes" size="small" variant="text" onLeftClick={() => picked !== undefined && decide("Changes", `Asked for changes on ${picked.title}`)} />
					</>
				}
			>
				{picked !== undefined ? (
					<Stack direction="column" gap={1} sx={STACK}>
						<Field label="Applicant" text={applicant} onTextChanged={setApplicant} />
						<Field label="Place" text={place} onTextChanged={setPlace} />
						<Field label="Note" text={note} onTextChanged={setNote} />
						<Stack direction="column" gap={0} sx={STACK}>
							<Label text="Time" sx={{ fontSize: 12 }} />
							<Clock value={when} onChange={setWhen} />
						</Stack>
						<Label text={picked.paragraph} wrap />
					</Stack>
				) : undefined}
			</DeskDialog>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Permit Desk",
	description: "A permit list with a review form.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <PermitDesk {...args} />,
};
