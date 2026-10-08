import React, { useState } from "@rbxts/react";
import {
	Alert,
	BottomNavigation,
	Button,
	EmptyListHint,
	ScrollView,
	Skeleton,
	Stack,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

type Post = "posts" | "lane" | "bell";

interface Call {
	id: string;
	text: string;
}

interface BarOption {
	label: string;
	value: Post;
	badge?: number;
}

interface BarProps {
	value: Post;
	options: BarOption[];
	onChange: (value: Post) => void;
}

const Bar = BottomNavigation as unknown as (props: BarProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const SEED: Call[] = [
	{ id: "lamp", text: "Pier lamp is out" },
	{ id: "key", text: "Gate key is due" },
	{ id: "door", text: "Shed door sticks" },
];

function Watch(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [post, setPost] = useState<Post>("posts");
	const [calls, setCalls] = useState(SEED);
	const waiting = phase === "ready" ? calls.size() : 0;

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Watch unavailable" message="The desk could not open this round." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="text" width={args.viewport === "phone" ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No round is posted." height={72} />
		) : post === "posts" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				<Typography text="Pier lamp checked" sx={SHRINK} />
				<Typography text="Gate is shut" sx={SHRINK} />
				<Typography text="Shed is quiet" sx={SHRINK} />
			</Stack>
		) : post === "lane" ? (
			<Typography text="Lane is open until dusk" sx={SHRINK} />
		) : calls.size() === 0 ? (
			<EmptyListHint text="No calls waiting." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				{calls.map((call) => (
					<Stack key={call.id} direction="row" gap={1} alignItems="center" sx={STACK}>
						<Typography text={call.text} sx={SHRINK} />
						<Button
							text="Clear"
							size="small"
							variant="outlined"
							onLeftClick={() => setCalls(calls.filter((item) => item.id !== call.id))}
						/>
					</Stack>
				))}
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={1} Size={new UDim2(1, 0, 1, -56)} BackgroundTransparency={1} BorderSizePixel={0}>
				<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography text="Watch" variant="h5" sx={SHRINK} />
						{body}
					</Stack>
				</ScrollView>
			</frame>
			<frame LayoutOrder={2} Size={new UDim2(1, 0, 0, 56)} BackgroundTransparency={1} BorderSizePixel={0}>
				<Bar
					value={post}
					onChange={setPost}
					options={[
						{ label: "Posts", value: "posts" },
						{ label: "Lane", value: "lane" },
						{ label: "Bell", value: "bell", badge: waiting > 0 ? waiting : undefined },
					]}
				/>
			</frame>
		</frame>
	);
}

export default {
	title: "Scenarios/Watch",
	description: "A round desk with a count on the bell.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Watch {...args} />,
};
