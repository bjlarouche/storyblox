import React, { useEffect, useRef, useState } from "@rbxts/react";
import { controlMetrics, Input, Theme } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { formatDatatype, parseDatatype } from "packages/argCodec";
import {
	insertItem,
	mountControlEditor,
	moveItem,
	controlFaultPath,
	patchField,
	describeReadonly,
	removeItem,
	switchUnion,
} from "packages/nestedArgs";
import { useDragScroll } from "../../scroll";
import {
	ArgValues,
	assetId,
	assetText,
	choiceOptions,
	commitNumberText,
	enumItemOptions,
	enumItems,
} from "../storyArgs";
import { argHint } from "../storyLabel";
import SafeBoundary from "./SafeBoundary";
import { valueFieldKind, valueFields } from "../valueFields";

interface Spec {
	type?: string;
	options?: string[];
	control?: string;
	min?: number;
	max?: number;
	step?: number;
	optional?: boolean;
	disabled?: boolean;
	enumType?: string;
	fields?: { [key: string]: Spec };
	item?: Spec;
	items?: Spec[];
	tag?: string;
	variants?: { [key: string]: { [key: string]: Spec } };
	editor?: string;
	description?: string;
}

const kit = Uiblox as unknown as {
	Checkbox: (props: {
		value: boolean;
		mixed?: boolean;
		label?: string;
		disabled?: boolean;
		onChange: (value: boolean) => void;
	}) => React.Element;
	Switch: (props: {
		value: boolean;
		label?: string;
		disabled?: boolean;
		onChange: (value: boolean) => void;
	}) => React.Element;
	NumberInput: (props: {
		value: number;
		onChange: (value: number) => void;
		width?: UDim;
		disabled?: boolean;
	}) => React.Element;
	Select: (props: {
		value: string;
		options: { label: string; value: string }[];
		onChange: (value: string) => void;
		className?: { Size?: UDim2 };
		disabled?: boolean;
	}) => React.Element;
	RadioGroup: (props: {
		value: string;
		options: { label: string; value: string }[];
		onChange: (value: string) => void;
		disabled?: boolean;
	}) => React.Element;
	Slider: (props: {
		value: number;
		min: number;
		max: number;
		step?: number;
		disabled?: boolean;
		onChange: (value: number) => void;
	}) => React.Element;
	ColorPicker: (props: {
		value: Color3;
		onChange: (value: Color3) => void;
		disabled?: boolean;
	}) => React.Element;
	BrickColorPicker: (props: {
		value: BrickColor;
		onChange: (value: BrickColor) => void;
		disabled?: boolean;
	}) => React.Element;
	VectorEditor: (props: {
		value: Vector2 | Vector3;
		onChange: (value: Vector2 | Vector3) => void;
		disabled?: boolean;
	}) => React.Element;
	UDimEditor: (props: {
		value: UDim | UDim2;
		onChange: (value: UDim | UDim2) => void;
		disabled?: boolean;
	}) => React.Element;
	FontEditor: (props: { value: Font; onChange: (value: Font) => void; disabled?: boolean }) => React.Element;
	ColorSequenceEditor: (props: {
		value: ColorSequence;
		onChange: (value: ColorSequence) => void;
		disabled?: boolean;
	}) => React.Element;
	NumberSequenceEditor: (props: {
		value: NumberSequence;
		onChange: (value: NumberSequence) => void;
		disabled?: boolean;
	}) => React.Element;
	CFrameEditor: (props: { value: CFrame; onChange: (value: CFrame) => void; disabled?: boolean }) => React.Element;
	RectEditor: (props: { value: Rect; onChange: (value: Rect) => void; disabled?: boolean }) => React.Element;
	NumberRangeEditor: (props: {
		value: NumberRange;
		onChange: (value: NumberRange) => void;
		disabled?: boolean;
	}) => React.Element;
	RayEditor: (props: { value: Ray; onChange: (value: Ray) => void; disabled?: boolean }) => React.Element;
	PhysicalPropertiesEditor: (props: {
		value: PhysicalProperties;
		onChange: (value: PhysicalProperties) => void;
		disabled?: boolean;
	}) => React.Element;
	GradientEditor: (props: {
		value: {
			color: ColorSequence;
			transparency: NumberSequence;
			rotation: number;
			offset: Vector2;
			enabled: boolean;
		};
		onChange: (value: {
			color: ColorSequence;
			transparency: NumberSequence;
			rotation: number;
			offset: Vector2;
			enabled: boolean;
		}) => void;
		disabled?: boolean;
	}) => React.Element;
	AssetField: (props: {
		value: string;
		onChange: (value: string) => void;
		disabled?: boolean;
	}) => React.Element;
	EnumPicker: (props: {
		value: EnumItem;
		items: EnumItem[];
		onChange: (value: EnumItem) => void;
		disabled?: boolean;
	}) => React.Element;
};

export interface ControlsProps {
	theme: Theme;
	args: ArgValues;
	argTypes?: unknown;
	defaults?: unknown;
	description?: unknown;
	resetKey?: string;
	onChange: (key: string, value: unknown) => void;
	onReset: () => void;
}

function writeFault(current: { [key: string]: string }, key: string, reason: string) {
	const updated: { [key: string]: string } = {};
	for (const [name, value] of pairs(current)) {
		if (name !== key) updated[name as string] = value;
	}
	if (reason.size() > 0) updated[key] = reason;
	return updated;
}

function datatype(kind?: string) {
	return (
		kind === "EnumItem" ||
		kind === "asset" ||
		kind === "cframe" ||
		kind === "rect" ||
		kind === "numberRange" ||
		kind === "ray" ||
		kind === "physicalProperties"
	);
}

function hasKit(
	name:
		| "ColorPicker"
		| "BrickColorPicker"
		| "VectorEditor"
		| "UDimEditor"
		| "FontEditor"
		| "ColorSequenceEditor"
		| "NumberSequenceEditor"
		| "CFrameEditor"
		| "RectEditor"
		| "NumberRangeEditor"
		| "RayEditor"
		| "PhysicalPropertiesEditor"
		| "GradientEditor"
		| "AssetField"
		| "EnumPicker",
) {
	return typeOf((Uiblox as unknown as { [key: string]: unknown })[name]) === "function";
}

function defaultGradient() {
	return {
		color: new ColorSequence(new Color3(1, 1, 1)),
		transparency: new NumberSequence(0),
		rotation: 0,
		offset: new Vector2(),
		enabled: true,
	};
}

let rowSerial = 0;

function freshKey(name: string) {
	rowSerial += 1;
	return `${name}-${rowSerial}`;
}

function blankValue(spec?: Spec): defined {
	const kind = spec?.type;
	if (kind === "number") return 0;
	if (kind === "boolean") return false;
	if (kind === "array" || kind === "tuple") return [] as unknown as defined;
	if (kind === "object" || kind === "dictionary") return {} as unknown as defined;
	return "" as defined;
}

function CustomEditor(props: { editor: string; value: unknown; onChange: (value: unknown) => void }) {
	const host = useRef<Frame>();
	const change = useRef(props.onChange);
	change.current = props.onChange;
	useEffect(() => {
		return mountControlEditor(props.editor, props.value, (incoming) => change.current(incoming));
	}, [props.editor, props.value]);
	return <frame ref={host} Size={new UDim2(1, 0, 0, 22)} BackgroundTransparency={1} />;
}

function Controls({ theme, args, argTypes, defaults, description, resetKey = "", onChange, onReset }: ControlsProps) {
	const [faults, setFaults] = useState<{ [key: string]: string }>({});
	const [rowKeys, setRowKeys] = useState<{ [key: string]: Array<string> }>({});
	const [listFrame, setListFrame] = useState<ScrollingFrame>();
	const drag = useDragScroll(listFrame);
	const click = (action: () => void) => () => {
		if (drag.suppressClick()) return;
		action();
	};
	const specs = typeOf(argTypes) === "table" ? (argTypes as { [key: string]: Spec }) : {};
	const fallbacks = typeOf(defaults) === "table" ? (defaults as ArgValues) : {};
	const row = controlMetrics(theme.density).height;
	const fill = { Size: new UDim2(1, 0, 0, row) };
	const gap = new UDim(0, theme.padding.calc(1));
	const rows: React.Element[] = [];
	if (typeOf(description) === "string") {
		rows.push(
			<textlabel
				key="StoryDescription"
				Text={description as string}
				LayoutOrder={-1}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				TextWrapped={true}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.secondary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>,
		);
	}
	let order = 1;
	const controlEditor = (
		path: string,
		spec: Spec | undefined,
		value: unknown,
		commit: (incoming: unknown) => void,
	): React.Element | undefined => {
		const name = path;
		const options = spec?.type === "EnumItem" ? enumItemOptions(spec?.enumType, spec?.options) : choiceOptions(spec?.options);
		const commitNumber = (incoming: unknown) => {
			const committed = commitNumberText(tostring(incoming));
			if (committed !== undefined) commit(committed);
		};
		let editor: React.Element | undefined;
		const nestedField = (
			label: string,
			childPath: string,
			childSpec: Spec | undefined,
			childValue: unknown,
			childCommit: (incoming: unknown) => void,
		) => (
			<frame key={label} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={gap} SortOrder={Enum.SortOrder.LayoutOrder} />
				<textlabel
					key="Name"
					Text={label}
					LayoutOrder={1}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.secondary}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
				<frame key="Editor" LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					{controlEditor(childPath, childSpec, childValue, childCommit)}
				</frame>
				{faults[childPath] !== undefined && faults[childPath].size() > 0 && (
					<textlabel
						key="Fault"
						Text={faults[childPath]}
						LayoutOrder={3}
						Size={new UDim2(1, 0, 0, 0)}
						AutomaticSize={Enum.AutomaticSize.Y}
						TextWrapped={true}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.default}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.status.error.main}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				)}
				{childSpec?.optional === true && childValue !== undefined && (
					<textbutton
						key="Clear"
						Text="Clear"
						LayoutOrder={4}
						AutomaticSize={Enum.AutomaticSize.X}
						Size={new UDim2(0, 0, 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: click(() => {
								setFaults((current) => writeFault(current, childPath, ""));
								childCommit(undefined);
							}),
						}}
					/>
				)}
			</frame>
		);
		if (spec?.type === "boolean" && spec.control === "switch") {
			editor = (
				<kit.Switch
					key={name}
					value={value === true}
					disabled={spec.disabled === true}
					onChange={(incoming) => commit(incoming)}
				/>
			);
		} else if (spec?.type === "boolean") {
			editor = (
				<kit.Checkbox
					key={name}
					value={value === true}
					mixed={spec.optional === true && value === undefined}
					disabled={spec.disabled === true}
					onChange={(incoming) => commit(incoming)}
				/>
			);
		} else if (spec?.type === "number" && spec.control === "slider") {
			const min = spec.min ?? 0;
			const max = spec.max ?? min;
			editor = (
				<kit.Slider
					key={name}
					value={typeOf(value) === "number" ? (value as number) : min}
					min={min}
					max={max}
					step={spec.step}
					disabled={spec.disabled === true}
					onChange={commitNumber}
				/>
			);
		} else if (spec?.type === "number" && typeOf(value) === "number") {
			editor = (
				<kit.NumberInput
					key={name}
					value={value as number}
					width={new UDim(1, 0)}
					disabled={spec.disabled === true}
					onChange={commitNumber}
				/>
			);
		} else if (spec?.type === "number") {
			editor = (
				<Input
					key={name}
					{...({
						variant: "standard",
						width: new UDim(1, 0),
						text: "",
						placeholder: "number",
						disabled: spec.disabled === true,
						onInput: (text: string) => commitNumber(text),
						onTextChanged: (text: string) => commitNumber(text),
					} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
				/>
			);
		} else if (spec?.type === "enum" && spec.control === "radio") {
			editor = (
				<kit.RadioGroup
					key={name}
					value={typeOf(value) === "string" ? (value as string) : ""}
					options={options}
					disabled={spec.disabled === true}
					onChange={(incoming) => commit(incoming)}
				/>
			);
		} else if (spec?.type === "enum") {
			editor = (
				<kit.Select
					key={name}
					value={typeOf(value) === "string" ? (value as string) : ""}
					options={options}
					className={fill}
					disabled={spec.disabled === true}
					onChange={(incoming) => commit(incoming)}
				/>
			);
		} else if (spec?.type === "color" && hasKit("ColorPicker")) {
			const color = typeOf(value) === "Color3" ? (value as Color3) : new Color3();
			editor = (
				<kit.ColorPicker
					key={name}
					value={color}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "brickColor" && hasKit("BrickColorPicker")) {
			const brick = typeOf(value) === "BrickColor" ? (value as BrickColor) : new BrickColor(194);
			editor = (
				<kit.BrickColorPicker
					key={name}
					value={brick}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if ((spec?.type === "vector2" || spec?.type === "vector3") && hasKit("VectorEditor")) {
			const vector =
				spec.type === "vector3"
					? typeOf(value) === "Vector3"
						? (value as Vector3)
						: new Vector3()
					: typeOf(value) === "Vector2"
						? (value as Vector2)
						: new Vector2();
			editor = (
				<kit.VectorEditor
					key={name}
					value={vector}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "font" && hasKit("FontEditor")) {
			const face = typeOf(value) === "Font" ? (value as Font) : Font.fromEnum(Enum.Font.SourceSans);
			editor = (
				<kit.FontEditor
					key={name}
					value={face}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "colorSequence" && hasKit("ColorSequenceEditor")) {
			const sequence =
				typeOf(value) === "ColorSequence" ? (value as ColorSequence) : new ColorSequence(new Color3(1, 1, 1));
			editor = (
				<kit.ColorSequenceEditor
					key={name}
					value={sequence}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "numberSequence" && hasKit("NumberSequenceEditor")) {
			const sequence =
				typeOf(value) === "NumberSequence" ? (value as NumberSequence) : new NumberSequence(0, 1);
			editor = (
				<kit.NumberSequenceEditor
					key={name}
					value={sequence}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if ((spec?.type === "udim" || spec?.type === "udim2") && hasKit("UDimEditor")) {
			const dim =
				spec.type === "udim2"
					? typeOf(value) === "UDim2"
						? (value as UDim2)
						: new UDim2()
					: typeOf(value) === "UDim"
						? (value as UDim)
						: new UDim();
			editor = (
				<kit.UDimEditor
					key={name}
					value={dim}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "cframe" && hasKit("CFrameEditor")) {
			const frame = typeOf(value) === "CFrame" ? (value as CFrame) : new CFrame();
			editor = (
				<kit.CFrameEditor
					key={name}
					value={frame}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "rect" && hasKit("RectEditor")) {
			const rect = typeOf(value) === "Rect" ? (value as Rect) : new Rect();
			editor = (
				<kit.RectEditor
					key={name}
					value={rect}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "numberRange" && hasKit("NumberRangeEditor")) {
			const range = typeOf(value) === "NumberRange" ? (value as NumberRange) : new NumberRange(0, 1);
			editor = (
				<kit.NumberRangeEditor
					key={name}
					value={range}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "ray" && hasKit("RayEditor")) {
			const ray =
				typeOf(value) === "Ray" ? (value as Ray) : new Ray(new Vector3(), new Vector3(0, 0, -1));
			editor = (
				<kit.RayEditor
					key={name}
					value={ray}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "physicalProperties" && hasKit("PhysicalPropertiesEditor")) {
			const props =
				typeOf(value) === "PhysicalProperties"
					? (value as PhysicalProperties)
					: new PhysicalProperties(0.7, 0.3, 0.5);
			editor = (
				<kit.PhysicalPropertiesEditor
					key={name}
					value={props}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "gradient" && hasKit("GradientEditor")) {
			const gradient =
				typeOf(value) === "table" && typeOf((value as { color?: unknown }).color) === "ColorSequence"
					? (value as {
							color: ColorSequence;
							transparency: NumberSequence;
							rotation: number;
							offset: Vector2;
							enabled: boolean;
						})
					: defaultGradient();
			editor = (
				<kit.GradientEditor
					key={name}
					value={gradient}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						setFaults((current) => writeFault(current, name, ""));
						commit(incoming);
					}}
				/>
			);
		} else if (spec?.type === "asset" && hasKit("AssetField")) {
			editor = (
				<kit.AssetField
					key={name}
					value={assetText(value)}
					disabled={spec.disabled === true}
					onChange={(incoming) => {
						const id = assetId(incoming);
						if (id === undefined) {
							setFaults((current) => writeFault(current, name, "asset"));
							return;
						}
						setFaults((current) => writeFault(current, name, ""));
						commit(id);
					}}
				/>
			);
		} else if (spec?.type === "EnumItem" && hasKit("EnumPicker")) {
			const items = enumItems(spec.enumType, spec.options);
			if (items.size() > 0) {
				const selected = typeOf(value) === "EnumItem" ? (value as EnumItem) : items[0];
				editor = (
					<kit.EnumPicker
						key={name}
						value={selected}
						items={items}
						disabled={spec.disabled === true}
						onChange={(incoming) => {
							setFaults((current) => writeFault(current, name, ""));
							commit(incoming);
						}}
					/>
				);
			}
		}
		if (editor === undefined && valueFieldKind(spec?.type)) {
			const fields = valueFields({
				theme,
				kind: spec?.type ?? "",
				value,
				disabled: spec?.disabled === true,
				onCommit: (incoming) => {
					setFaults((current) => writeFault(current, name, ""));
					commit(incoming);
				},
				onFault: (reason) => setFaults((current) => writeFault(current, name, reason)),
			});
			if (fields !== undefined) editor = fields;
		}
		if (editor === undefined && (
			datatype(spec?.type) ||
			valueFieldKind(spec?.type) ||
			spec?.type === "color" ||
			spec?.type === "brickColor" ||
			spec?.type === "vector2" ||
			spec?.type === "vector3" ||
			spec?.type === "udim" ||
			spec?.type === "udim2" ||
			spec?.type === "font" ||
			spec?.type === "colorSequence" ||
			spec?.type === "numberSequence" ||
			spec?.type === "rect" ||
			spec?.type === "numberRange" ||
			spec?.type === "ray" ||
			spec?.type === "physicalProperties"
		)) {
			const commitText = (text: string) => {
				const parsed = parseDatatype(spec ?? {}, text);
				if (!parsed.ok) {
					setFaults((current) => writeFault(current, name, parsed.reason));
					return;
				}
				setFaults((current) => writeFault(current, name, ""));
				commit(parsed.value);
			};
			if (spec?.type === "EnumItem" && options.size() > 0) {
				const selected = typeOf(value) === "EnumItem" ? (value as { Name: string }).Name : "";
				editor = (
					<kit.Select key={name} value={selected} options={options} className={fill} onChange={(incoming) => commitText(incoming)} />
				);
			} else {
				editor = (
					<Input
						key={name}
						{...({
							variant: "standard",
							width: new UDim(1, 0),
							text: formatDatatype(value),
							placeholder: spec?.type,
							onInput: commitText,
							onTextChanged: commitText,
						} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
					/>
				);
			}
		} else if (editor === undefined && spec?.type === "readonly") {
			editor = (
				<textlabel
					key={name}
					Text={describeReadonly(value)}
					Size={new UDim2(1, 0, 0, theme.spacing.calc(1))}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.secondary}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			);
		} else if (editor === undefined && spec?.type === "custom") {
			editor = <CustomEditor key={name} editor={spec.editor ?? ""} value={value} onChange={(incoming) => commit(incoming)} />;
		} else if (editor === undefined && spec?.type === "array") {
			const items = (typeOf(value) === "table" ? value : []) as Array<defined>;
			let keys = rowKeys[name];
			if (keys === undefined || keys.size() !== items.size()) {
				const aligned: Array<string> = [];
				for (let index = 0; index < items.size(); index++) {
					const existing = keys !== undefined ? keys[index] : undefined;
					aligned.push(existing !== undefined ? existing : freshKey(name));
				}
				keys = aligned;
				setRowKeys((current) => patchField(current, name, aligned) as { [key: string]: Array<string> });
			}
			const itemRows: Array<React.Element> = [];
			for (let index = 0; index < items.size(); index++) {
				const rowKey = keys[index];
				const childPath = controlFaultPath(name, tostring(index));
				itemRows.push(
					<frame key={rowKey} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
						{nestedField(tostring(index), childPath, spec.item, items[index], (incoming) => {
							if (incoming === undefined) {
								commit(removeItem(items, index));
								return;
							}
							commit(insertItem(removeItem(items, index), index, incoming as defined));
						})}
					</frame>,
				);
			}
			editor = (
				<frame key={name} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} />
					<>
						{itemRows}
					</>
					<textbutton
						key="Up"
						Text="Up"
						Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: click(() => {
								const last = items.size() - 1;
								if (last < 1) return;
								commit(moveItem(items, last, last - 1));
								setRowKeys((current) => patchField(current, name, moveItem(keys, last, last - 1)) as { [key: string]: Array<string> });
							}),
						}}
					/>
					<textbutton
						key="Delete"
						Text="Delete"
						Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: click(() => {
								const last = items.size() - 1;
								if (last < 0) return;
								commit(removeItem(items, last));
								setRowKeys((current) => patchField(current, name, removeItem(keys, last)) as { [key: string]: Array<string> });
							}),
						}}
					/>
					<textbutton
						key="Add"
						Text="Add"
						Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: click(() => {
								commit(insertItem(items, items.size(), blankValue(spec.item)));
								setRowKeys((current) => patchField(current, name, insertItem(keys, keys.size(), freshKey(name))) as { [key: string]: Array<string> });
							}),
						}}
					/>
				</frame>
			);
		} else if (editor === undefined && spec?.type === "tuple") {
			const slots = spec.items ?? [];
			const list = (typeOf(value) === "table" ? value : []) as Array<defined>;
			const fieldRows: Array<React.Element> = [];
			for (let index = 0; index < slots.size(); index++) {
				const childPath = controlFaultPath(name, tostring(index));
				fieldRows.push(
					nestedField(tostring(index), childPath, slots[index], list[index], (incoming) => {
						if (incoming === undefined) return;
						const written: Array<defined> = [];
						const count = math.max(list.size(), index + 1);
						for (let slot = 0; slot < count; slot++) {
							written.push(slot === index ? (incoming as defined) : (list[slot] ?? blankValue(slots[slot])));
						}
						commit(written);
					}),
				);
			}
			editor = (
				<frame key={name} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} />
					<>
						{fieldRows}
					</>
				</frame>
			);
		} else if (editor === undefined && spec?.type === "union") {
			const tag = spec.tag ?? "kind";
			const record = typeOf(value) === "table" ? (value as { [key: string]: unknown }) : {};
			const selected = tostring(record[tag] ?? "");
			const variantNames: Array<{ label: string; value: string }> = [];
			for (const [variant] of pairs(spec.variants ?? {})) variantNames.push({ label: variant as string, value: variant as string });
			const variantFields = spec.variants?.[selected] ?? {};
			const fieldRows: Array<React.Element> = [];
			for (const [field, child] of pairs(variantFields)) {
				const fieldName = field as string;
				const childPath = controlFaultPath(name, fieldName);
				fieldRows.push(
					nestedField(fieldName, childPath, child, record[fieldName], (incoming) => {
						commit(patchField(record, fieldName, incoming));
					}),
				);
			}
			editor = (
				<frame key={name} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={gap} />
					<kit.Select
						key="Tag"
						value={selected}
						options={variantNames}
						className={fill}
						onChange={(incoming) => {
							const seed: { [key: string]: unknown } = {};
							for (const [field, child] of pairs(spec.variants?.[incoming] ?? {})) {
								seed[field as string] = blankValue(child);
							}
							commit(switchUnion(tag, incoming, seed));
						}}
					/>
					<>
						{fieldRows}
					</>
				</frame>
			);
		} else if (editor === undefined && spec?.type === "object") {
			const record = typeOf(value) === "table" ? (value as { [key: string]: unknown }) : {};
			const fieldRows: Array<React.Element> = [];
			for (const [field, child] of pairs(spec.fields ?? {})) {
				const fieldName = field as string;
				const childPath = controlFaultPath(name, fieldName);
				fieldRows.push(
					nestedField(fieldName, childPath, child, record[fieldName], (incoming) => {
						commit(patchField(record, fieldName, incoming));
					}),
				);
			}
			editor = (
				<frame key={name} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} />
					<>
						{fieldRows}
					</>
				</frame>
			);
		} else if (editor === undefined && spec?.type === "dictionary") {
			const record = typeOf(value) === "table" ? (value as { [key: string]: unknown }) : {};
			const fieldRows: Array<React.Element> = [];
			const keyNames: Array<string> = [];
			for (const [field] of pairs(record)) keyNames.push(field as string);
			for (const fieldName of keyNames) {
				const childPath = controlFaultPath(name, fieldName);
				fieldRows.push(
					nestedField(fieldName, childPath, spec.item, record[fieldName], (incoming) => {
						commit(patchField(record, fieldName, incoming));
					}),
				);
			}
			editor = (
				<frame key={name} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} />
					<>
						{fieldRows}
					</>
					<textbutton
						key="Delete"
						Text="Delete"
						Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: click(() => {
								const last = keyNames.size() - 1;
								if (last < 0) return;
								commit(patchField(record, keyNames[last], undefined));
							}),
						}}
					/>
					<textbutton
						key="Add"
						Text="Add"
						Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: click(() => {
								let keyName = "key";
								let serial = 1;
								while (record[keyName] !== undefined) {
									serial += 1;
									keyName = `key${serial}`;
								}
								commit(patchField(record, keyName, blankValue(spec.item)));
							}),
						}}
					/>
				</frame>
			);
		} else if (editor === undefined && spec?.type === "string") {
			editor = (
				<Input
					key={name}
					{...({
						variant: "standard",
						width: new UDim(1, 0),
						text: typeOf(value) === "string" ? (value as string) : "",
						onInput: (text: string) => commit(text),
						onTextChanged: (text: string) => commit(text),
					} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
				/>
			);
		}
		return editor;
	};
	for (const [key, spec] of pairs(specs)) {
		const name = key as string;
		const value = args[name];
		const editor = controlEditor(name, spec, value, (incoming) => onChange(name, incoming));
		if (editor !== undefined) {
			rows.push(
				<frame
					key={name}
					LayoutOrder={order}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundTransparency={1}
				>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={gap} SortOrder={Enum.SortOrder.LayoutOrder} />
					<textlabel
						key="Name"
						Text={name}
						LayoutOrder={1}
						Size={new UDim2(1, 0, 0, 0)}
						AutomaticSize={Enum.AutomaticSize.Y}
						TextWrapped={true}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.text.primary}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
					<frame key="Editor" LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
						<SafeBoundary resetKey={`${resetKey}:${name}`} compact>
							{editor}
						</SafeBoundary>
					</frame>
					<textlabel
						key="Hint"
						Text={argHint(spec, fallbacks[name])}
						LayoutOrder={3}
						Size={new UDim2(1, 0, 0, 0)}
						AutomaticSize={Enum.AutomaticSize.Y}
						TextWrapped={true}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.default}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.text.secondary}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
					{spec?.description !== undefined && (
						<textlabel
							key="Help"
							Text={spec.description}
							LayoutOrder={4}
							Size={new UDim2(1, 0, 0, 0)}
							AutomaticSize={Enum.AutomaticSize.Y}
							TextWrapped={true}
							BackgroundTransparency={1}
							Font={theme.typography.fontFamilies.default}
							TextSize={theme.typography.fontSizes.caption}
							TextColor3={theme.palette.text.secondary}
							TextXAlignment={Enum.TextXAlignment.Left}
						/>
					)}
					{faults[name] !== undefined && faults[name].size() > 0 && (
						<textlabel
							key="Fault"
							Text={faults[name]}
							LayoutOrder={5}
							Size={new UDim2(1, 0, 0, 0)}
							AutomaticSize={Enum.AutomaticSize.Y}
							TextWrapped={true}
							BackgroundTransparency={1}
							Font={theme.typography.fontFamilies.default}
							TextSize={theme.typography.fontSizes.caption}
							TextColor3={theme.palette.status.error.main}
							TextXAlignment={Enum.TextXAlignment.Left}
						/>
					)}
					{spec?.optional === true && value !== undefined && (
						<textbutton
							key="Clear"
							Text="Clear"
							LayoutOrder={6}
							AutomaticSize={Enum.AutomaticSize.X}
							Size={new UDim2(0, 0, 0, theme.spacing.calc(1.5))}
							BackgroundTransparency={1}
							Font={theme.typography.fontFamilies.semibold}
							TextSize={theme.typography.fontSizes.caption}
							TextColor3={theme.palette.primary.main}
							TextXAlignment={Enum.TextXAlignment.Left}
							Event={{ MouseButton1Click: click(() => onChange(name, undefined)) }}
						/>
					)}
				</frame>,
			);
		}
		order += 1;
	}

	return (
		<scrollingframe
			key="ControlsList"
			ref={setListFrame}
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
			<uipadding
				PaddingTop={gap}
				PaddingBottom={gap}
				PaddingLeft={gap}
				PaddingRight={gap}
			/>
			<uilistlayout Padding={new UDim(0, theme.spacing.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame
				key="Header"
				LayoutOrder={-3}
				Size={new UDim2(1, 0, 0, theme.spacing.calc(1.5))}
				BackgroundTransparency={1}
			>
				<textlabel
					key="ControlsTitle"
					Text="Controls"
					Size={new UDim2(1, -theme.spacing.calc(4), 1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.primary}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Center}
				/>
				{order > 1 && (
					<textbutton
						key="Reset"
						Text="Reset"
						Size={new UDim2(0, theme.spacing.calc(4), 1, 0)}
						Position={new UDim2(1, 0, 0, 0)}
						AnchorPoint={new Vector2(1, 0)}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Right}
						Event={{ MouseButton1Click: click(onReset) }}
					/>
				)}
			</frame>
			<>
				{rows}
			</>
			{order <= 1 && (
				<textlabel
					key="NoControls"
					Text="No controls for this story"
					LayoutOrder={0}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					TextWrapped={true}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.secondary}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			)}
		</scrollingframe>
	);
}

export default Controls;
