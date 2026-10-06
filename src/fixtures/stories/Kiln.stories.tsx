import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import {
	Alert,
	Box,
	Button,
	Chip,
	EmptyListHint,
	ScrollView,
	Skeleton,
	Stack,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Good {
	id: string;
	name: string;
	from: Color3;
	to: Color3;
}

interface LabelProps {
	text?: string;
	sx?: { fontSize?: number; TextColor3?: Color3 };
}

interface ShadeProps {
	value?: number;
	children?: React.ReactNode;
	sx?: { Size?: UDim2 };
}

const Label = (Uiblox as unknown as { Text: (props: LabelProps) => React.Element }).Text;
const Shade = (Uiblox as unknown as { Cover: (props: ShadeProps) => React.Element }).Cover;
const TILE = 156;
const SPAN = 4;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const GOODS: Good[] = [
	{ id: "bowl", name: "Cove bowl", from: Color3.fromRGB(176, 112, 78), to: Color3.fromRGB(92, 58, 42) },
	{ id: "cup", name: "Pier cup", from: Color3.fromRGB(168, 186, 184), to: Color3.fromRGB(78, 108, 112) },
	{ id: "tile", name: "Gate tile", from: Color3.fromRGB(196, 168, 120), to: Color3.fromRGB(120, 96, 64) },
	{ id: "brick", name: "Ridge brick", from: Color3.fromRGB(164, 84, 62), to: Color3.fromRGB(92, 48, 40) },
	{ id: "plate", name: "Desk plate", from: Color3.fromRGB(214, 206, 190), to: Color3.fromRGB(140, 132, 118) },
];

function hasId(list: string[], id: string) {
	for (const item of list) if (item === id) return true;
	return false;
}

function Kiln(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [picked, setPicked] = useState(GOODS[0].id);
	const [hot, setHot] = useState<{ id: string; left: number } | undefined>(undefined);
	const [fired, setFired] = useState<string[]>([]);

	const burn = (id: string, left: number) => {
		if (left <= 0) {
			setHot(undefined);
			setFired((current) => {
				const copy: string[] = [];
				for (const item of current) if (item !== id) copy.push(item);
				copy.push(id);
				return copy;
			});
			return;
		}
		setHot({ id, left });
		task.delay(0.2, () => burn(id, left - 0.2));
	};
	const start = () => {
		if (hot !== undefined) return;
		const cooling: string[] = [];
		for (const item of fired) if (item !== picked) cooling.push(item);
		setFired(cooling);
		burn(picked, SPAN);
	};

	const tiles = (
		<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Wraps Padding={new UDim(0, 12)} SortOrder={Enum.SortOrder.LayoutOrder} />
			{GOODS.map((good) => {
				const busy = hot !== undefined && hot.id === good.id;
				const done = hasId(fired, good.id);
				const fraction = busy && hot !== undefined ? hot.left / SPAN : 0;
				return (
					<Stack key={good.id} direction="column" gap={0} sx={{ Size: new UDim2(0, TILE, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
						<frame Size={UDim2.fromOffset(TILE, TILE)} BackgroundTransparency={1} BorderSizePixel={0}>
							<Shade value={fraction} sx={{ Size: UDim2.fromScale(1, 1) }}>
								<Box
									sx={{
										Size: UDim2.fromScale(1, 1),
										AutomaticSize: Enum.AutomaticSize.None,
										gradient: { colors: [good.from, good.to], rotation: 18 },
									}}
								/>
							</Shade>
							<textbutton
								Size={UDim2.fromScale(1, 1)}
								BackgroundTransparency={1}
								Text=""
								ZIndex={3}
								Event={{ Activated: () => setPicked(good.id) }}
							/>
							{picked === good.id ? (
								<uistroke Color={theme.palette.primary.main} Thickness={2} ApplyStrokeMode={Enum.ApplyStrokeMode.Border} />
							) : undefined}
						</frame>
						<Label text={good.name} />
						{busy && hot !== undefined ? (
							<Label text={`${math.ceil(hot.left)}s`} sx={{ TextColor3: theme.palette.text.secondary }} />
						) : done ? (
							<Chip label="Fired" size="small" color="primary" />
						) : (
							<Label text="Ready" sx={{ TextColor3: theme.palette.text.secondary }} />
						)}
					</Stack>
				);
			})}
		</frame>
	);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Kiln unavailable" message="The desk could not open the fire." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="row" gap={1} wrap sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="rectangular" width={TILE} height={TILE} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="Nothing on the bench." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Label text="Kiln" sx={{ fontSize: 28 }} />
				{tiles}
				<Button text={hot !== undefined ? "Firing" : "Fire"} variant="contained" disabled={hot !== undefined} onLeftClick={start} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{body}</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Kiln",
	description: "Tiles that shade while they fire.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Kiln {...args} />,
};
