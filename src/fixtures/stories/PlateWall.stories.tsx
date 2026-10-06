import React, { useState } from "@rbxts/react";
import {
	Alert,
	Box,
	Chip,
	Drawer,
	EmptyListHint,
	ImageList,
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

interface Plate {
	id: string;
	title: string;
	note: string;
	group: "Table" | "Wall" | "Shelf";
	color: Color3;
	aspect?: number;
}

interface Tile {
	src: string;
	title?: string;
	color?: Color3;
	aspect?: number;
}

interface WallProps {
	items: Tile[];
	cols?: number;
	gap?: number;
	itemSize?: number;
	aspect?: number;
	selected?: number[];
	onItemActivated?: (index: number) => void;
}

const Wall = ImageList as unknown as (props: WallProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const FILTERS = ["All", "Table", "Wall", "Shelf"];

const PLATES: Plate[] = [
	{ id: "milk", title: "Milk saucer", note: "Even pale glaze, low foot.", group: "Table", color: Color3.fromRGB(226, 220, 206) },
	{ id: "ash", title: "Ash platter", note: "Long shore plate, gray rim.", group: "Table", color: Color3.fromRGB(168, 164, 156), aspect: 3 / 2 },
	{ id: "sand", title: "Sand tile", note: "Tall wall piece, warm face.", group: "Wall", color: Color3.fromRGB(196, 154, 108), aspect: 3 / 4 },
	{ id: "clay", title: "Clay oval", note: "Soft red, wider than tall.", group: "Table", color: Color3.fromRGB(176, 96, 72), aspect: 3 / 2 },
	{ id: "reed", title: "Reed tray", note: "Shallow green, for the shelf.", group: "Shelf", color: Color3.fromRGB(118, 146, 104), aspect: 5 / 3 },
	{ id: "slate", title: "Slate plaque", note: "Narrow dark plate for the hall.", group: "Wall", color: Color3.fromRGB(78, 92, 104), aspect: 2 / 3 },
	{ id: "bone", title: "Bone dish", note: "Plain square, no extra ratio.", group: "Table", color: Color3.fromRGB(214, 206, 190) },
	{ id: "moss", title: "Moss board", note: "Wide shelf board, dull green.", group: "Shelf", color: Color3.fromRGB(92, 118, 86), aspect: 4 / 3 },
	{ id: "flint", title: "Flint stand", note: "Upright plate, cool gray.", group: "Wall", color: Color3.fromRGB(108, 112, 120), aspect: 2 / 3 },
	{ id: "wool", title: "Wool plate", note: "Square shelf plate, warm tan.", group: "Shelf", color: Color3.fromRGB(186, 154, 118) },
];

function findPlate(items: Plate[], id: string) {
	for (const plate of items) if (plate.id === id) return plate;
	return undefined;
}

function PlateWall(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [filter, setFilter] = useState("All");
	const [openId, setOpenId] = useState<string | undefined>(undefined);
	const visible = PLATES.filter((plate) => filter === "All" || plate.group === filter);
	const opened = openId !== undefined ? findPlate(visible, openId) : undefined;
	let openIndex: number | undefined;
	for (let index = 0; index < visible.size(); index++) {
		if (visible[index].id === openId) openIndex = index;
	}

	const wall =
		visible.size() === 0 ? (
			<EmptyListHint text="No plates in this group." height={72} />
		) : (
			<Wall
				items={visible.map((plate) => ({
					src: "",
					title: plate.title,
					color: plate.color,
					aspect: plate.aspect,
				}))}
				cols={narrow ? 2 : 4}
				gap={1}
				itemSize={narrow ? 156 : 220}
				aspect={1}
				selected={openIndex !== undefined ? [openIndex] : undefined}
				onItemActivated={(index) => {
					const plate = visible[index];
					if (plate !== undefined) setOpenId(plate.id);
				}}
			/>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Wall unavailable" message="The plates could not be opened." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="row" gap={1} wrap sx={STACK}>
				{[156, 104, 156, 220].map((height, index) => (
					<Skeleton key={index} variant="rounded" width={narrow ? 156 : 220} height={narrow ? height * 0.7 : height} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No plates on this wall." height={72} />
		) : (
			wall
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Plate wall" variant="h5" sx={SHRINK} />
					<Stack direction="row" gap={1} wrap sx={STACK}>
						{FILTERS.map((option) => (
							<Chip
								key={option}
								label={option}
								variant={option === filter ? "filled" : "outlined"}
								color={option === filter ? "primary" : "default"}
								onActivated={() => setFilter(option)}
							/>
						))}
					</Stack>
					{body}
				</Stack>
			</ScrollView>
			<Drawer open={opened !== undefined} edge="right" width={narrow ? 320 : 400} onClose={() => setOpenId(undefined)}>
				{opened !== undefined && (
					<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
						<Box sx={{ Size: new UDim2(1, 0, 0, 160), AutomaticSize: Enum.AutomaticSize.None, bgcolor: opened.color, radius: 12 }} />
						<Typography text={opened.title} variant="h6" sx={SHRINK} />
						<Typography text={opened.note} sx={SHRINK} />
						<Typography text={opened.group} color="textSecondary" sx={SHRINK} />
					</Stack>
				)}
			</Drawer>
		</frame>
	);
}

export default {
	title: "Scenarios/Plate Wall",
	description: "A wall of plates with a ratio of its own.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <PlateWall {...args} />,
};
