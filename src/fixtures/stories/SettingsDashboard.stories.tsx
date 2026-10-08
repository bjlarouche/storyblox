import React, { useState } from "@rbxts/react";
import {
	Alert,
	AppBar,
	Box,
	Button,
	Checkbox,
	Chip,
	Dialog,
	Drawer,
	FormLabel,
	Input,
	LinearProgress,
	ListItem,
	NumberInput,
	Paper,
	Select,
	Snackbar,
	Stack,
	Switch,
	Table,
	Tooltip,
	Typography,
	useTheme,
	WriteableStyle,
} from "@rbxts/uiblox";
import { ScrollView, useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	section: "all" | "account" | "workspace" | "preferences" | "activity" | "usage";
	navOpen: boolean;
	confirmOpen: boolean;
	savedOpen: boolean;
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 760 },
	desktop: { width: 1100, height: 720 },
};

const SECTIONS: { id: Args["section"]; label: string }[] = [
	{ id: "all", label: "All sections" },
	{ id: "account", label: "Account" },
	{ id: "workspace", label: "Workspace" },
	{ id: "preferences", label: "Preferences" },
	{ id: "activity", label: "Activity" },
	{ id: "usage", label: "Usage" },
];

const FILTERS = ["All", "Delivered", "Failed", "Queued"];

const ROLES = [
	{ label: "Viewer", value: "viewer" },
	{ label: "Editor", value: "editor" },
	{ label: "Admin", value: "admin" },
];

const ZONES = [
	{ label: "Pacific", value: "pacific" },
	{ label: "Eastern", value: "eastern" },
	{ label: "Universal", value: "universal" },
];

interface Notice {
	event: string;
	channel: string;
	status: string;
}

const NOTICES: Notice[] = [
	{ event: "Build finished", channel: "Mail", status: "Delivered" },
	{ event: "Seat invited", channel: "In app", status: "Queued" },
	{ event: "Invoice ready", channel: "Mail", status: "Failed" },
	{ event: "Digest sent", channel: "Mail", status: "Delivered" },
	{ event: "Key rotated", channel: "In app", status: "Delivered" },
	{ event: "Export stalled", channel: "Mail", status: "Failed" },
	{ event: "Comment added", channel: "In app", status: "Queued" },
	{ event: "Plan renewed", channel: "Mail", status: "Delivered" },
];

const WORKSPACES: { name: string; plan: string; seats: string; usage: number; from: "primary.main" | "accent.main"; to: "surface.elevated" | "surface.paper" }[] = [
	{ name: "Northline", plan: "Team", seats: "6 of 8 seats", usage: 0.75, from: "primary.main", to: "surface.elevated" },
	{ name: "Field Notes", plan: "Personal", seats: "1 of 2 seats", usage: 0.5, from: "accent.main", to: "surface.paper" },
];

const METERS = [
	{ label: "Storage", detail: "12.8 of 20 GB", value: 0.64 },
	{ label: "Build minutes", detail: "640 of 1000", value: 0.64 },
	{ label: "Seats", detail: "6 of 8", value: 0.75 },
];

const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };

const DEFAULTS = {
	name: "Avery Cole",
	email: "avery.cole",
	role: "editor",
	zone: "pacific",
	retention: 30,
	digest: true,
	compact: false,
	motion: true,
	review: true,
};

function shows(current: string, id: string) {
	return current === "all" || current === id;
}

function Line(props: { text: string; variant?: "h3" | "body" | "caption"; color?: "textPrimary" | "textSecondary" | "error"; tall?: boolean }) {
	return (
		<Typography
			text={props.text}
			variant={props.variant ?? "body"}
			color={props.color ?? "textPrimary"}
			sx={{
				Size: new UDim2(1, 0, 0, props.tall ? 0 : 22),
				AutomaticSize: props.tall ? Enum.AutomaticSize.Y : Enum.AutomaticSize.None,
			}}
		/>
	);
}

function Field(props: { label: string; children: React.ReactNode }) {
	return (
		<Stack direction="column" gap={0.5} sx={STACK}>
			<FormLabel text={props.label} />
			{props.children}
		</Stack>
	);
}

function Banner(props: { from: "primary.main" | "accent.main"; to: "surface.elevated" | "surface.paper" }) {
	return (
		<Box
			bgcolor="paper"
			sx={
				{
					AutomaticSize: Enum.AutomaticSize.None,
					Size: new UDim2(1, 0, 0, 48),
					gradient: { colors: [props.from, props.to], rotation: 105 },
				} as WriteableStyle<Frame>
			}
		/>
	);
}

function SectionNav(props: { section: string; onPick: (id: string) => void }) {
	return (
		<Stack direction="column" gap={0.5} sx={STACK}>
			{SECTIONS.map((item) => (
				<ListItem
					key={item.id}
					text={item.label}
					selected={props.section === item.id}
					onActivated={() => props.onPick(item.id)}
				/>
			))}
		</Stack>
	);
}

function Meter(props: { label: string; detail: string; value: number }) {
	return (
		<Stack direction="column" gap={0.5} sx={STACK}>
			<Line text={`${props.label} · ${props.detail}`} variant="caption" color="textSecondary" />
			<LinearProgress value={props.value} sx={{ Size: new UDim2(1, 0, 0, 8) }} />
		</Stack>
	);
}

function SettingsDashboard(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const tools = narrow ? 104 : 52;
	const [section, setSection] = useArg<string>(args.section);
	const [navOpen, setNavOpen] = useArg(args.navOpen);
	const [confirmOpen, setConfirmOpen] = useArg(args.confirmOpen);
	const [savedOpen, setSavedOpen] = useArg(args.savedOpen);
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [picked, setPicked] = useState<number>();
	const [name, setName] = useState(DEFAULTS.name);
	const [email, setEmail] = useState(DEFAULTS.email);
	const [role, setRole] = useState(DEFAULTS.role);
	const [zone, setZone] = useState(DEFAULTS.zone);
	const [retention, setRetention] = useState(DEFAULTS.retention);
	const [digest, setDigest] = useState(DEFAULTS.digest);
	const [compact, setCompact] = useState(DEFAULTS.compact);
	const [motion, setMotion] = useState(DEFAULTS.motion);
	const [review, setReview] = useState(DEFAULTS.review);

	const needle = string.lower(query);
	const rows: string[][] = [];
	for (const entry of NOTICES) {
		if (filter !== "All" && entry.status !== filter) continue;
		if (needle.size() > 0 && string.find(string.lower(entry.event), needle, 1, true) === undefined) continue;
		rows.push([entry.event, entry.channel, entry.status]);
	}

	const pick = (id: string) => {
		setSection(id);
		setNavOpen(false);
	};
	const restore = () => {
		setName(DEFAULTS.name);
		setEmail(DEFAULTS.email);
		setRole(DEFAULTS.role);
		setZone(DEFAULTS.zone);
		setRetention(DEFAULTS.retention);
		setDigest(DEFAULTS.digest);
		setCompact(DEFAULTS.compact);
		setMotion(DEFAULTS.motion);
		setReview(DEFAULTS.review);
		setConfirmOpen(false);
	};

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants={true}>
			<AppBar title="Settings" elevation="raised" color="default">
				{narrow && <Button text="Sections" variant="outlined" size="small" onLeftClick={() => setNavOpen(true)} />}
				<Button text="Save" variant="contained" size="small" color="primary" onLeftClick={() => setSavedOpen(true)} />
			</AppBar>
			<frame Position={new UDim2(0, 0, 0, bar)} Size={new UDim2(1, 0, 0, tools)} BackgroundTransparency={1} BorderSizePixel={0}>
				<uipadding PaddingTop={new UDim(0, 8)} PaddingLeft={new UDim(0, 12)} PaddingRight={new UDim(0, 12)} />
				<Stack direction="row" gap={1} wrap={true} alignItems="center" sx={STACK}>
					<Input
						text={query}
						placeholder="Search activity"
						variant="outlined"
						size="small"
						width={narrow ? new UDim(1, 0) : new UDim(0, 240)}
						onTextChanged={setQuery}
					/>
					{FILTERS.map((name) => (
						<Chip
							key={name}
							label={name}
							size="small"
							selected={filter === name}
							variant={filter === name ? "filled" : "outlined"}
							color={filter === name ? "primary" : "default"}
							onActivated={() => setFilter(name)}
						/>
					))}
					<Tooltip text="Restore the original account and preferences.">
						<Button text="Reset" variant="text" size="small" onLeftClick={() => setConfirmOpen(true)} />
					</Tooltip>
				</Stack>
			</frame>
			<frame
				Position={new UDim2(0, 0, 0, bar + tools)}
				Size={new UDim2(1, 0, 1, -(bar + tools))}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 12)} SortOrder={Enum.SortOrder.LayoutOrder} />
				{!narrow && (
					<Paper elevation="outlined" sx={{ LayoutOrder: 0, Size: new UDim2(0, 220, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}>
						<SectionNav section={section} onPick={pick} />
					</Paper>
				)}
				<ScrollView sx={{ LayoutOrder: 1, Size: narrow ? UDim2.fromScale(1, 1) : new UDim2(1, -232, 1, 0), p: 2 }}>
					<Stack direction="column" gap={2} sx={STACK}>
						<Line
							text="Profile, workspace, and delivery preferences for the Northline account. Nothing is sent until you save."
							color="textSecondary"
							tall
						/>
						{shows(section, "account") && (
							<Paper elevation="outlined" sx={STACK}>
								<Stack direction="column" gap={1.5} sx={STACK}>
									<Line text="Account" variant="h3" />
									<Line text="Who you are on this workspace, and where receipts go." color="textSecondary" tall />
									<Field label="Name">
										<Input text={name} variant="outlined" width={new UDim(1, 0)} onTextChanged={setName} />
									</Field>
									<Field label="Email">
										<Input
											text={email}
											variant="outlined"
											width={new UDim(1, 0)}
											helperText="Used for delivery receipts."
											onTextChanged={setEmail}
										/>
									</Field>
									<Field label="Role">
										<Select value={role} options={ROLES} onChange={setRole} sx={{ Size: new UDim2(1, 0, 0, 36) }} />
									</Field>
									<Field label="Timezone">
										<Select value={zone} options={ZONES} onChange={setZone} sx={{ Size: new UDim2(1, 0, 0, 36) }} />
									</Field>
								</Stack>
							</Paper>
						)}
						{shows(section, "workspace") && (
							<Paper elevation="outlined" sx={STACK}>
								<Stack direction="column" gap={1.5} sx={STACK}>
									<Line text="Workspace" variant="h3" />
									<Line text="Places you can open. Seat use is against the plan cap." color="textSecondary" tall />
									<Stack direction={narrow ? "column" : "row"} gap={1.5} sx={STACK}>
										{WORKSPACES.map((place) => (
											<Paper
												key={place.name}
												elevation="raised"
												sx={{ Size: narrow ? new UDim2(1, 0, 0, 0) : new UDim2(0, 300, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
											>
												<Stack direction="column" gap={1} sx={STACK}>
													<Banner from={place.from} to={place.to} />
													<Line text={place.name} variant="h3" />
													<Chip label={place.plan} size="small" variant="outlined" />
													<Line text={place.seats} variant="caption" color="textSecondary" />
													<LinearProgress value={place.usage} sx={{ Size: new UDim2(1, 0, 0, 8) }} />
												</Stack>
											</Paper>
										))}
									</Stack>
								</Stack>
							</Paper>
						)}
						{shows(section, "preferences") && (
							<Paper elevation="outlined" sx={STACK}>
								<Stack direction="column" gap={1} sx={STACK}>
									<Line text="Preferences" variant="h3" />
									<Line text="Delivery and review rules for this account." color="textSecondary" tall />
									<Switch value={digest} label="Weekly digest" onChange={setDigest} />
									<Switch value={compact} label="Compact lists" onChange={setCompact} />
									<Switch value={motion} label="Interface motion" onChange={setMotion} />
									<Checkbox value={review} label="Ask before publishing" onChange={setReview} />
									<Field label="Keep activity for (days)">
										<NumberInput value={retention} min={1} max={90} step={1} width={new UDim(0, 140)} onChange={setRetention} />
									</Field>
								</Stack>
							</Paper>
						)}
						{shows(section, "activity") && (
							<Paper elevation="outlined" sx={STACK}>
								<Stack direction="column" gap={1} sx={STACK}>
									<Line text="Activity" variant="h3" />
									<Alert severity="warning" title="Two deliveries failed" message="Invoice ready and Export stalled did not send." />
									<Table
										columns={["Event", "Channel", "Status"]}
										rows={rows}
										dense
										selected={picked}
										onRowActivated={setPicked}
									/>
									{rows.size() === 0 && <Line text="Nothing matches that search." color="textSecondary" />}
								</Stack>
							</Paper>
						)}
						{shows(section, "usage") && (
							<Paper elevation="outlined" sx={STACK}>
								<Stack direction="column" gap={1.5} sx={STACK}>
									<Line text="Usage" variant="h3" />
									<Line text="This period, across both workspaces." color="textSecondary" />
									{METERS.map((meter) => (
										<Meter key={meter.label} label={meter.label} detail={meter.detail} value={meter.value} />
									))}
								</Stack>
							</Paper>
						)}
					</Stack>
				</ScrollView>
			</frame>
			<Drawer open={narrow && navOpen} edge="left" width={280} onClose={() => setNavOpen(false)}>
				<SectionNav section={section} onPick={pick} />
			</Drawer>
			<Dialog
				open={confirmOpen}
				title="Reset settings?"
				onClose={() => setConfirmOpen(false)}
				actions={
					<Stack direction="row" gap={1} sx={{ AutomaticSize: Enum.AutomaticSize.XY }}>
						<Button text="Cancel" variant="text" onLeftClick={() => setConfirmOpen(false)} />
						<Button text="Reset" variant="contained" color="primary" onLeftClick={restore} />
					</Stack>
				}
			>
				<Line text="Account, preferences, and retention go back to the original values." color="textSecondary" tall />
			</Dialog>
			<Snackbar open={savedOpen} message="Settings saved." onDismiss={() => setSavedOpen(false)} />
		</frame>
	);
}

export default {
	title: "Scenarios/Settings Dashboard",
	description: "Settings screen: sidebar, toolbar, forms, workspace cards, usage meters, activity table, save toast, and reset dialog.",
	args: { viewport: "desktop", section: "all", navOpen: false, confirmOpen: false, savedOpen: false },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		section: { type: "enum", options: ["all", "account", "workspace", "preferences", "activity", "usage"] },
		navOpen: { type: "boolean" },
		confirmOpen: { type: "boolean" },
		savedOpen: { type: "boolean" },
	},
	preview: { width: 1100, height: 720 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <SettingsDashboard {...args} />,
};
