import React, { useState } from "@rbxts/react";
import { controlMetrics, Input, useTheme } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import {
	AssetField,
	BrickColorPicker,
	CFrameEditor,
	ColorPicker,
	EnumPicker,
	GradientEditor,
	NumberRangeEditor,
	PhysicalPropertiesEditor,
	RayEditor,
	RectEditor,
	useArg,
} from "./kitBreadth";

type Theme = ReturnType<typeof useTheme>["theme"];

const kit = Uiblox as unknown as {
	Checkbox: (props: { value: boolean; label?: string; onChange: (value: boolean) => void }) => React.Element;
	Select: (props: {
		value: string;
		options: { label: string; value: string }[];
		onChange: (value: string) => void;
		className?: { Size?: UDim2 };
	}) => React.Element;
	VectorEditor: (props: { value: Vector2 | Vector3; onChange: (value: Vector2 | Vector3) => void }) => React.Element;
	UDimEditor: (props: { value: UDim | UDim2; onChange: (value: UDim | UDim2) => void }) => React.Element;
	FontEditor: (props: { value: Font; onChange: (value: Font) => void }) => React.Element;
	ColorSequenceEditor: (props: { value: ColorSequence; onChange: (value: ColorSequence) => void }) => React.Element;
	NumberSequenceEditor: (props: { value: NumberSequence; onChange: (value: NumberSequence) => void }) => React.Element;
};

const AXIS_NAMES = ["X", "Y", "Z"];
const FACE_NAMES = ["Top", "Bottom", "Left", "Right", "Front", "Back"];

function attempt<T>(run: () => T): T | undefined {
	const [ok, value] = pcall(run);
	return ok ? (value as T) : undefined;
}

function enumList(enumType: string) {
	const items = new Array<EnumItem>();
	const enumObj = (Enum as unknown as { [key: string]: Enum | undefined })[enumType];
	if (enumObj !== undefined) for (const item of enumObj.GetEnumItems()) items.push(item);
	return items;
}

function enumNamed(enumType: string, name: string) {
	for (const item of enumList(enumType)) if (item.Name === name) return item;
	return undefined;
}

interface DockDraft {
	state: Enum.InitialDockState;
	enabled: boolean;
	overrideRestore: boolean;
	floatX: number;
	floatY: number;
	minWidth: number;
	minHeight: number;
}

function dockValue(draft: DockDraft) {
	const info = attempt(
		() =>
			new DockWidgetPluginGuiInfo(
				draft.state,
				draft.enabled,
				draft.overrideRestore,
				draft.floatX,
				draft.floatY,
				draft.minWidth,
				draft.minHeight,
			),
	);
	if (info === undefined) return undefined;
	return { draft, info };
}

function numberText(text: string) {
	if (text.size() === 0) return undefined;
	const value = tonumber(text);
	if (typeOf(value) !== "number" || value !== value || value === math.huge || value === -math.huge) return undefined;
	return value;
}

function regionBounds(region: Region3) {
	const center = region.CFrame.Position;
	const size = region.Size;
	return {
		min: new Vector3(center.X - size.X / 2, center.Y - size.Y / 2, center.Z - size.Z / 2),
		max: new Vector3(center.X + size.X / 2, center.Y + size.Y / 2, center.Z + size.Z / 2),
	};
}

function row(label: string, order: number, child: React.Element, theme: Theme) {
	return (
		<frame key={label} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(0.5))} SortOrder={Enum.SortOrder.LayoutOrder} />
			<textlabel
				key="Name"
				Text={label}
				LayoutOrder={1}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
			<frame key="Editor" LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				{child}
			</frame>
		</frame>
	);
}

function caption(text: string, order: number, theme: Theme) {
	return (
		<textlabel
			key={`Label-${text}`}
			Text={text}
			LayoutOrder={order}
			Size={new UDim2(1, 0, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={theme.typography.fontFamilies.default}
			TextSize={theme.typography.fontSizes.caption}
			TextColor3={theme.palette.text.secondary}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	);
}

function numberBox(label: string, order: number, value: number, theme: Theme, onCommit: (value: number) => void) {
	const commit = (text: string) => {
		const incoming = numberText(text);
		if (incoming === undefined) return;
		onCommit(incoming);
	};
	return (
		<frame key={label} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption(label, 1, theme)}
			<Input
				key="Value"
				{...({
					variant: "standard",
					width: new UDim(1, 0),
					text: tostring(value),
					onInput: commit,
					onTextChanged: commit,
				} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
			/>
		</frame>
	);
}

function enumSelect(label: string, order: number, enumType: string, value: string, theme: Theme, fill: { Size: UDim2 }, onCommit: (value: string) => void) {
	const options = new Array<{ label: string; value: string }>();
	for (const item of enumList(enumType)) options.push({ label: item.Name, value: item.Name });
	return (
		<frame key={label} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption(label, 1, theme)}
			<kit.Select key="Value" value={value} options={options} className={fill} onChange={onCommit} />
		</frame>
	);
}

function pairRow(order: number, left: React.Element, right: React.Element, theme: Theme) {
	const gap = theme.padding.calc(1);
	return (
		<frame key={`Pair-${order}`} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, gap)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame key="L" LayoutOrder={1} Size={new UDim2(0.5, -gap / 2, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				{left}
			</frame>
			<frame key="R" LayoutOrder={2} Size={new UDim2(0.5, -gap / 2, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				{right}
			</frame>
		</frame>
	);
}

function flagGroup(title: string, order: number, names: Array<string>, flags: { [key: string]: boolean }, theme: Theme, onToggle: (name: string, on: boolean) => void) {
	const boxes = new Array<React.Element>();
	for (const name of names) {
		boxes.push(<kit.Checkbox key={name} value={flags[name] === true} label={name} onChange={(on) => onToggle(name, on)} />);
	}
	return (
		<frame key={title} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(0.5))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption(title, 1, theme)}
			<frame key="Flags" LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(0.5))} SortOrder={Enum.SortOrder.LayoutOrder} />
				{boxes}
			</frame>
		</frame>
	);
}

function flagsOf(value: unknown, names: Array<string>) {
	const flags: { [key: string]: boolean } = {};
	const record = value as { [key: string]: boolean };
	for (const name of names) flags[name] = record[name] === true;
	return flags;
}

function Gallery() {
	const { theme } = useTheme();
	const gap = new UDim(0, theme.spacing.calc(1));
	const fill = { Size: new UDim2(1, 0, 0, controlMetrics(theme.density).height) };
	const [paint, setPaint] = useArg(new Color3(0.2, 0.4, 0.6));
	const [brick, setBrick] = useArg(new BrickColor(23));
	const [shift, setShift] = useArg(new Vector2(4, 5));
	const [place, setPlace] = useArg(new Vector3(1, 2, 3));
	const [gapU, setGapU] = useArg(new UDim(0.5, 8));
	const [span, setSpan] = useArg(new UDim2(0.5, 1, 1, -2));
	const [font, setFont] = useArg(Enum.Font.SourceSans as EnumItem);
	const [face, setFace] = useArg(Font.fromEnum(Enum.Font.Gotham));
	const [gradient, setGradient] = useArg(
		new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(255, 80, 80)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(80, 120, 255)),
		]),
	);
	const [fade, setFade] = useArg(new NumberSequence([new NumberSequenceKeypoint(0, 0), new NumberSequenceKeypoint(1, 1)]));
	const [icon, setIcon] = useArg("123");
	const [origin, setOrigin] = useArg(new CFrame(0, 1, 0));
	const [bounds, setBounds] = useArg(new Rect(0, 0, 100, 50));
	const [spanRange, setSpanRange] = useArg(new NumberRange(0.25, 0.75));
	const [beam, setBeam] = useArg(new Ray(new Vector3(0, 1, 0), new Vector3(0, 0, -1)));
	const [material, setMaterial] = useArg(new PhysicalProperties(0.7, 0.3, 0.5));
	const [wash, setWash] = useArg({
		color: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(255, 80, 80)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(80, 120, 255)),
		]),
		transparency: new NumberSequence(0),
		rotation: 45,
		offset: new Vector2(0, 0),
		enabled: true,
	});
	const [region, setRegion] = useState(new Region3(new Vector3(0, 0, 0), new Vector3(4, 2, 4)));
	const [cells, setCells] = useState(new Region3int16(new Vector3int16(0, 0, 0), new Vector3int16(4, 2, 4)));
	const [nudge, setNudge] = useState(new Vector2int16(1, -2));
	const [step, setStep] = useState(new Vector3int16(1, 2, 3));
	const [spin, setSpin] = useState(new Axes(Enum.Axis.X, Enum.NormalId.Top));
	const [sides, setSides] = useState(new Faces(Enum.NormalId.Front, Enum.NormalId.Back));
	const [when, setWhen] = useState(DateTime.fromUnixTimestamp(0));
	const [ease, setEase] = useState(new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 1, false, 0));
	const [dock, setDock] = useState(
		() =>
			dockValue({
				state: Enum.InitialDockState.Right,
				enabled: true,
				overrideRestore: false,
				floatX: 200,
				floatY: 200,
				minWidth: 100,
				minHeight: 80,
			})!,
	);
	const [point, setPoint] = useState(new PathWaypoint(new Vector3(1, 2, 3), Enum.PathWaypointAction.Walk, "lane"));
	const applyDock = (patch: Partial<DockDraft>) => {
		const built = dockValue({
			state: patch.state ?? dock.draft.state,
			enabled: patch.enabled ?? dock.draft.enabled,
			overrideRestore: patch.overrideRestore ?? dock.draft.overrideRestore,
			floatX: patch.floatX ?? dock.draft.floatX,
			floatY: patch.floatY ?? dock.draft.floatY,
			minWidth: patch.minWidth ?? dock.draft.minWidth,
			minHeight: patch.minHeight ?? dock.draft.minHeight,
		});
		if (built !== undefined) setDock(built);
	};

	const bounds3 = regionBounds(region);
	const axisFlags = flagsOf(spin, [...AXIS_NAMES, ...FACE_NAMES]);
	const faceFlags = flagsOf(sides, FACE_NAMES);

	let order = 1;
	const rows = new Array<React.Element>();
	const push = (label: string, child: React.Element) => {
		rows.push(row(label, order, child, theme));
		order += 1;
	};

	push("Color", <ColorPicker value={paint} onChange={setPaint} />);
	push("BrickColor", <BrickColorPicker value={brick} onChange={setBrick} />);
	push("Vector2", <kit.VectorEditor value={shift} onChange={(v) => setShift(v as Vector2)} />);
	push("Vector3", <kit.VectorEditor value={place} onChange={(v) => setPlace(v as Vector3)} />);
	push("UDim", <kit.UDimEditor value={gapU} onChange={(v) => setGapU(v as UDim)} />);
	push("UDim2", <kit.UDimEditor value={span} onChange={(v) => setSpan(v as UDim2)} />);
	push("Enum.Font", <EnumPicker value={font} items={[...Enum.Font.GetEnumItems()]} onChange={setFont} />);
	push("Font", <kit.FontEditor value={face} onChange={setFace} />);
	push("ColorSequence", <kit.ColorSequenceEditor value={gradient} onChange={setGradient} />);
	push("NumberSequence", <kit.NumberSequenceEditor value={fade} onChange={setFade} />);
	push("Asset", <AssetField value={icon} onChange={setIcon} />);
	push("CFrame", <CFrameEditor value={origin} onChange={setOrigin} />);
	push("Rect", <RectEditor value={bounds} onChange={setBounds} />);
	push("NumberRange", <NumberRangeEditor value={spanRange} onChange={setSpanRange} />);
	push("Ray", <RayEditor value={beam} onChange={setBeam} />);
	push("PhysicalProperties", <PhysicalPropertiesEditor value={material} onChange={setMaterial} />);
	push("Gradient", <GradientEditor value={wash} onChange={setWash} />);

	push(
		"Region3",
		<frame key="region3" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption("Min", 1, theme)}
			<kit.VectorEditor
				key="Min"
				value={bounds3.min}
				onChange={(incoming) => {
					const built = attempt(() => new Region3(incoming as Vector3, bounds3.max));
					if (built !== undefined) setRegion(built);
				}}
			/>
			{caption("Max", 3, theme)}
			<kit.VectorEditor
				key="Max"
				value={bounds3.max}
				onChange={(incoming) => {
					const built = attempt(() => new Region3(bounds3.min, incoming as Vector3));
					if (built !== undefined) setRegion(built);
				}}
			/>
		</frame>,
	);

	push(
		"Region3int16",
		<frame key="region3int16" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption("Min", 1, theme)}
			<kit.VectorEditor
				key="Min"
				value={new Vector3(cells.Min.X, cells.Min.Y, cells.Min.Z)}
				onChange={(incoming) => {
					const v = incoming as Vector3;
					const min = attempt(() => new Vector3int16(math.round(v.X), math.round(v.Y), math.round(v.Z)));
					const built = min !== undefined ? attempt(() => new Region3int16(min, cells.Max)) : undefined;
					if (built !== undefined) setCells(built);
				}}
			/>
			{caption("Max", 3, theme)}
			<kit.VectorEditor
				key="Max"
				value={new Vector3(cells.Max.X, cells.Max.Y, cells.Max.Z)}
				onChange={(incoming) => {
					const v = incoming as Vector3;
					const max = attempt(() => new Vector3int16(math.round(v.X), math.round(v.Y), math.round(v.Z)));
					const built = max !== undefined ? attempt(() => new Region3int16(cells.Min, max)) : undefined;
					if (built !== undefined) setCells(built);
				}}
			/>
		</frame>,
	);

	push(
		"Vector2int16",
		<kit.VectorEditor
			value={new Vector2(nudge.X, nudge.Y)}
			onChange={(incoming) => {
				const v = incoming as Vector2;
				const built = attempt(() => new Vector2int16(math.round(v.X), math.round(v.Y)));
				if (built !== undefined) setNudge(built);
			}}
		/>,
	);
	push(
		"Vector3int16",
		<kit.VectorEditor
			value={new Vector3(step.X, step.Y, step.Z)}
			onChange={(incoming) => {
				const v = incoming as Vector3;
				const built = attempt(() => new Vector3int16(math.round(v.X), math.round(v.Y), math.round(v.Z)));
				if (built !== undefined) setStep(built);
			}}
		/>,
	);

	push(
		"Axes",
		<frame key="axes" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{flagGroup("Axes", 1, AXIS_NAMES, axisFlags, theme, (name, on) => {
				const nextFlags = { ...axisFlags, [name]: on };
				const picked = new Array<Enum.Axis | Enum.NormalId>();
				for (const axis of AXIS_NAMES) if (nextFlags[axis]) picked.push(enumNamed("Axis", axis) as Enum.Axis);
				for (const faceName of FACE_NAMES) if (nextFlags[faceName]) picked.push(enumNamed("NormalId", faceName) as Enum.NormalId);
				const built = attempt(() => new Axes(...picked));
				if (built !== undefined) setSpin(built);
			})}
			{flagGroup("Faces", 2, FACE_NAMES, axisFlags, theme, (name, on) => {
				const nextFlags = { ...axisFlags, [name]: on };
				const picked = new Array<Enum.Axis | Enum.NormalId>();
				for (const axis of AXIS_NAMES) if (nextFlags[axis]) picked.push(enumNamed("Axis", axis) as Enum.Axis);
				for (const faceName of FACE_NAMES) if (nextFlags[faceName]) picked.push(enumNamed("NormalId", faceName) as Enum.NormalId);
				const built = attempt(() => new Axes(...picked));
				if (built !== undefined) setSpin(built);
			})}
		</frame>,
	);

	push(
		"Faces",
		flagGroup("Faces", 1, FACE_NAMES, faceFlags, theme, (name, on) => {
			const nextFlags = { ...faceFlags, [name]: on };
			const picked = new Array<Enum.NormalId>();
			for (const faceName of FACE_NAMES) if (nextFlags[faceName]) picked.push(enumNamed("NormalId", faceName) as Enum.NormalId);
			const built = attempt(() => new Faces(...picked));
			if (built !== undefined) setSides(built);
		}),
	);

	push(
		"DateTime",
		<frame key="dateTime" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(0.5))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{numberBox("Unix", 1, when.UnixTimestamp, theme, (incoming) => {
				const date = attempt(() => DateTime.fromUnixTimestamp(math.round(incoming)));
				if (date !== undefined) setWhen(date);
			})}
			{caption(when.ToIsoDate(), 2, theme)}
		</frame>,
	);

	push(
		"TweenInfo",
		<frame key="tweenInfo" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{pairRow(
				1,
				numberBox("Time", 1, ease.Time, theme, (incoming) => {
					const built = attempt(
						() => new TweenInfo(incoming, ease.EasingStyle, ease.EasingDirection, ease.RepeatCount, ease.Reverses, ease.DelayTime),
					);
					if (built !== undefined) setEase(built);
				}),
				numberBox("Delay", 1, ease.DelayTime, theme, (incoming) => {
					const built = attempt(() => new TweenInfo(ease.Time, ease.EasingStyle, ease.EasingDirection, ease.RepeatCount, ease.Reverses, incoming));
					if (built !== undefined) setEase(built);
				}),
				theme,
			)}
			{enumSelect("EasingStyle", 2, "EasingStyle", ease.EasingStyle.Name, theme, fill, (incoming) => {
				const style = enumNamed("EasingStyle", incoming) as Enum.EasingStyle;
				const built = attempt(() => new TweenInfo(ease.Time, style, ease.EasingDirection, ease.RepeatCount, ease.Reverses, ease.DelayTime));
				if (built !== undefined) setEase(built);
			})}
			{enumSelect("EasingDirection", 3, "EasingDirection", ease.EasingDirection.Name, theme, fill, (incoming) => {
				const direction = enumNamed("EasingDirection", incoming) as Enum.EasingDirection;
				const built = attempt(() => new TweenInfo(ease.Time, ease.EasingStyle, direction, ease.RepeatCount, ease.Reverses, ease.DelayTime));
				if (built !== undefined) setEase(built);
			})}
			{pairRow(
				4,
				numberBox("Repeat", 1, ease.RepeatCount, theme, (incoming) => {
					const built = attempt(
						() => new TweenInfo(ease.Time, ease.EasingStyle, ease.EasingDirection, math.round(incoming), ease.Reverses, ease.DelayTime),
					);
					if (built !== undefined) setEase(built);
				}),
				<frame key="ReversesWrap" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					{caption(" ", 1, theme)}
					<kit.Checkbox
						key="Reverses"
						value={ease.Reverses}
						label="Reverses"
						onChange={(on) => {
							const built = attempt(() => new TweenInfo(ease.Time, ease.EasingStyle, ease.EasingDirection, ease.RepeatCount, on, ease.DelayTime));
							if (built !== undefined) setEase(built);
						}}
					/>
				</frame>,
				theme,
			)}
		</frame>,
	);

	push(
		"DockWidget",
		<frame key="dockWidget" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{enumSelect("Dock", 1, "InitialDockState", dock.draft.state.Name, theme, fill, (incoming) => {
				const state = enumNamed("InitialDockState", incoming) as Enum.InitialDockState;
				applyDock({ state });
			})}
			<kit.Checkbox key="Enabled" value={dock.draft.enabled} label="Enabled" onChange={(on) => applyDock({ enabled: on })} />
			<kit.Checkbox
				key="Override"
				value={dock.draft.overrideRestore}
				label="Override restore"
				onChange={(on) => applyDock({ overrideRestore: on })}
			/>
			{pairRow(
				4,
				numberBox("Float X", 1, dock.draft.floatX, theme, (incoming) => applyDock({ floatX: incoming })),
				numberBox("Float Y", 1, dock.draft.floatY, theme, (incoming) => applyDock({ floatY: incoming })),
				theme,
			)}
			{pairRow(
				5,
				numberBox("Min width", 1, dock.draft.minWidth, theme, (incoming) => applyDock({ minWidth: incoming })),
				numberBox("Min height", 1, dock.draft.minHeight, theme, (incoming) => applyDock({ minHeight: incoming })),
				theme,
			)}
		</frame>,
	);

	push(
		"PathWaypoint",
		<frame key="pathWaypoint" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption("Position", 1, theme)}
			<kit.VectorEditor
				key="Position"
				value={point.Position}
				onChange={(incoming) => {
					const built = attempt(() => new PathWaypoint(incoming as Vector3, point.Action, point.Label));
					if (built !== undefined) setPoint(built);
				}}
			/>
			{enumSelect("Action", 3, "PathWaypointAction", point.Action.Name, theme, fill, (incoming) => {
				const action = enumNamed("PathWaypointAction", incoming) as Enum.PathWaypointAction;
				const built = attempt(() => new PathWaypoint(point.Position, action, point.Label));
				if (built !== undefined) setPoint(built);
			})}
			<frame key="Label" LayoutOrder={4} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
				{caption("Label", 1, theme)}
				<Input
					key="Value"
					{...({
						variant: "standard",
						width: new UDim(1, 0),
						text: point.Label,
						onInput: (text: string) => {
							const built = attempt(() => new PathWaypoint(point.Position, point.Action, text));
							if (built !== undefined) setPoint(built);
						},
						onTextChanged: (text: string) => {
							const built = attempt(() => new PathWaypoint(point.Position, point.Action, text));
							if (built !== undefined) setPoint(built);
						},
					} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
				/>
			</frame>
		</frame>,
	);

	return (
		<scrollingframe
			key="Gallery"
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={theme.palette.surface.paper}
			BorderSizePixel={0}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollingDirection={Enum.ScrollingDirection.Y}
			ScrollBarThickness={theme.spacing.calc(0.5)}
			ScrollBarImageTransparency={0.75}
			ClipsDescendants={true}
		>
			<uipadding PaddingTop={gap} PaddingBottom={gap} PaddingLeft={gap} PaddingRight={gap} />
			<uilistlayout Padding={gap} SortOrder={Enum.SortOrder.LayoutOrder} />
			<textlabel
				key="Title"
				Text="Control types"
				LayoutOrder={0}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
			{rows}
		</scrollingframe>
	);
}

export default {
	title: "Controls/Gallery",
	description: "Dev-only viewport gallery for datatype editors.",
	preview: { kind: "gui", width: 320, height: 320 },
	render: () => <Gallery />,
};
