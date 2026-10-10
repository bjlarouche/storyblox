import React, { useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import {
	AppBar,
	Divider,
	Paper,
	ScrollView,
	Sparkline,
	Stack,
	Timeline,
	Typography,
	useBreakpoints,
	useReducedMotion,
	useTheme,
	WriteableStyle,
} from "@rbxts/uiblox";

interface Service {
	name: string;
	state: "Up" | "Watch" | "Down";
}

const SERVICES: Service[] = [
	{ name: "Gate", state: "Up" },
	{ name: "Lamp", state: "Up" },
	{ name: "Pier", state: "Watch" },
	{ name: "Ridge", state: "Up" },
];

const REGIONS = [
	{ name: "North", state: "Up" as const },
	{ name: "Cove", state: "Watch" as const },
	{ name: "Ridge", state: "Up" as const },
	{ name: "Pier", state: "Down" as const },
];

const INCIDENTS = [
	{ title: "Dawn check closed", caption: "06:10 · Gate", tone: "done" as const },
	{ title: "Lamp burn steady", caption: "07:40 · Lamp", tone: "done" as const },
	{ title: "Pier latency high", caption: "09:05 · still open", tone: "active" as const },
	{ title: "Ridge still quiet", caption: "Waiting on the next ping", tone: "pending" as const },
];

const LOGS = [
	"Gate accepted the dawn check",
	"Lamp reported a steady burn",
	"Pier latency climbed past the mark",
	"Cove stayed quiet through the hour",
	"Ridge answered the hourly ping",
	"North kept its last mark",
	"Pier still above the quiet line",
];

const LATENCY = [28, 32, 30, 36, 41, 38, 44, 40, 47, 43];
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };

function columnsFor(width: number) {
	if (width < 720) return 1;
	if (width < 1100) return 2;
	return 3;
}

function nextLatency(values: number[]) {
	const last = values[values.size() - 1] ?? 40;
	const step = ((math.floor(os.clock() * 10) % 9) - 4) * 2;
	const copy = [...values, math.clamp(last + step, 18, 96)];
	if (copy.size() > 18) copy.remove(0);
	return copy;
}

function Pulse(props: { reduced: boolean; color: Color3 }) {
	const dot = useRef<Frame>();
	useEffect(() => {
		const mark = dot.current;
		if (mark === undefined) return;
		if (props.reduced) {
			mark.BackgroundTransparency = 0;
			return;
		}
		const tween = TweenService.Create(
			mark,
			new TweenInfo(0.7, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true),
			{ BackgroundTransparency: 0.65 },
		);
		tween.Play();
		return () => tween.Cancel();
	}, [props.reduced]);
	return (
		<frame ref={dot} Size={UDim2.fromOffset(10, 10)} BackgroundColor3={props.color} BorderSizePixel={0}>
			<uicorner CornerRadius={new UDim(1, 0)} />
		</frame>
	);
}

function StatusRow(props: { name: string; state: Service["state"]; color: Color3 }) {
	return (
		<Stack direction="row" gap={1} alignItems="center" sx={{ Size: new UDim2(1, 0, 0, 22), AutomaticSize: Enum.AutomaticSize.None }}>
			<frame Size={UDim2.fromOffset(8, 8)} BackgroundColor3={props.color} BorderSizePixel={0}>
				<uicorner CornerRadius={new UDim(1, 0)} />
			</frame>
			<Typography text={props.name} sx={{ Size: new UDim2(1, -78, 0, 20) }} />
			<Typography text={props.state} variant="caption" color="textSecondary" align="right" sx={{ Size: UDim2.fromOffset(52, 18) }} />
		</Stack>
	);
}

function LiveOperations() {
	const { theme } = useTheme();
	const reduced = useReducedMotion();
	const [host, setHost] = useState<Frame>();
	const view = useBreakpoints(host);
	const bar = theme.spacing.calc(7);
	const gap = 12;
	const pad = theme.spacing.calc(2);
	const columns = columnsFor(view.width);
	const inner = math.max(220, (view.width > 0 ? view.width : 360) - pad * 2);
	const cardW = math.max(160, math.floor((inner - gap * (columns - 1)) / columns) - 8);
	const [latency, setLatency] = useState(LATENCY);
	const [logs, setLogs] = useState(LOGS.filter((_, index) => index < 4));
	const [people, setPeople] = useState(128);
	const logCursor = useRef(4);
	const tone = (state: Service["state"]) =>
		state === "Up" ? theme.palette.status.success.main : state === "Watch" ? theme.palette.status.warning.main : theme.palette.status.error.main;
	const latest = latency[latency.size() - 1] ?? 0;

	useEffect(() => {
		const thread = task.delay(1.2, () => setLatency((values) => nextLatency(values)));
		return () => task.cancel(thread);
	}, [latency]);

	useEffect(() => {
		const thread = task.delay(1.6, () => {
			const line = LOGS[logCursor.current % LOGS.size()];
			logCursor.current += 1;
			setLogs((lines) => {
				const copy = [...lines, line];
				if (copy.size() > 5) copy.remove(0);
				return copy;
			});
			setPeople((count) => math.clamp(count + ((logCursor.current % 5) - 2), 110, 160));
		});
		return () => task.cancel(thread);
	}, [logs]);

	const card = (order: number, wash: boolean) =>
		({
			LayoutOrder: order,
			Size: UDim2.fromOffset(cardW, 0),
			AutomaticSize: Enum.AutomaticSize.Y,
			...(wash ? { gradient: { colors: ["status.error.surface", "surface.elevated"], rotation: 120 } } : {}),
		}) as WriteableStyle<Frame>;

	return (
		<frame ref={setHost} Size={UDim2.fromScale(1, 1)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0}>
			<AppBar title="Operations" subtitle="Field services" elevation="raised" />
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar), Size: new UDim2(1, 0, 1, -bar), p: 2 }}>
				<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						Wraps
						Padding={new UDim(0, gap)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
					<Paper elevation="raised" sx={card(0, false)}>
						<Stack direction="column" gap={1} sx={STACK}>
							<Typography text="Service health" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 22) }} />
							<Divider />
							{SERVICES.map((service) => (
								<StatusRow key={service.name} name={service.name} state={service.state} color={tone(service.state)} />
							))}
						</Stack>
					</Paper>
					<Paper elevation="raised" sx={card(1, false)}>
						<Stack direction="column" gap={1} sx={STACK}>
							<Typography text="Active users" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 22) }} />
							<Divider />
							<Typography text={`${people}`} variant="h2" sx={{ Size: new UDim2(1, 0, 0, 40) }} />
							<Typography text="On the field right now" variant="caption" color="textSecondary" sx={STACK} />
						</Stack>
					</Paper>
					<Paper elevation="raised" sx={card(2, false)}>
						<Stack direction="column" gap={1} sx={STACK}>
							<Typography text="Latency" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 22) }} />
							<Divider />
							<Typography text={`${math.floor(latest)} ms`} variant="h3" sx={{ Size: new UDim2(1, 0, 0, 24) }} />
							<Sparkline values={latency} width={math.max(80, cardW - 40)} height={56} area color={theme.palette.primary.main} />
						</Stack>
					</Paper>
					<Paper elevation="raised" sx={card(3, true)}>
						<Stack direction="column" gap={1} sx={STACK}>
							<Stack direction="row" gap={1} alignItems="center" sx={{ Size: new UDim2(1, 0, 0, 22), AutomaticSize: Enum.AutomaticSize.None }}>
								<Pulse reduced={reduced} color={theme.palette.status.error.main} />
								<Typography text="Incident" variant="subtitle2" sx={{ Size: new UDim2(1, -24, 0, 22) }} />
							</Stack>
							<Divider />
							<Timeline items={INCIDENTS} />
						</Stack>
					</Paper>
					<Paper elevation="raised" sx={card(4, false)}>
						<Stack direction="column" gap={1} sx={STACK}>
							<Typography text="Regions" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 22) }} />
							<Divider />
							{REGIONS.map((region) => (
								<StatusRow key={region.name} name={region.name} state={region.state} color={tone(region.state)} />
							))}
						</Stack>
					</Paper>
					<Paper elevation="raised" sx={card(5, false)}>
						<Stack direction="column" gap={0.5} sx={STACK}>
							<Typography text="Log" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 22) }} />
							<Divider />
							{logs.map((line, index) => (
								<Typography
									key={`${index}-${line}`}
									text={line}
									variant="caption"
									color="textSecondary"
									sx={STACK}
								/>
							))}
						</Stack>
					</Paper>
				</frame>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Live Operations",
	description: "Service health, latency, and an open incident that stacks on a narrow canvas.",
	preview: { kind: "gui", width: 1200, height: 800 },
	tags: ["scenario"],
	render: () => <LiveOperations />,
};
