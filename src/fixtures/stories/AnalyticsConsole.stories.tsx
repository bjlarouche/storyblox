import React, { useState } from "@rbxts/react";
import {
	Alert,
	AppBar,
	Badge,
	Box,
	Button,
	Chip,
	Dialog,
	Drawer,
	Menu,
	Pagination,
	Paper,
	ScrollView,
	Select,
	Skeleton,
	Stack,
	Table,
	Tooltip,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { DateRangePicker, Sparkline, useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
	page: number;
	menuOpen: boolean;
	detailOpen: boolean;
}

interface DateSpan {
	start?: number;
	finish?: number;
}

interface Sample {
	day: string;
	stamp: number;
	segment: string;
	sessions: number;
	errors: number;
	status: string;
	series: number[];
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const PAGE = 5;
const SEGMENTS = ["All", "Web", "Studio", "Phone"];
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };

const ROWS: Sample[] = [
	{ day: "Oct 1", stamp: 20261001, segment: "Web", sessions: 240, errors: 4, status: "Steady", series: [18, 22, 20, 28, 24] },
	{ day: "Oct 2", stamp: 20261002, segment: "Studio", sessions: 180, errors: 11, status: "Watch", series: [12, 16, 14, 22, 19] },
	{ day: "Oct 3", stamp: 20261003, segment: "Phone", sessions: 96, errors: 1, status: "Quiet", series: [8, 9, 7, 11, 10] },
	{ day: "Oct 4", stamp: 20261004, segment: "Web", sessions: 310, errors: 6, status: "Steady", series: [20, 26, 24, 30, 28] },
	{ day: "Oct 5", stamp: 20261005, segment: "Studio", sessions: 150, errors: 9, status: "Watch", series: [14, 12, 18, 16, 15] },
	{ day: "Oct 6", stamp: 20261006, segment: "Phone", sessions: 88, errors: 2, status: "Quiet", series: [6, 8, 7, 9, 8] },
	{ day: "Oct 7", stamp: 20261007, segment: "Web", sessions: 360, errors: 5, status: "Steady", series: [24, 30, 28, 36, 34] },
	{ day: "Oct 8", stamp: 20261008, segment: "Studio", sessions: 210, errors: 14, status: "Watch", series: [16, 20, 18, 26, 22] },
	{ day: "Oct 9", stamp: 20261009, segment: "Phone", sessions: 120, errors: 3, status: "Quiet", series: [9, 11, 10, 14, 12] },
	{ day: "Oct 10", stamp: 20261010, segment: "Web", sessions: 280, errors: 7, status: "Steady", series: [22, 24, 26, 23, 27] },
	{ day: "Oct 11", stamp: 20261011, segment: "Studio", sessions: 164, errors: 8, status: "Watch", series: [13, 15, 14, 18, 16] },
	{ day: "Oct 12", stamp: 20261012, segment: "Phone", sessions: 102, errors: 2, status: "Quiet", series: [7, 10, 8, 11, 9] },
];

function inSpan(stamp: number, span: DateSpan) {
	if (span.start === undefined) return true;
	const last = span.finish ?? span.start;
	return stamp >= math.min(span.start, last) && stamp <= math.max(span.start, last);
}

function visibleRows(segment: string, span: DateSpan, phase: Args["phase"]) {
	const rows: Sample[] = [];
	if (phase === "empty") return rows;
	for (const row of ROWS) {
		if (segment !== "All" && row.segment !== segment) continue;
		if (!inSpan(row.stamp, span)) continue;
		rows.push(row);
	}
	return rows;
}

function ordered(rows: Sample[], sort: string) {
	const copy: Sample[] = [];
	for (const row of rows) copy.push(row);
	if (sort === "sessions") copy.sort((a, b) => a.sessions > b.sessions);
	else if (sort === "errors") copy.sort((a, b) => a.errors > b.errors);
	else copy.sort((a, b) => a.stamp < b.stamp);
	return copy;
}

function metricValues(rows: Sample[], metric: string) {
	const values: number[] = [];
	for (const row of ordered(rows, "day")) values.push(metric === "errors" ? row.errors : row.sessions);
	return values;
}

function total(values: number[]) {
	let sum = 0;
	for (const value of values) sum += value;
	return sum;
}

function peak(values: number[]) {
	let best = 0;
	for (const value of values) if (value > best) best = value;
	return best;
}

function deltaOf(values: number[]) {
	const count = values.size();
	if (count < 2) return "0%";
	const mid = math.floor(count / 2);
	let early = 0;
	let late = 0;
	for (let index = 0; index < count; index++) {
		if (index < mid) early += values[index];
		else late += values[index];
	}
	if (early === 0) return "New";
	const pct = math.floor(((late - early) / early) * 100);
	return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

function pageSlice(rows: Sample[], page: number) {
	const start = (page - 1) * PAGE;
	const slice: Sample[] = [];
	for (let index = 0; index < rows.size(); index++) {
		if (index >= start && index < start + PAGE) slice.push(rows[index]);
	}
	return slice;
}

function cellsOf(rows: Sample[]) {
	const cells: string[][] = [];
	for (const row of rows) cells.push([row.day, row.segment, tostring(row.sessions), tostring(row.errors), row.status]);
	return cells;
}

function TextLine(props: { text: string; variant?: "h3" | "body" | "caption"; color?: "textPrimary" | "textSecondary" | "error" }) {
	return (
		<Typography
			text={props.text}
			variant={props.variant ?? "body"}
			color={props.color ?? "textPrimary"}
			sx={{ Size: new UDim2(1, 0, 0, props.variant === "h3" ? 28 : 20), AutomaticSize: Enum.AutomaticSize.None }}
		/>
	);
}

function KpiCard(props: { label: string; value: string; delta: string; values: number[]; width: number; fill: boolean }) {
	const down = string.sub(props.delta, 1, 1) === "-";
	return (
		<Paper elevation="flat" sx={{ Size: props.fill ? new UDim2(1, 0, 0, 0) : new UDim2(0.33, -8, 0, 0), AutomaticSize: Enum.AutomaticSize.Y, p: 2 }}>
			<Stack direction="column" gap={1} sx={STACK}>
				<TextLine text={props.label} variant="caption" color="textSecondary" />
				<TextLine text={props.value} variant="h3" />
				<Tooltip text="Compared with the earlier half of this window.">
					<textlabel
						Text={props.delta}
						AutomaticSize={Enum.AutomaticSize.XY}
						Size={new UDim2(0, 0, 0, 0)}
						BackgroundTransparency={1}
						Font={Enum.Font.SourceSans}
						TextSize={14}
						TextColor3={down ? Color3.fromRGB(176, 64, 64) : Color3.fromRGB(46, 120, 72)}
					/>
				</Tooltip>
				<Sparkline values={props.values} width={props.width} height={36} />
			</Stack>
		</Paper>
	);
}

function Detail(props: { row?: Sample; width: number }) {
	const row = props.row;
	if (row === undefined) return <TextLine text="Choose a row to inspect." color="textSecondary" />;
	return (
		<Stack direction="column" gap={1} sx={STACK}>
			<TextLine text={`${row.day} · ${row.segment}`} variant="h3" />
			<Badge count={row.errors} max={99} color={row.errors > 8 ? "error" : "success"}>
				<textlabel
					Text={row.status}
					AutomaticSize={Enum.AutomaticSize.XY}
					Size={new UDim2(0, 0, 0, 0)}
					BackgroundTransparency={1}
					Font={Enum.Font.SourceSans}
					TextSize={16}
					TextColor3={Color3.fromRGB(40, 40, 40)}
				/>
			</Badge>
			<TextLine text={`${row.sessions} sessions`} color="textSecondary" />
			<Sparkline values={row.series} width={props.width} height={72} />
		</Stack>
	);
}

function AnalyticsConsole(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const sparkWidth = narrow ? 300 : 160;
	const trendWidth = narrow ? 320 : 680;
	const [phase, setPhase] = useArg(args.phase);
	const [page, setPage] = useArg(args.page);
	const [menuOpen, setMenuOpen] = useArg(args.menuOpen);
	const [detailOpen, setDetailOpen] = useArg(args.detailOpen);
	const [span, setSpan] = useState<DateSpan>({});
	const [year, setYear] = useState(2026);
	const [month, setMonth] = useState(10);
	const [segment, setSegment] = useState("All");
	const [sort, setSort] = useState("day");
	const [metric, setMetric] = useState("sessions");
	const [pick, setPick] = useState(0);
	const [anchor, setAnchor] = useState<TextButton>();

	const rows = ordered(visibleRows(segment, span, phase), sort);
	const sessions = metricValues(rows, "sessions");
	const errors = metricValues(rows, "errors");
	const trend = metric === "errors" ? errors : sessions;
	const count = math.max(1, math.ceil(rows.size() / PAGE));
	const shownPage = math.clamp(page, 1, count);
	const slice = pageSlice(rows, shownPage);
	const current = slice[pick];
	const sortLabel = sort === "sessions" ? "Sessions" : sort === "errors" ? "Errors" : "Day";

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants={true}>
			<AppBar title="Usage" elevation="raised">
				<Button ref={setAnchor} text={sortLabel} variant="outlined" size="small" onLeftClick={() => setMenuOpen(true)} />
			</AppBar>
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar), Size: new UDim2(1, 0, 1, -bar), p: 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<frame Size={new UDim2(0, narrow ? 340 : 320, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
						<DateRangePicker
							year={year}
							month={month}
							value={span}
							onChange={(value: DateSpan) => {
								setSpan(value);
								setPage(1);
							}}
							onMonthChange={(requestedYear: number, requestedMonth: number) => {
								setYear(requestedYear);
								setMonth(requestedMonth);
							}}
						/>
					</frame>
					<Stack direction="column" gap={2} sx={STACK}>
							<Stack direction={narrow ? "column" : "row"} gap={1} alignItems="center" sx={STACK}>
								<Stack direction="row" gap={1} sx={STACK}>
									{SEGMENTS.map((label) => (
										<Chip key={label} label={label} size="small" selected={segment === label} onActivated={() => { setSegment(label); setPage(1); }} />
									))}
								</Stack>
								<Select
									value={metric}
									options={[
										{ label: "Sessions", value: "sessions" },
										{ label: "Errors", value: "errors" },
									]}
									onChange={(value: string) => setMetric(value)}
									sx={{ Size: new UDim2(0, 160, 0, 36) }}
								/>
							</Stack>
							{phase === "loading" ? (
								<Stack direction="column" gap={1} sx={STACK}>
									<Skeleton variant="rounded" width={trendWidth} height={72} />
									<Skeleton variant="text" width={trendWidth} lines={3} />
								</Stack>
							) : phase === "error" ? (
								<Alert severity="error" title="Usage did not load" message="The window could not be read. Try again." onClose={() => setPhase("ready")} />
							) : (
								<>
									<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
										<uilistlayout FillDirection={narrow ? Enum.FillDirection.Vertical : Enum.FillDirection.Horizontal} Padding={new UDim(0, 8)} />
										<KpiCard label="Sessions" value={tostring(total(sessions))} delta={deltaOf(sessions)} values={sessions} width={sparkWidth} fill={narrow} />
										<KpiCard label="Errors" value={tostring(total(errors))} delta={deltaOf(errors)} values={errors} width={sparkWidth} fill={narrow} />
										<KpiCard label="Peak" value={tostring(peak(trend))} delta={deltaOf(trend)} values={trend} width={sparkWidth} fill={narrow} />
									</frame>
									<Paper elevation="flat" sx={{ ...STACK, p: 2 }}>
										<Stack direction="column" gap={1} sx={STACK}>
											<TextLine text={metric === "errors" ? "Errors across the window" : "Sessions across the window"} variant="caption" color="textSecondary" />
											<Box
												sx={{
													Size: new UDim2(1, 0, 0, narrow ? 150 : 190),
													AutomaticSize: Enum.AutomaticSize.None,
													gradient: { colors: [theme.palette.primary.main, theme.palette.surface.canvas], rotation: 110 },
													p: 2,
												}}
											>
												<Sparkline values={trend} width={trendWidth} height={narrow ? 110 : 140} />
											</Box>
										</Stack>
									</Paper>
								</>
							)}
						</Stack>
					{phase === "empty" || (phase === "ready" && rows.size() === 0) ? (
						<TextLine text="No rows in this window." color="textSecondary" />
					) : phase === "ready" ? (
						<Stack direction="column" gap={1} sx={STACK}>
							<Table
								dense
								columns={["Day", "Segment", "Sessions", "Errors", "Status"]}
								rows={cellsOf(slice)}
								selected={current !== undefined ? pick : undefined}
								onRowActivated={(index: number) => {
									setPick(index);
									setDetailOpen(true);
								}}
							/>
							<Pagination count={count} page={shownPage} onChange={(nextPage: number) => { setPage(nextPage); setPick(0); }} />
						</Stack>
					) : undefined}
				</Stack>
			</ScrollView>
			<Menu
				anchor={anchor}
				open={menuOpen}
				dense
				selected={sort}
				items={[
					{ id: "day", text: "Day" },
					{ id: "sessions", text: "Sessions" },
					{ id: "errors", text: "Errors" },
				]}
				onSelect={(id: string) => {
					setSort(id);
					setPage(1);
				}}
				onClose={() => setMenuOpen(false)}
			/>
			<Drawer open={narrow && detailOpen} edge="right" width={320} onClose={() => setDetailOpen(false)}>
				<Detail row={current} width={260} />
			</Drawer>
			<Dialog open={!narrow && detailOpen} title="Row detail" onClose={() => setDetailOpen(false)} actions={<Button text="Close" variant="text" onLeftClick={() => setDetailOpen(false)} />}>
				<Detail row={current} width={360} />
			</Dialog>
		</frame>
	);
}

export default {
	title: "Scenarios/Analytics Console",
	description: "Usage screen with a date range, KPI sparklines, a trend, segment filters, a dense table, and row detail.",
	args: { viewport: "desktop", phase: "ready", page: 1, menuOpen: false, detailOpen: false },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
		page: { type: "number", min: 1, max: 4, step: 1 },
		menuOpen: { type: "boolean" },
		detailOpen: { type: "boolean" },
	},
	preview: { width: 1100, height: 760 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <AnalyticsConsole {...args} />,
};
