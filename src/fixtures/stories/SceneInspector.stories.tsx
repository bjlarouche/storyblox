import React, { useEffect, useRef, useState } from "@rbxts/react";
import {
	Accordion,
	AppBar,
	Breadcrumbs,
	Button,
	CFrameEditor,
	Chip,
	ColorPicker,
	Dialog,
	Drawer,
	EnumPicker,
	FormHelperText,
	FormLabel,
	Input,
	Menu,
	NumberInput,
	PhysicalPropertiesEditor,
	ScrollView,
	Slider,
	Stack,
	Switch,
	Tooltip,
	Tree,
	TreeView,
	Typography,
	useTheme,
	VectorEditor,
} from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
}

interface SceneObject {
	id: string;
	name: string;
	group: "Geometry" | "Lights";
	cframe: CFrame;
	size: Vector3;
	color: Color3;
	material: Enum.Material;
	transparency: number;
	physics: PhysicalProperties;
	visible: boolean;
	anchored: boolean;
	tags: string[];
	note: string;
	priority: number;
}

const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 320, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const SEED: SceneObject[] = [
	{
		id: "crate",
		name: "Supply Crate",
		group: "Geometry",
		cframe: new CFrame(0, 1.6, 0).mul(CFrame.Angles(0, math.rad(18), 0)),
		size: new Vector3(3.2, 3.2, 3.2),
		color: Color3.fromRGB(194, 126, 72),
		material: Enum.Material.WoodPlanks,
		transparency: 0,
		physics: new PhysicalProperties(0.7, 0.45, 0.15, 1, 1),
		visible: true,
		anchored: true,
		tags: ["Interactable", "Storage"],
		note: "Keeps field supplies dry.",
		priority: 2,
	},
	{
		id: "marker",
		name: "Trail Marker",
		group: "Geometry",
		cframe: new CFrame(0, 2.3, 0).mul(CFrame.Angles(0, 0, math.rad(-6))),
		size: new Vector3(1.1, 4.6, 1.1),
		color: Color3.fromRGB(64, 142, 151),
		material: Enum.Material.Metal,
		transparency: 0.08,
		physics: new PhysicalProperties(7.8, 0.35, 0.1, 1, 1),
		visible: true,
		anchored: true,
		tags: ["Navigation"],
		note: "Marks the north trail.",
		priority: 1,
	},
	{
		id: "beacon",
		name: "Quiet Beacon",
		group: "Lights",
		cframe: new CFrame(0, 1.4, 0),
		size: new Vector3(2, 2.8, 2),
		color: Color3.fromRGB(232, 204, 118),
		material: Enum.Material.Neon,
		transparency: 0.2,
		physics: new PhysicalProperties(0.7, 0.2, 0.3, 1, 1),
		visible: true,
		anchored: true,
		tags: ["Signal"],
		note: "Low-intensity route signal.",
		priority: 3,
	},
];

function copyObject(value: SceneObject): SceneObject {
	return {
		id: value.id,
		name: value.name,
		group: value.group,
		cframe: value.cframe,
		size: value.size,
		color: value.color,
		material: value.material,
		transparency: value.transparency,
		physics: value.physics,
		visible: value.visible,
		anchored: value.anchored,
		tags: [...value.tags],
		note: value.note,
		priority: value.priority,
	};
}

function ScenePreview(props: { value: SceneObject }) {
	const { theme } = useTheme();
	const frameRef = useRef<ViewportFrame>();
	const cameraRef = useRef<Camera>();

	useEffect(() => {
		const frame = frameRef.current;
		const camera = cameraRef.current;
		if (frame !== undefined && camera !== undefined) frame.CurrentCamera = camera;
	}, []);

	return (
		<viewportframe
			ref={frameRef}
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={theme.palette.surface.paper}
			BackgroundTransparency={0}
			BorderSizePixel={0}
			Ambient={Color3.fromRGB(150, 158, 164)}
			LightColor={Color3.fromRGB(255, 245, 220)}
			LightDirection={new Vector3(-1, -1, -1)}
		>
			<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
			<uigradient
				Rotation={90}
				Color={new ColorSequence(theme.palette.surface.elevated, theme.palette.surface.input)}
			/>
			<camera ref={cameraRef} CFrame={CFrame.lookAt(new Vector3(8, 6, 10), new Vector3(0, 1.2, 0))} FieldOfView={40} />
			<worldmodel>
				<part
					key="Ground"
					Anchored
					Size={new Vector3(12, 0.4, 12)}
					CFrame={new CFrame(0, -0.2, 0)}
					Color={Color3.fromRGB(86, 98, 92)}
					Material={Enum.Material.Slate}
				/>
				<part
					key={props.value.id}
					Anchored={props.value.anchored}
					Size={props.value.size}
					CFrame={props.value.cframe}
					Color={props.value.color}
					Material={props.value.material}
					Transparency={props.value.visible ? props.value.transparency : 1}
					CustomPhysicalProperties={props.value.physics}
				/>
			</worldmodel>
		</viewportframe>
	);
}

function Hierarchy(props: {
	objects: SceneObject[];
	selected: SceneObject;
	query: string;
	onQuery: (query: string) => void;
	onSelect: (value: SceneObject) => void;
}) {
	const branches = (["Geometry", "Lights"] as const).map((group) => ({
		title: group,
		leaves: props.objects
			.filter((value) => value.group === group)
			.map((value) => ({ title: value.name, onClick: () => props.onSelect(value) })),
	}));
	const tree: Tree = { title: "Objects", branches };
	return (
		<Stack direction="column" gap={1} sx={{ ...STACK, p: 1 }}>
			<Input text={props.query} placeholder="Search objects" onInput={props.onQuery} />
			<TreeView
				tree={tree}
				filter={props.query}
				selected={`${props.selected.group}/${props.selected.name}`}
				sx={{ Size: new UDim2(1, 0, 0, 430) }}
			/>
		</Stack>
	);
}

function Inspector(props: {
	value: SceneObject;
	nameFault: boolean;
	sizeFault: boolean;
	onChange: (value: SceneObject) => void;
}) {
	const { value, onChange } = props;
	return (
		<Stack direction="column" gap={1} sx={{ ...STACK, p: 1 }}>
			<Accordion title="Object" defaultOpen>
				<Stack direction="column" gap={1} sx={STACK}>
					<FormLabel text="Name" hasError={props.nameFault} />
					<Input
						text={value.name}
						hasError={props.nameFault}
						onTextChanged={(name) => onChange({ ...value, name })}
					/>
					{props.nameFault && <FormHelperText text="Use at least 2 characters" hasError />}
					<Switch label="Visible" value={value.visible} onChange={(visible) => onChange({ ...value, visible })} />
					<Switch label="Anchored" value={value.anchored} onChange={(anchored) => onChange({ ...value, anchored })} />
				</Stack>
			</Accordion>
			<Accordion title="Transform" defaultOpen>
				<Stack direction="column" gap={1} sx={STACK}>
					<CFrameEditor value={value.cframe} onChange={(cframe) => onChange({ ...value, cframe })} />
					<FormLabel text="Size" hasError={props.sizeFault} />
					<VectorEditor value={value.size} onChange={(size) => onChange({ ...value, size: size as Vector3 })} />
					{props.sizeFault && <FormHelperText text="Every size axis must be greater than 0" hasError />}
				</Stack>
			</Accordion>
			<Accordion title="Appearance" defaultOpen>
				<Stack direction="column" gap={1} sx={STACK}>
					<FormLabel text="Color" />
					<ColorPicker value={value.color} onChange={(color) => onChange({ ...value, color })} />
					<FormLabel text="Material" />
					<EnumPicker
						value={value.material}
						items={Enum.Material.GetEnumItems()}
						onChange={(material) => onChange({ ...value, material: material as Enum.Material })}
					/>
					<FormLabel text={`Transparency ${math.floor(value.transparency * 100 + 0.5)}%`} />
					<Slider
						value={value.transparency}
						min={0}
						max={1}
						step={0.05}
						onChange={(transparency) => onChange({ ...value, transparency })}
					/>
				</Stack>
			</Accordion>
			<Accordion title="Physics" defaultOpen>
				<PhysicalPropertiesEditor value={value.physics} onChange={(physics) => onChange({ ...value, physics })} />
			</Accordion>
			<Accordion title="Tags & attributes">
				<Stack direction="column" gap={1} sx={STACK}>
					<Stack direction="row" gap={1} wrap sx={STACK}>
						{value.tags.map((tag) => (
							<Chip
								key={tag}
								label={tag}
								size="small"
								variant="outlined"
								onDelete={() => onChange({ ...value, tags: value.tags.filter((current) => current !== tag) })}
							/>
						))}
					</Stack>
					<FormLabel text="Note" />
					<Input text={value.note} onTextChanged={(note) => onChange({ ...value, note })} />
					<FormLabel text="Priority" />
					<NumberInput
						value={value.priority}
						min={0}
						max={5}
						step={1}
						onChange={(priority) => onChange({ ...value, priority })}
					/>
				</Stack>
			</Accordion>
		</Stack>
	);
}

function SceneInspector(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const [objects, setObjects] = useState(SEED);
	const [selectedId, setSelectedId] = useState(SEED[0].id);
	const selected = objects.find((value) => value.id === selectedId) ?? objects[0];
	const [draft, setDraft] = useState(copyObject(selected));
	const [query, setQuery] = useState("");
	const [hierarchyOpen, setHierarchyOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState<TextButton>();
	const [tagOpen, setTagOpen] = useState(false);
	const [tagDraft, setTagDraft] = useState("");
	const [notice, setNotice] = useState("");
	const nameFault = draft.name.size() < 2;
	const sizeFault = draft.size.X <= 0 || draft.size.Y <= 0 || draft.size.Z <= 0;

	const choose = (value: SceneObject) => {
		setSelectedId(value.id);
		setDraft(copyObject(value));
		setNotice("");
		setHierarchyOpen(false);
	};
	const reset = () => {
		setDraft(copyObject(selected));
		setNotice("Changes reset");
	};
	const apply = () => {
		if (nameFault || sizeFault) {
			setNotice("Fix validation errors");
			return;
		}
		setObjects(objects.map((value) => (value.id === draft.id ? copyObject(draft) : value)));
		setNotice("Applied");
	};
	const addTag = () => {
		if (tagDraft.size() === 0 || draft.tags.includes(tagDraft)) return;
		setDraft({ ...draft, tags: [...draft.tags, tagDraft] });
		setTagDraft("");
		setTagOpen(false);
	};
	const hierarchy = (
		<Hierarchy objects={objects} selected={selected} query={query} onQuery={setQuery} onSelect={choose} />
	);
	const inspector = (
		<Inspector value={draft} nameFault={nameFault} sizeFault={sizeFault} onChange={setDraft} />
	);

	return (
		<frame
			Size={new UDim2(0, size.width, 0, size.height)}
			BackgroundColor3={theme.palette.surface.canvas}
			BorderSizePixel={0}
			ClipsDescendants
		>
			<AppBar title="Scene Inspector" elevation="raised">
				{narrow && <Button text="Objects" size="small" variant="outlined" onLeftClick={() => setHierarchyOpen(true)} />}
				<Tooltip text="Object actions">
					<Button ref={setMenuAnchor} text="More" size="small" variant="outlined" onLeftClick={() => setMenuOpen(true)} />
				</Tooltip>
			</AppBar>
			<frame
				Position={new UDim2(0, 0, 0, bar)}
				Size={new UDim2(1, 0, 1, -bar)}
				BackgroundTransparency={1}
			>
				{!narrow && (
					<frame Size={new UDim2(0, 230, 1, 0)} BackgroundColor3={theme.palette.surface.paper} BorderSizePixel={0}>
						{hierarchy}
					</frame>
				)}
				<frame
					Position={narrow ? new UDim2() : new UDim2(0, 230, 0, 0)}
					Size={narrow ? UDim2.fromScale(1, 1) : new UDim2(1, -230, 1, 0)}
					BackgroundTransparency={1}
				>
					<frame
						Size={narrow ? new UDim2(1, 0, 0, 230) : new UDim2(0, 390, 1, 0)}
						BackgroundTransparency={1}
					>
						<frame
							Position={new UDim2(0, 12, 0, 10)}
							Size={new UDim2(1, -24, 0, narrow ? 170 : 320)}
							BackgroundTransparency={1}
						>
							<ScenePreview value={draft} />
						</frame>
						<Breadcrumbs
							items={[
								{ label: "Scene" },
								{ label: draft.group },
								{ label: draft.name },
							]}
							maxItems={3}
							sx={{ Position: new UDim2(0, 12, 0, narrow ? 188 : 344), Size: new UDim2(1, -24, 0, 28) }}
						/>
					</frame>
					<frame
						Position={narrow ? new UDim2(0, 0, 0, 230) : new UDim2(0, 390, 0, 0)}
						Size={narrow ? new UDim2(1, 0, 1, -230) : new UDim2(1, -390, 1, 0)}
						BackgroundColor3={theme.palette.surface.paper}
						BorderSizePixel={0}
					>
						<ScrollView sx={{ Size: new UDim2(1, 0, 1, -52) }}>{inspector}</ScrollView>
						<frame
							Position={new UDim2(0, 0, 1, -52)}
							Size={new UDim2(1, 0, 0, 52)}
							BackgroundColor3={theme.palette.surface.elevated}
							BorderSizePixel={0}
						>
							<uipadding
								PaddingLeft={new UDim(0, 8)}
								PaddingRight={new UDim(0, 8)}
								PaddingTop={new UDim(0, 8)}
								PaddingBottom={new UDim(0, 8)}
							/>
							<Stack direction="row" gap={1} sx={{ Size: UDim2.fromScale(1, 1) }}>
								<Button text="Apply" size="small" variant="contained" color="primary" disabled={nameFault || sizeFault} onLeftClick={apply} />
								<Button text="Reset" size="small" variant="outlined" onLeftClick={reset} />
								{!narrow && <Button text="Add tag" size="small" variant="outlined" onLeftClick={() => setTagOpen(true)} />}
								{notice.size() > 0 && <Typography text={notice} variant="caption" />}
							</Stack>
						</frame>
					</frame>
				</frame>
			</frame>
			<Drawer open={narrow && hierarchyOpen} edge="left" width={320} onClose={() => setHierarchyOpen(false)}>
				{hierarchy}
			</Drawer>
			<Menu
				anchor={menuAnchor}
				open={menuOpen}
				items={[
					{ id: "focus", text: "Focus selection" },
					{ id: "reset", text: "Reset fields" },
					{ id: "tag", text: "Add tag" },
				]}
				onSelect={(id) => {
					setMenuOpen(false);
					if (id === "reset") reset();
					if (id === "tag") setTagOpen(true);
					if (id === "focus") setNotice("Selection focused");
				}}
				onClose={() => setMenuOpen(false)}
			/>
			<Dialog
				open={tagOpen}
				title="Add tag"
				onClose={() => setTagOpen(false)}
				actions={<Button text="Add" variant="contained" color="primary" disabled={tagDraft.size() === 0} onLeftClick={addTag} />}
			>
				<Input text={tagDraft} placeholder="Tag name" onInput={setTagDraft} />
			</Dialog>
		</frame>
	);
}

export default {
	title: "Scenarios/Scene Inspector",
	description: "Responsive object hierarchy, native viewport, and datatype inspector.",
	args: { viewport: "desktop" },
	argTypes: { viewport: { type: "enum", options: ["phone", "desktop"] } },
	tags: ["scenario"],
	render: (args: Args) => <SceneInspector {...args} />,
};
