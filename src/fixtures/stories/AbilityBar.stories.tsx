import React, { useEffect, useRef, useState } from "@rbxts/react";
import {
	Alert,
	Badge,
	Box,
	Button,
	Chip,
	CircularProgress,
	EmptyListHint,
	LinearProgress,
	Paper,
	Skeleton,
	Stack,
	Tooltip,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Ability {
	id: string;
	name: string;
	blurb: string;
	cost: number;
	rank: number;
	cool: number;
	left: number;
	key: string;
	wash: Color3;
}

const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const HEALTH_TINT = Color3.fromRGB(176, 92, 92);
const ENERGY_TINT = Color3.fromRGB(92, 140, 168);
const SHADE = Color3.fromRGB(16, 22, 28);
const TARGETS = ["Pier post", "Cove bench", "Ridge mark"];

const SEED: Ability[] = [
	{ id: "gust", name: "Gust", blurb: "A short push of air along the pier.", cost: 2, rank: 2, cool: 4, left: 0, key: "1", wash: Color3.fromRGB(120, 156, 176) },
	{ id: "lamp", name: "Lamp", blurb: "A small light for the walk back.", cost: 1, rank: 1, cool: 6, left: 0, key: "2", wash: Color3.fromRGB(196, 154, 108) },
	{ id: "ward", name: "Ward", blurb: "A quiet guard while you wait.", cost: 3, rank: 3, cool: 8, left: 2.4, key: "3", wash: Color3.fromRGB(126, 158, 126) },
	{ id: "step", name: "Step", blurb: "A short step off the line.", cost: 1, rank: 1, cool: 3, left: 0, key: "4", wash: Color3.fromRGB(168, 132, 110) },
	{ id: "mark", name: "Mark", blurb: "Marks the post you are facing.", cost: 2, rank: 2, cool: 5, left: 0, key: "5", wash: Color3.fromRGB(150, 124, 150) },
];

function findAbility(list: Ability[], id: string) {
	for (const ability of list) if (ability.id === id) return ability;
	return undefined;
}

function Meter(props: { label: string; value: number; max: number; tint: Color3 }) {
	return (
		<Stack direction="column" gap={0} sx={{ Size: new UDim2(0, 160, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
			<Typography text={`${props.label} ${props.value}`} variant="caption" color="textSecondary" />
			<LinearProgress value={props.max > 0 ? props.value / props.max : 0} color={props.tint} sx={{ Size: new UDim2(1, 0, 0, 8) }} />
		</Stack>
	);
}

function Slot(props: { ability: Ability; picked: boolean; ink: Color3; onUse: (id: string) => void }) {
	const cooling = props.ability.left > 0;
	const ratio = props.ability.cool > 0 ? props.ability.left / props.ability.cool : 0;
	return (
		<Stack direction="column" gap={0} alignItems="center" sx={{ Size: new UDim2(0, 64, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
			<Tooltip text={`${props.ability.name}\n${props.ability.cost} energy`}>
				<Badge count={props.ability.cost} color="primary">
				<textbutton
					Size={UDim2.fromOffset(56, 56)}
					BackgroundColor3={props.ability.wash}
					BorderSizePixel={0}
					Text=""
					AutoButtonColor={false}
					ClipsDescendants
					Event={{ Activated: () => props.onUse(props.ability.id) }}
				>
					<uicorner CornerRadius={new UDim(0, 8)} />
					{props.picked ? <uistroke Color={props.ink} Thickness={2} /> : undefined}
					<textlabel
						Text={props.ability.name.sub(1, 1)}
						Size={UDim2.fromScale(1, 1)}
						BackgroundTransparency={1}
						TextColor3={props.ink}
						Font={Enum.Font.GothamBold}
						TextSize={20}
					/>
					{cooling ? (
						<frame Size={new UDim2(1, 0, ratio, 0)} BackgroundColor3={SHADE} BackgroundTransparency={0.35} BorderSizePixel={0} ZIndex={2} />
					) : undefined}
					{cooling ? (
						<frame
							Size={UDim2.fromOffset(48, 48)}
							Position={UDim2.fromScale(0.5, 0.5)}
							AnchorPoint={new Vector2(0.5, 0.5)}
							BackgroundTransparency={1}
							BorderSizePixel={0}
							ZIndex={3}
						>
							<CircularProgress value={ratio} size={48} thickness={3} color={props.ink} />
							<textlabel
								Text={`${math.ceil(props.ability.left)}`}
								Size={UDim2.fromScale(1, 1)}
								BackgroundTransparency={1}
								TextColor3={Color3.fromRGB(244, 240, 232)}
								Font={Enum.Font.GothamBold}
								TextSize={16}
								ZIndex={4}
							/>
						</frame>
					) : undefined}
				</textbutton>
				</Badge>
			</Tooltip>
			<Typography text={props.ability.key} variant="caption" color="textSecondary" />
		</Stack>
	);
}

function AbilityBar(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [abilities, setAbilities] = useState(SEED);
	const [pickedId, setPickedId] = useState(SEED[2].id);
	const [health] = useState(72);
	const [energy, setEnergy] = useState(40);
	const [coins] = useState(18);
	const [target, setTarget] = useState(0);
	const [note, setNote] = useState("");
	const listRef = useRef(abilities);
	listRef.current = abilities;
	const picked = findAbility(abilities, pickedId);
	let cooling = false;
	for (const ability of abilities) if (ability.left > 0) cooling = true;

	useEffect(() => {
		if (!cooling) return;
		const thread = task.delay(0.2, () => {
			const copy: Ability[] = [];
			for (const ability of listRef.current) {
				copy.push(ability.left > 0 ? { ...ability, left: math.max(0, ability.left - 0.2) } : ability);
			}
			setAbilities(copy);
		});
		return () => task.cancel(thread);
	}, [cooling, abilities]);

	const onUse = (id: string) => {
		setPickedId(id);
		const ability = findAbility(abilities, id);
		if (ability === undefined || ability.left > 0) return;
		if (energy < ability.cost) {
			setNote("Not enough energy.");
			return;
		}
		setEnergy(energy - ability.cost);
		setNote("");
		const copy: Ability[] = [];
		for (const item of abilities) copy.push(item.id === id ? { ...item, left: item.cool } : item);
		setAbilities(copy);
	};

	const resources = (
		<Stack direction="row" gap={2} wrap alignItems="center" sx={STACK}>
			<Meter label="Health" value={health} max={100} tint={HEALTH_TINT} />
			<Meter label="Energy" value={energy} max={100} tint={ENERGY_TINT} />
			<Typography text={`Coins ${coins}`} variant="caption" />
		</Stack>
	);

	const hotbar = (
		<Stack direction="row" gap={1} sx={{ AutomaticSize: Enum.AutomaticSize.XY, Size: UDim2.fromScale(0, 0) }}>
			{abilities.map((ability) => (
				<Slot key={ability.id} ability={ability} picked={ability.id === pickedId} ink={theme.palette.text.primary} onUse={onUse} />
			))}
		</Stack>
	);

	const detail =
		picked === undefined ? (
			<EmptyListHint text="No ability selected." height={72} />
		) : (
			<Paper elevation="raised">
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text={picked.name} variant="h2" />
					<Typography text={`Rank ${picked.rank}`} color="textSecondary" />
					<Typography text={picked.blurb} />
					<Typography text={`${picked.cost} energy · ${picked.cool}s cooldown`} variant="caption" color="textSecondary" />
					<LinearProgress value={picked.cool > 0 ? picked.left / picked.cool : 0} sx={{ Size: new UDim2(1, 0, 0, 8) }} />
					{note.size() > 0 ? <Typography text={note} color="error" /> : undefined}
				</Stack>
			</Paper>
		);

	const status = (
		<Stack direction="row" gap={1} wrap alignItems="center" sx={STACK}>
			<Chip label={TARGETS[target] ?? "None"} selected />
			<Chip label={picked !== undefined && picked.left > 0 ? "Cooling" : "Ready"} variant="outlined" />
			<Button
				text="Next target"
				size="small"
				variant="outlined"
				onLeftClick={() => setTarget((target + 1) % TARGETS.size())}
			/>
		</Stack>
	);

	const ready = narrow ? (
		<Stack direction="column" gap={2} sx={{ ...STACK, p: 2 }}>
			{resources}
			{status}
			{detail}
			{hotbar}
		</Stack>
	) : (
		<>
			<frame Position={UDim2.fromOffset(24, 20)} Size={new UDim2(0, 520, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<Stack direction="column" gap={1} sx={STACK}>
					{resources}
					{status}
				</Stack>
			</frame>
			<frame
				AnchorPoint={new Vector2(1, 0.5)}
				Position={new UDim2(1, -24, 0.45, 0)}
				Size={new UDim2(0, 320, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
			>
				{detail}
			</frame>
			<frame AnchorPoint={new Vector2(0.5, 1)} Position={new UDim2(0.5, 0, 1, -16)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
				{hotbar}
			</frame>
		</>
	);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<Box
				sx={{
					Size: UDim2.fromScale(1, 1),
					AutomaticSize: Enum.AutomaticSize.None,
					gradient: { colors: [Color3.fromRGB(78, 108, 124), Color3.fromRGB(168, 148, 112)], rotation: 118 },
				}}
			/>
			<Box
				sx={{
					position: UDim2.fromScale(0, 0.55),
					Size: new UDim2(1, 0, 0.45, 0),
					AutomaticSize: Enum.AutomaticSize.None,
					gradient: { colors: [Color3.fromRGB(92, 122, 96), Color3.fromRGB(48, 64, 72)], rotation: 20 },
				}}
			/>
			{phase === "error" ? (
				<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
					<Alert severity="error" title="Bar unavailable" message="The desk could not read abilities." onClose={() => setPhase("ready")} />
				</Stack>
			) : phase === "loading" ? (
				<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
					<Skeleton variant="rectangular" width={280} height={8} />
					<Skeleton variant="rectangular" width={280} height={8} />
					{[0, 1, 2, 3, 4].map((value) => (
						<Skeleton key={`slot-${value}`} variant="rounded" width={56} height={56} />
					))}
				</Stack>
			) : phase === "empty" ? (
				<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
					<EmptyListHint text="No abilities readied." height={72} />
				</Stack>
			) : narrow ? (
				<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
					{ready}
				</frame>
			) : (
				ready
			)}
		</frame>
	);
}

export default {
	title: "Scenarios/Ability Bar",
	description: "Ability HUD with resource meters, a hotbar, and cooldowns.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <AbilityBar {...args} />,
};
