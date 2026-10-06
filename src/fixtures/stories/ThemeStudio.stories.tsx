import React, { useState } from "@rbxts/react";
import {
	AppBar,
	Box,
	Button,
	Chip,
	ColorPicker,
	DarkTheme,
	Dialog,
	FormHelperText,
	FormLabel,
	GradientEditor,
	Input,
	LightTheme,
	Menu,
	Paper,
	ScrollView,
	Shadow,
	Slider,
	Snackbar,
	Stack,
	Switch,
	Table,
	ThemeProvider,
	ToastVariants,
	Typography,
	useTheme,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "tablet" | "desktop";
}

interface Wash {
	color: ColorSequence;
	transparency: NumberSequence;
	rotation: number;
	offset: Vector2;
	enabled: boolean;
}

interface Draft {
	name: string;
	ink: Color3;
	paper: Color3;
	wash: Wash;
	appearance: "light" | "dark";
	fontSize: number;
	typeScale: "body" | "subtitle1" | "h6";
	pad: number;
	radius: number;
	opacity: number;
	raised: boolean;
	disabled: boolean;
	pinned: boolean;
}

interface Notice {
	message: string;
	variant: ToastVariants;
	undo: boolean;
}

interface Choice {
	label: string;
	value: string;
}

const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 780 },
	tablet: { width: 760, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const BREAKS: Choice[] = [
	{ label: "Phone", value: "phone" },
	{ label: "Tablet", value: "tablet" },
	{ label: "Desktop", value: "desktop" },
];

const LOOKS: Choice[] = [
	{ label: "Light", value: "light" },
	{ label: "Dark", value: "dark" },
];

const SECTIONS: Choice[] = [
	{ label: "Color", value: "color" },
	{ label: "Gradient", value: "gradient" },
	{ label: "Type", value: "type" },
	{ label: "Space", value: "space" },
];

const SCALES: Choice[] = [
	{ label: "Body", value: "body" },
	{ label: "Subtitle", value: "subtitle1" },
	{ label: "Title", value: "h6" },
];

const SEED: Draft = {
	name: "Harbor",
	ink: Color3.fromRGB(20, 48, 56),
	paper: Color3.fromRGB(244, 248, 246),
	wash: {
		color: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(28, 96, 110)),
			new ColorSequenceKeypoint(0.55, Color3.fromRGB(232, 214, 176)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(244, 248, 246)),
		]),
		transparency: new NumberSequence([
			new NumberSequenceKeypoint(0, 0.05),
			new NumberSequenceKeypoint(1, 0.4),
		]),
		rotation: 120,
		offset: new Vector2(0, 0),
		enabled: true,
	},
	appearance: "light",
	fontSize: 18,
	typeScale: "h6",
	pad: 2,
	radius: 12,
	opacity: 1,
	raised: true,
	disabled: false,
	pinned: true,
};

function cloneDraft(draft: Draft): Draft {
	return {
		name: draft.name,
		ink: draft.ink,
		paper: draft.paper,
		wash: {
			color: draft.wash.color,
			transparency: draft.wash.transparency,
			rotation: draft.wash.rotation,
			offset: draft.wash.offset,
			enabled: draft.wash.enabled,
		},
		appearance: draft.appearance,
		fontSize: draft.fontSize,
		typeScale: draft.typeScale,
		pad: draft.pad,
		radius: draft.radius,
		opacity: draft.opacity,
		raised: draft.raised,
		disabled: draft.disabled,
		pinned: draft.pinned,
	};
}

function washPaint(wash: Wash) {
	const colors = new Array<Color3>();
	const times = new Array<number>();
	const points = wash.color.Keypoints;
	for (let index = 0; index < points.size(); index++) {
		colors.push(points[index].Value);
		times.push(points[index].Time);
	}
	return {
		colors,
		times,
		rotation: wash.rotation,
		transparency: wash.transparency,
		offset: wash.offset,
	};
}

function ChoiceRow(props: { options: Choice[]; value: string; onChange: (value: string) => void }) {
	return (
		<Stack direction="row" gap={1} sx={STACK}>
			{props.options.map((option) => (
				<Chip
					key={option.value}
					label={option.label}
					size="small"
					selected={option.value === props.value}
					onActivated={() => props.onChange(option.value)}
				/>
			))}
		</Stack>
	);
}

function Editor(props: { draft: Draft; section: string; fault: boolean; onSection: (section: string) => void; onChange: (draft: Draft) => void }) {
	const { draft } = props;
	return (
		<Stack direction="column" gap={1} sx={{ ...STACK, p: { phone: 1, desktop: 2 } }}>
			<ChoiceRow options={SECTIONS} value={props.section} onChange={props.onSection} />
			{props.section === "color" && (
				<Stack direction="column" gap={1} sx={STACK}>
					<FormLabel text="Name" hasError={props.fault} />
					<Input
						text={draft.name}
						placeholder="Theme name"
						hasError={props.fault}
						onTextChanged={(name) => props.onChange({ ...draft, name })}
					/>
					{props.fault && <FormHelperText text="Use at least 2 characters" hasError />}
					<FormLabel text="Ink" />
					<ColorPicker value={draft.ink} onChange={(ink) => props.onChange({ ...draft, ink })} />
					<FormLabel text="Paper" />
					<ColorPicker value={draft.paper} onChange={(paper) => props.onChange({ ...draft, paper })} />
					<ChoiceRow
						options={LOOKS}
						value={draft.appearance}
						onChange={(appearance) => props.onChange({ ...draft, appearance: appearance as Draft["appearance"] })}
					/>
				</Stack>
			)}
			{props.section === "gradient" && (
				<GradientEditor value={draft.wash} onChange={(wash) => props.onChange({ ...draft, wash })} />
			)}
			{props.section === "type" && (
				<Stack direction="column" gap={1} sx={STACK}>
					<FormLabel text="Size" />
					<Slider value={draft.fontSize} min={14} max={32} step={1} onChange={(fontSize) => props.onChange({ ...draft, fontSize })} />
					<ChoiceRow
						options={SCALES}
						value={draft.typeScale}
						onChange={(typeScale) => props.onChange({ ...draft, typeScale: typeScale as Draft["typeScale"] })}
					/>
				</Stack>
			)}
			{props.section === "space" && (
				<Stack direction="column" gap={1} sx={STACK}>
					<FormLabel text="Padding" />
					<Slider value={draft.pad} min={0} max={4} step={0.5} onChange={(pad) => props.onChange({ ...draft, pad })} />
					<FormLabel text="Radius" />
					<Slider value={draft.radius} min={0} max={24} step={1} onChange={(radius) => props.onChange({ ...draft, radius })} />
					<FormLabel text="Opacity" />
					<Slider value={draft.opacity} min={0.35} max={1} step={0.05} onChange={(opacity) => props.onChange({ ...draft, opacity })} />
					<Switch label="Raised" value={draft.raised} onChange={(raised) => props.onChange({ ...draft, raised })} />
					<Switch label="Disabled" value={draft.disabled} onChange={(disabled) => props.onChange({ ...draft, disabled })} />
					<Switch label="Pinned" value={draft.pinned} onChange={(pinned) => props.onChange({ ...draft, pinned })} />
				</Stack>
			)}
		</Stack>
	);
}

function Preview(props: { draft: Draft; onPinned: (pinned: boolean) => void }) {
	const { draft } = props;
	const [menuOpen, setMenuOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [anchor, setAnchor] = useState<TextButton>();
	const paint = draft.wash.enabled ? washPaint(draft.wash) : undefined;
	return (
		<ThemeProvider theme={draft.appearance === "dark" ? DarkTheme : LightTheme}>
			<Stack direction="column" sx={{ ...STACK, p: { phone: 1, tablet: 1.5, desktop: 2 }, gap: { phone: 1, desktop: 2 } }}>
				<Box
					sx={{
						...STACK,
						bgcolor: draft.paper,
						gradient: paint,
						radius: draft.radius,
						p: draft.pad,
						opacity: draft.opacity,
						border: 1,
						borderColor: draft.ink,
					}}
				>
					{draft.raised && <Shadow />}
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography
							text={draft.name}
							variant={draft.typeScale}
							sx={{ fontSize: draft.fontSize, TextColor3: draft.ink }}
						/>
						<Typography text="Notes for the north dock stay with the lane." sx={{ TextColor3: draft.ink }} />
						<Button
							text="Save note"
							variant="contained"
							disabled={draft.disabled}
							sx={{ bgcolor: draft.ink, TextColor3: draft.paper, radius: draft.radius, fontSize: draft.fontSize }}
						/>
					</Stack>
				</Box>
				<Paper elevation={draft.raised ? "raised" : "flat"} sx={STACK}>
					<Typography text="Lane card" variant="subtitle2" />
				</Paper>
				<Input text="" placeholder="Field note" disabled={draft.disabled} onTextChanged={() => {}} />
				<Stack direction="row" gap={1} sx={STACK}>
					<Button
						ref={setAnchor}
						text="Menu"
						variant="outlined"
						disabled={draft.disabled}
						onLeftClick={() => setMenuOpen(true)}
					/>
					<Button text="Dialog" variant="outlined" disabled={draft.disabled} onLeftClick={() => setDialogOpen(true)} />
					<Chip label="Pinned" size="small" selected={draft.pinned} disabled={draft.disabled} onActivated={() => props.onPinned(!draft.pinned)} />
				</Stack>
				<Table
					columns={["Lane", "State"]}
					rows={[
						["North dock", "Open"],
						["Field", "Quiet"],
					]}
				/>
				<Menu
					anchor={anchor}
					open={menuOpen}
					items={[
						{ id: "pin", text: "Pin note" },
						{ id: "clear", text: "Clear note" },
					]}
					onSelect={() => setMenuOpen(false)}
					onClose={() => setMenuOpen(false)}
				/>
				<Dialog
					open={dialogOpen}
					title="Field note"
					onClose={() => setDialogOpen(false)}
					actions={<Button text="Close" variant="contained" color="primary" onLeftClick={() => setDialogOpen(false)} />}
				>
					<Typography text="Keep this on the north dock." />
				</Dialog>
			</Stack>
		</ThemeProvider>
	);
}

function ThemeStudio(args: Args) {
	const { theme } = useTheme();
	const [viewport, setViewport] = useArg<Args["viewport"]>(args.viewport);
	const size = VIEWPORT[viewport];
	const split = viewport !== "phone";
	const side = viewport === "desktop" ? 380 : 320;
	const bar = theme.spacing.calc(7);
	const [section, setSection] = useState("color");
	const [draft, setDraft] = useState(SEED);
	const [committed, setCommitted] = useState(SEED);
	const [backup, setBackup] = useState<Draft>();
	const [fault, setFault] = useState(false);
	const [notice, setNotice] = useState<Notice>();

	const named = draft.name.size() >= 2;
	const save = () => {
		if (!named) {
			setFault(true);
			setNotice({ message: "Name the theme", variant: ToastVariants.error, undo: false });
			return;
		}
		setFault(false);
		setBackup(cloneDraft(committed));
		setCommitted(cloneDraft(draft));
		setNotice({ message: "Saved", variant: ToastVariants.success, undo: true });
	};
	const undo = () => {
		if (backup === undefined) return;
		const restored = cloneDraft(backup);
		setDraft(restored);
		setCommitted(restored);
		setFault(false);
		setNotice(undefined);
	};
	const reset = () => {
		setDraft(cloneDraft(SEED));
		setFault(false);
		setNotice({ message: "Reset", variant: ToastVariants.default, undo: false });
	};
	const publish = () => {
		if (!named) {
			setFault(true);
			setNotice({ message: "Name the theme", variant: ToastVariants.error, undo: false });
			return;
		}
		setFault(false);
		setNotice({ message: `${draft.name} export ready`, variant: ToastVariants.success, undo: false });
	};

	const editor = (
		<Stack direction="column" gap={1} sx={STACK}>
			<ChoiceRow options={BREAKS} value={viewport} onChange={(value) => setViewport(value as Args["viewport"])} />
			<Editor draft={draft} section={section} fault={fault} onSection={setSection} onChange={setDraft} />
			<Stack direction="row" gap={1} sx={STACK}>
				<Button text="Save" variant="contained" color="primary" size="small" onLeftClick={save} />
				<Button text="Reset" variant="outlined" size="small" onLeftClick={reset} />
				<Button text="Export" variant="outlined" size="small" onLeftClick={publish} />
			</Stack>
		</Stack>
	);
	const preview = <Preview draft={draft} onPinned={(pinned) => setDraft({ ...draft, pinned })} />;

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants={true}>
			<AppBar title="Theme" elevation="raised" />
			{split ? (
				<frame Position={new UDim2(0, 0, 0, bar)} Size={new UDim2(1, 0, 1, -bar)} BackgroundTransparency={1}>
					<frame Size={new UDim2(0, side, 1, 0)} BackgroundTransparency={1}>
						<ScrollView sx={{ p: 1 }}>{editor}</ScrollView>
					</frame>
					<frame Position={new UDim2(0, side, 0, 0)} Size={new UDim2(1, -side, 1, 0)} BackgroundTransparency={1}>
						<ScrollView>{preview}</ScrollView>
					</frame>
				</frame>
			) : (
				<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar), Size: new UDim2(1, 0, 1, -bar), p: 1 }}>
					<Stack direction="column" gap={2} sx={STACK}>
						{editor}
						{preview}
					</Stack>
				</ScrollView>
			)}
			{notice !== undefined && (
				<Snackbar
					message={notice.message}
					variant={notice.variant}
					action={notice.undo ? "Undo" : undefined}
					onAction={undo}
					onDismiss={() => setNotice(undefined)}
				/>
			)}
		</frame>
	);
}

export default {
	title: "Scenarios/Theme Studio",
	description: "Live palette, gradient, type, and spacing preview.",
	args: { viewport: "desktop" },
	argTypes: { viewport: { type: "enum", options: ["phone", "tablet", "desktop"] } },
	tags: ["scenario"],
	render: (args: Args) => <ThemeStudio {...args} />,
};
