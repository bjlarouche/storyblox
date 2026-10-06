import React, { useState } from "@rbxts/react";
import {
	Alert,
	Chip,
	EmptyListHint,
	ScrollView,
	Skeleton,
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
	depths: number[];
}

interface DepthProps {
	values: number[];
	width?: number;
	height?: number;
	mark?: number;
	onPick?: (index: number) => void;
}

const Depth = Sparkline as unknown as (props: DepthProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const PLACES: Place[] = [
	{ id: "cove", label: "Cove", depths: [1, 2, 3, 5, 8, 11, 14, 16, 15, 13, 10, 8] },
	{ id: "pier", label: "Pier", depths: [4, 6, 9, 12, 14, 15, 14, 12, 9, 7, 6, 5] },
	{ id: "gate", label: "Gate", depths: [2, 2, 3, 3, 4, 6, 7, 6, 5, 4, 3, 2] },
];

function findPlace(id: string) {
	for (const place of PLACES) if (place.id === id) return place;
	return undefined;
}

function Sounding(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [placeId, setPlaceId] = useState(PLACES[0].id);
	const [index, setIndex] = useState(0);
	const place = findPlace(placeId);
	const traceWidth = narrow ? 340 : 1000;
	const depth = place !== undefined && place.depths[index] !== undefined ? place.depths[index] : 0;

	const chart =
		place === undefined ? (
			<EmptyListHint text="No place selected." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Typography text="Sounding" variant="h5" sx={SHRINK} />
				<Stack direction="row" gap={1} sx={STACK}>
					{PLACES.map((item) => (
						<Chip
							key={item.id}
							label={item.label}
							variant={item.id === placeId ? "filled" : "outlined"}
							color={item.id === placeId ? "primary" : "default"}
							onActivated={() => {
								setPlaceId(item.id);
								setIndex(0);
							}}
						/>
					))}
				</Stack>
				<Typography text={`Point ${index + 1} of ${place.depths.size()}`} sx={SHRINK} />
				<Typography text={`Depth ${depth}`} sx={SHRINK} />
				<Depth
					values={place.depths}
					width={traceWidth}
					height={narrow ? 180 : 240}
					mark={index}
					onPick={(picked) => setIndex(picked)}
				/>
			</Stack>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Sounding unavailable" message="The desk could not open this line." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Skeleton variant="rectangular" width={traceWidth} height={narrow ? 180 : 240} />
		) : phase === "empty" ? (
			<EmptyListHint text="No depths for this line." height={72} />
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
	title: "Scenarios/Sounding",
	description: "A depth line you can mark by pressing it.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Sounding {...args} />,
};
