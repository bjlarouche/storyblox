import React, { useState } from "@rbxts/react";
import {
	Alert,
	Box,
	Chip,
	EmptyListHint,
	IconButton,
	Icons,
	ScrollView,
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

interface Piece {
	id: string;
	title: string;
	who: string;
	length: string;
	color: Color3;
}

type Glyph = "play" | "pause" | "previous" | "next";

interface ControlProps {
	icon: Icons;
	glyph?: Glyph;
	tint: Color3;
	size?: "md";
	disabled?: boolean;
	onClick?: () => void;
}

const Control = IconButton as unknown as (props: ControlProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const PIECES: Piece[] = [
	{ id: "room", title: "North room", who: "Mara Voss", length: "3:12", color: Color3.fromRGB(196, 154, 108) },
	{ id: "bell", title: "Harbor bell", who: "Owen Pell", length: "2:40", color: Color3.fromRGB(92, 138, 156) },
	{ id: "walk", title: "Gate walk", who: "Rae Quinn", length: "4:05", color: Color3.fromRGB(118, 146, 104) },
	{ id: "hour", title: "Desk hour", who: "Ivo Lane", length: "1:48", color: Color3.fromRGB(168, 140, 112) },
];

function Playback(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [index, setIndex] = useState(0);
	const [playing, setPlaying] = useState(false);
	const piece = PIECES[index];
	const ink = theme.palette.text.primary;

	const shift = (delta: number) => {
		const landed = index + delta;
		if (landed < 0 || landed >= PIECES.size()) return;
		setIndex(landed);
	};

	const row =
		piece === undefined ? (
			<EmptyListHint text="Nothing is queued." height={72} />
		) : (
			<Stack direction="column" gap={2} sx={STACK}>
				<Stack direction="row" gap={1} wrap sx={STACK}>
					{PIECES.map((item, itemIndex) => (
						<Chip
							key={item.id}
							label={item.title}
							variant={itemIndex === index ? "filled" : "outlined"}
							color={itemIndex === index ? "primary" : "default"}
							onActivated={() => setIndex(itemIndex)}
						/>
					))}
				</Stack>
				<Box
					sx={{
						Size: new UDim2(1, 0, 0, narrow ? 180 : 280),
						AutomaticSize: Enum.AutomaticSize.None,
						bgcolor: piece.color,
						radius: 16,
					}}
				/>
				<Typography text={piece.title} variant="h4" sx={SHRINK} />
				<Typography text={`${piece.who} · ${piece.length}`} color="textSecondary" sx={SHRINK} />
				<Typography text={playing ? "Playing" : "Paused"} sx={SHRINK} />
				<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
					<Tooltip text="Previous">
						<Control icon={Icons.HorizontalDots} glyph="previous" tint={ink} size="md" disabled={index <= 0} onClick={() => shift(-1)} />
					</Tooltip>
					<Tooltip text={playing ? "Pause" : "Play"}>
						<Control
							icon={Icons.HorizontalDots}
							glyph={playing ? "pause" : "play"}
							tint={ink}
							size="md"
							onClick={() => setPlaying(!playing)}
						/>
					</Tooltip>
					<Tooltip text="Next">
						<Control
							icon={Icons.HorizontalDots}
							glyph="next"
							tint={ink}
							size="md"
							disabled={index >= PIECES.size() - 1}
							onClick={() => shift(1)}
						/>
					</Tooltip>
				</Stack>
			</Stack>
		);

	const body =
		phase === "error" ? (
			<Alert severity="error" title="Playback unavailable" message="The desk could not open this piece." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				<Skeleton variant="rounded" width={narrow ? 340 : 640} height={narrow ? 180 : 280} />
				<Skeleton variant="text" width={180} height={28} />
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No pieces on the desk." height={72} />
		) : (
			row
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Typography text="Playback" variant="h5" sx={SHRINK} />
					{body}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Playback",
	description: "A listening desk with play, back, and skip as glyphs.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Playback {...args} />,
};
