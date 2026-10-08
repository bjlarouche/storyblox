import React, { useState } from "@rbxts/react";
import {
	Alert,
	Button,
	Chip,
	DateRangePicker,
	EmptyListHint,
	ScrollView,
	Skeleton,
	Stack,
	Typography,
	formatSpan,
	nightsBetween,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Span {
	start?: number;
	finish?: number;
}

interface WeekProps {
	year: number;
	month: number;
	value: Span;
	onChange: (value: Span) => void;
	onMonthChange: (year: number, month: number) => void;
	view?: "week";
	anchor?: number;
	onAnchorChange?: (stamp: number) => void;
}

const Week = DateRangePicker as unknown as (props: WeekProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const SLIPS = [
	{ id: "cove", name: "Cove slip" },
	{ id: "pier", name: "Pier post" },
	{ id: "gate", name: "Gate dock" },
	{ id: "ridge", name: "Ridge float" },
];

function findSlip(id: string) {
	for (const slip of SLIPS) if (slip.id === id) return slip;
	return undefined;
}

function Berth(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [slipId, setSlipId] = useState(SLIPS[0].id);
	const [anchor, setAnchor] = useState(20261006);
	const [span, setSpan] = useState<Span>({});
	const [held, setHeld] = useState("");
	const slip = findSlip(slipId);
	const nights = span.start !== undefined && span.finish !== undefined ? nightsBetween(span.start, span.finish) : 0;
	const year = math.floor(anchor / 10000);
	const month = math.floor(anchor / 100) % 100;

	const desk =
		slip === undefined ? (
			<EmptyListHint text="No slip selected." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Stack direction="row" gap={1} wrap sx={STACK}>
					{SLIPS.map((item) => (
						<Chip
							key={item.id}
							label={item.name}
							variant={item.id === slipId ? "filled" : "outlined"}
							color={item.id === slipId ? "primary" : "default"}
							onActivated={() => setSlipId(item.id)}
						/>
					))}
				</Stack>
				<Week
					year={year}
					month={month}
					value={span}
					view="week"
					anchor={anchor}
					onChange={setSpan}
					onMonthChange={() => undefined}
					onAnchorChange={setAnchor}
				/>
				<Typography text={formatSpan(span)} sx={SHRINK} />
				<Typography text={nights > 0 ? `${nights} nights` : "Choose a start and finish"} color="textSecondary" sx={SHRINK} />
				<Button
					text="Hold"
					size="small"
					variant="contained"
					disabled={nights <= 0}
					onLeftClick={() => setHeld(`${slip.name} held`)}
				/>
				{held.size() > 0 ? <Typography text={held} color="primary" sx={SHRINK} /> : undefined}
			</Stack>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Berth unavailable" message="The desk could not open this week." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Skeleton variant="rounded" width={narrow ? 340 : 720} height={56} />
		) : phase === "empty" ? (
			<EmptyListHint text="No slips open this week." height={72} />
		) : (
			desk
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Berth" variant="h5" sx={SHRINK} />
					{body}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Berth",
	description: "Hold a slip across one week.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Berth {...args} />,
};
