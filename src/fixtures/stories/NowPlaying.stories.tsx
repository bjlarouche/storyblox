import React, { useEffect, useRef, useState } from "@rbxts/react";
import {
	Alert,
	Box,
	Button,
	DragRect,
	EmptyListHint,
	IconButton,
	Icons,
	ListItem,
	Menu,
	ScrollView,
	Skeleton,
	Slider,
	Snackbar,
	Stack,
	ToastVariants,
	Tooltip,
	Typography,
	placeItem,
	useReorderDrag,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface Track {
	id: string;
	title: string;
	creator: string;
	seconds: number;
	wash: Color3;
}

interface ScrubProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step?: number;
	format?: (value: number) => string;
}

interface RowProps {
	track: Track;
	current: boolean;
	playing: boolean;
	over: boolean;
	ink: Color3;
	onPick: (id: string) => void;
	onBegin: (id: string, input: InputObject) => void;
	onSlot: (gui: Frame | undefined) => void;
}

const Scrub = Slider as unknown as (props: ScrubProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const PAPER = Color3.fromRGB(244, 240, 232);

const SEED: Track[] = [
	{ id: "dune", title: "North dune", creator: "Mara Voss", seconds: 192, wash: Color3.fromRGB(196, 154, 108) },
	{ id: "cove", title: "Cove lamp", creator: "Owen Pell", seconds: 160, wash: Color3.fromRGB(92, 150, 162) },
	{ id: "pier", title: "Quiet pier", creator: "Ivo Lane", seconds: 245, wash: Color3.fromRGB(120, 146, 168) },
	{ id: "gate", title: "Field gate", creator: "Desk notes", seconds: 108, wash: Color3.fromRGB(126, 158, 126) },
	{ id: "ridge", title: "Ridge walk", creator: "Mara Voss", seconds: 210, wash: Color3.fromRGB(168, 132, 110) },
];

function clock(total: number) {
	const whole = math.max(0, math.floor(total));
	const minutes = math.floor(whole / 60);
	const seconds = whole % 60;
	const padded = seconds < 10 ? `0${seconds}` : `${seconds}`;
	return `${minutes}:${padded}`;
}

function indexOfTrack(tracks: Track[], id: string) {
	for (let index = 0; index < tracks.size(); index++) {
		if (tracks[index].id === id) return index;
	}
	return -1;
}

function findTrack(tracks: Track[], id: string) {
	const index = indexOfTrack(tracks, id);
	return index < 0 ? undefined : tracks[index];
}

function QueueRow(props: RowProps) {
	const mark = props.current ? (props.playing ? "Playing" : "Paused") : props.track.creator;
	return (
		<frame
			Size={new UDim2(1, 0, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundColor3={props.ink}
			BackgroundTransparency={props.over ? 0.85 : 1}
			BorderSizePixel={0}
			ref={props.onSlot}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0, 4)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={0} Size={new UDim2(1, -64, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
				<ListItem
					text={props.track.title}
					secondary={props.current ? `${props.track.creator} · ${mark}` : props.track.creator}
					selected={props.current}
					divider
					onActivated={() => props.onPick(props.track.id)}
				/>
			</frame>
			<Tooltip text="Drag to reorder">
				<textbutton
					Text="Move"
					Size={UDim2.fromOffset(52, 28)}
					BackgroundTransparency={1}
					TextColor3={props.ink}
					Font={Enum.Font.Gotham}
					TextSize={14}
					AutoButtonColor={false}
					Event={{
						InputBegan: (_, input) => props.onBegin(props.track.id, input),
					}}
				/>
			</Tooltip>
		</frame>
	);
}

function NowPlaying(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [tracks, setTracks] = useState(SEED);
	const [currentId, setCurrentId] = useState(SEED[0].id);
	const [elapsed, setElapsed] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [volume, setVolume] = useState(70);
	const [liked, setLiked] = useState<{ [id: string]: boolean }>({});
	const [saved, setSaved] = useState<{ [id: string]: boolean }>({});
	const [notice, setNotice] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState<GuiObject>();
	const slots = useRef<{ [id: string]: Frame | undefined }>({});
	const tracksRef = useRef(tracks);
	const elapsedRef = useRef(elapsed);
	tracksRef.current = tracks;
	elapsedRef.current = elapsed;
	const current = findTrack(tracks, currentId);
	const duration = current !== undefined ? current.seconds : 1;

	const drag = useReorderDrag((fromId, overId) => {
		if (overId === undefined || fromId === overId) return;
		const list = tracksRef.current;
		const from = indexOfTrack(list, fromId);
		const to = indexOfTrack(list, overId);
		if (from < 0 || to < 0) return;
		setTracks(placeItem(list, from, to));
	}, () => {
		const rects: DragRect[] = [];
		for (const track of tracksRef.current) {
			const gui = slots.current[track.id];
			if (gui === undefined) continue;
			rects.push({
				id: track.id,
				x: gui.AbsolutePosition.X,
				y: gui.AbsolutePosition.Y,
				width: gui.AbsoluteSize.X,
				height: gui.AbsoluteSize.Y,
			});
		}
		return rects;
	});

	useEffect(() => {
		if (!playing || current === undefined) return;
		const thread = task.delay(1, () => {
			const step = elapsedRef.current + 1;
			if (step >= current.seconds) {
				setElapsed(current.seconds);
				setPlaying(false);
				return;
			}
			setElapsed(step);
		});
		return () => task.cancel(thread);
	}, [playing, elapsed, current]);

	const pick = (id: string) => {
		if (id === currentId) return;
		setCurrentId(id);
		setElapsed(0);
		setPlaying(true);
	};
	const shift = (delta: number) => {
		const count = tracks.size();
		if (count === 0) return;
		const index = indexOfTrack(tracks, currentId);
		const start = index < 0 ? 0 : index;
		let landed = (start + delta) % count;
		if (landed < 0) landed += count;
		pick(tracks[landed].id);
	};
	const toggleFlag = (kind: "liked" | "saved") => {
		if (current === undefined) return;
		const source = kind === "liked" ? liked : saved;
		const on = source[current.id] !== true;
		const copy = { ...source, [current.id]: on };
		if (kind === "liked") setLiked(copy);
		else setSaved(copy);
		const verb = kind === "liked" ? (on ? "Liked" : "Removed like") : on ? "Saved" : "Removed save";
		setNotice(`${verb} ${current.title}`);
		setMenuOpen(false);
	};
	const dropCurrent = () => {
		if (current === undefined) return;
		const kept: Track[] = [];
		for (const track of tracks) if (track.id !== current.id) kept.push(track);
		setTracks(kept);
		setNotice(`Dropped ${current.title}`);
		setMenuOpen(false);
		setPlaying(false);
		setElapsed(0);
		setCurrentId(kept.size() > 0 ? kept[0].id : "");
	};

	const stage =
		current === undefined ? (
			<EmptyListHint text="Nothing in the queue." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Box
					sx={{
						Size: new UDim2(1, 0, 0, narrow ? 200 : 280),
						AutomaticSize: Enum.AutomaticSize.None,
						radius: 2,
						gradient: { colors: [current.wash, PAPER], rotation: 28 },
					}}
				/>
				<Typography text={current.title} variant="h2" />
				<Typography text={current.creator} color="textSecondary" />
				<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
					<Typography text={clock(elapsed)} color="textSecondary" />
					<frame Size={new UDim2(1, -108, 0, 28)} BackgroundTransparency={1} BorderSizePixel={0}>
						<Scrub
							value={elapsed}
							min={0}
							max={duration}
							step={1}
							format={(value) => clock(value)}
							onChange={(value) => {
								setElapsed(value);
								if (value >= duration) setPlaying(false);
							}}
						/>
					</frame>
					<Typography text={clock(duration - elapsed)} color="textSecondary" />
				</Stack>
				<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
					<Tooltip text="Previous">
						<Button text="Back" size="small" variant="outlined" onLeftClick={() => shift(-1)} />
					</Tooltip>
					<Tooltip text={playing ? "Pause" : "Play"}>
						<Button text={playing ? "Pause" : "Play"} size="small" variant="contained" onLeftClick={() => setPlaying(!playing)} />
					</Tooltip>
					<Tooltip text="Skip">
						<Button text="Next" size="small" variant="outlined" onLeftClick={() => shift(1)} />
					</Tooltip>
					<Tooltip text={liked[current.id] === true ? "Unlike" : "Like"}>
						<IconButton
							icon={liked[current.id] === true ? Icons.StarFilled : Icons.Star}
							tint={theme.palette.text.primary}
							selected={liked[current.id] === true}
							onClick={() => toggleFlag("liked")}
						/>
					</Tooltip>
					<Tooltip text={saved[current.id] === true ? "Remove save" : "Save"}>
						<IconButton
							icon={Icons.Save}
							tint={theme.palette.text.primary}
							selected={saved[current.id] === true}
							onClick={() => toggleFlag("saved")}
						/>
					</Tooltip>
					<Button
						text="More"
						size="small"
						variant="text"
						ref={(anchor) => {
							if (anchor !== undefined) setMenuAnchor(anchor);
						}}
						onLeftClick={() => setMenuOpen(true)}
					/>
				</Stack>
				<Typography text={`Volume ${volume}`} color="textSecondary" variant="caption" />
				<Slider value={volume} min={0} max={100} step={1} onChange={setVolume} />
			</Stack>
		);

	const queue =
		phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2, 3].map((value) => (
					<Skeleton key={value} variant="text" width={narrow ? 320 : 280} height={18} />
				))}
			</Stack>
		) : tracks.size() === 0 ? (
			<EmptyListHint text="Queue is empty." height={72} />
		) : (
			<Stack direction="column" gap={0} sx={STACK}>
				<Typography text="Queue" variant="h3" />
				{tracks.map((track) => (
					<QueueRow
						key={track.id}
						track={track}
						current={track.id === currentId}
						playing={playing}
						over={drag.drag.active && drag.drag.overId === track.id && drag.drag.id !== track.id}
						ink={theme.palette.text.secondary}
						onPick={pick}
						onBegin={drag.begin}
						onSlot={(gui) => {
							slots.current[track.id] = gui;
						}}
					/>
				))}
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			{phase === "error" ? (
				<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
					<Alert severity="error" title="Player unavailable" message="The desk could not open this queue." onClose={() => setPhase("ready")} />
				</Stack>
			) : phase === "empty" ? (
				<Stack direction="column" gap={1} sx={{ ...STACK, p: 2 }}>
					<EmptyListHint text="No tracks yet." height={72} />
				</Stack>
			) : narrow ? (
				<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
					<Stack direction="column" gap={2} sx={STACK}>
						{stage}
						{queue}
					</Stack>
				</ScrollView>
			) : (
				<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} BorderSizePixel={0}>
					<uilistlayout FillDirection={Enum.FillDirection.Horizontal} SortOrder={Enum.SortOrder.LayoutOrder} />
					<frame LayoutOrder={0} Size={new UDim2(0, 460, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
						<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{stage}</ScrollView>
					</frame>
					<frame LayoutOrder={1} Size={new UDim2(1, -460, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
						<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>{queue}</ScrollView>
					</frame>
				</frame>
			)}
			<Menu
				anchor={menuAnchor}
				open={menuOpen && current !== undefined}
				items={
					current === undefined
						? []
						: [
								{ id: "like", text: liked[current.id] === true ? "Unlike" : "Like" },
								{ id: "save", text: saved[current.id] === true ? "Unsave" : "Save" },
								{ id: "drop", text: "Drop from queue" },
							]
				}
				onSelect={(id) => {
					if (id === "drop") dropCurrent();
					else if (id === "like") toggleFlag("liked");
					else toggleFlag("saved");
				}}
				onClose={() => setMenuOpen(false)}
			/>
			<Snackbar message={notice} open={notice.size() > 0} variant={ToastVariants.success} onDismiss={() => setNotice("")} />
		</frame>
	);
}

export default {
	title: "Scenarios/Now Playing",
	description: "Responsive player with a timed scrubber and a queue.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <NowPlaying {...args} />,
};
