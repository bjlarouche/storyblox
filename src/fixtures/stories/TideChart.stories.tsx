import React, { useState } from "@rbxts/react";
import {
	Alert,
	Chip,
	EmptyListHint,
	ScrollView,
	Skeleton,
	Slider,
	Sparkline,
	Stack,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Place {
	id: string;
	label: string;
	tide: number[];
	wind: number[];
	light: number[];
}

interface TideProps {
	values: number[];
	width?: number;
	height?: number;
	color?: Color3;
	area?: boolean;
}

const Tide = Sparkline as unknown as (props: TideProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const WIND = Color3.fromRGB(90, 140, 130);
const DAYLIGHT = Color3.fromRGB(196, 154, 72);

const PLACES: Place[] = [
	{
		id: "cove",
		label: "Cove",
		tide: [2, 3, 4, 6, 8, 10, 11, 12, 11, 9, 7, 5, 3, 2, 2, 3, 5, 7, 9, 11, 12, 10, 8, 5],
		wind: [6, 6, 7, 8, 9, 11, 12, 14, 13, 11, 9, 8, 7, 6, 6, 7, 8, 10, 12, 11, 9, 8, 7, 6],
		light: [0, 0, 0, 0, 1, 4, 12, 24, 38, 50, 60, 66, 68, 66, 58, 46, 32, 18, 8, 2, 0, 0, 0, 0],
	},
	{
		id: "pier",
		label: "Pier",
		tide: [4, 3, 2, 2, 3, 5, 7, 9, 11, 12, 11, 9, 7, 5, 3, 2, 2, 4, 6, 8, 10, 11, 9, 6],
		wind: [14, 13, 12, 11, 10, 9, 8, 8, 9, 11, 13, 15, 16, 14, 12, 10, 9, 8, 8, 9, 11, 13, 14, 14],
		light: [0, 0, 0, 0, 1, 3, 10, 20, 34, 46, 56, 62, 64, 62, 54, 42, 28, 16, 6, 1, 0, 0, 0, 0],
	},
	{
		id: "gate",
		label: "Gate",
		tide: [8, 9, 10, 11, 10, 8, 6, 4, 3, 2, 2, 3, 4, 6, 8, 10, 11, 12, 11, 9, 7, 5, 4, 6],
		wind: [4, 4, 5, 5, 6, 7, 8, 8, 7, 6, 5, 5, 6, 8, 10, 11, 10, 8, 7, 6, 5, 5, 4, 4],
		light: [0, 0, 0, 0, 2, 6, 14, 26, 40, 52, 62, 68, 70, 68, 60, 48, 34, 20, 8, 2, 0, 0, 0, 0],
	},
];

function findPlace(id: string) {
	for (const place of PLACES) if (place.id === id) return place;
	return undefined;
}

function reading(values: number[], hour: number) {
	const value = values[hour];
	return value !== undefined ? value : 0;
}

function TideChart(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [placeId, setPlaceId] = useState(PLACES[0].id);
	const [hour, setHour] = useState(8);
	const place = findPlace(placeId);
	const traceWidth = narrow ? 340 : 1000;
	const half = narrow ? 340 : 488;

	const chart =
		place === undefined ? (
			<EmptyListHint text="No place selected." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Typography text="6 Oct" variant="h5" sx={SHRINK} />
				<Typography text={place.label} color="textSecondary" sx={SHRINK} />
				<Stack direction="row" gap={1} sx={STACK}>
					{PLACES.map((item) => (
						<Chip
							key={item.id}
							label={item.label}
							variant={item.id === placeId ? "filled" : "outlined"}
							color={item.id === placeId ? "primary" : "default"}
							onActivated={() => setPlaceId(item.id)}
						/>
					))}
				</Stack>
				<Stack direction="row" gap={2} wrap sx={STACK}>
					<Typography text={`Hour ${hour}`} sx={SHRINK} />
					<Typography text={`Tide ${reading(place.tide, hour)}`} sx={SHRINK} />
					<Typography text={`Wind ${reading(place.wind, hour)}`} sx={SHRINK} />
					<Typography text={`Light ${reading(place.light, hour)}`} sx={SHRINK} />
				</Stack>
				<frame Size={new UDim2(1, 0, 0, 28)} BackgroundTransparency={1} BorderSizePixel={0}>
					<Slider value={hour} min={0} max={23} step={1} onChange={(value) => setHour(math.floor(value))} />
				</frame>
				<Typography text="Tide" color="textSecondary" sx={SHRINK} />
				<Tide values={place.tide} width={traceWidth} height={narrow ? 140 : 180} area />
				{narrow ? (
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography text="Wind" color="textSecondary" sx={SHRINK} />
						<Sparkline values={place.wind} width={half} height={64} color={WIND} />
						<Typography text="Light" color="textSecondary" sx={SHRINK} />
						<Sparkline values={place.light} width={half} height={64} color={DAYLIGHT} />
					</Stack>
				) : (
					<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 24)} SortOrder={Enum.SortOrder.LayoutOrder} />
						<Stack direction="column" gap={0} sx={{ Size: new UDim2(0, half, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
							<Typography text="Wind" color="textSecondary" sx={SHRINK} />
							<Sparkline values={place.wind} width={half} height={72} color={WIND} />
						</Stack>
						<Stack direction="column" gap={0} sx={{ Size: new UDim2(0, half, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
							<Typography text="Light" color="textSecondary" sx={SHRINK} />
							<Sparkline values={place.light} width={half} height={72} color={DAYLIGHT} />
						</Stack>
					</frame>
				)}
			</Stack>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Chart unavailable" message="The desk could not open this day." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="rectangular" width={narrow ? 340 : 640} height={value === 0 ? 120 : 28} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No readings for this day." height={72} />
		) : (
			chart
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Tide Chart",
	description: "Tide, wind, and light for one day.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <TideChart {...args} />,
};
