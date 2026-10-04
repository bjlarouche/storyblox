import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Input, Theme } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { formatDatatype, parseDatatype } from "../../../argCodec";
import {
	insertItem,
	mountControlEditor,
	moveItem,
	patchField,
	readOnlyKind,
	removeItem,
	switchUnion,
} from "../../../nestedArgs";
import { ArgValues, commitNumberText } from "../storyArgs";
import { argDoc } from "../storyLabel";

interface Spec {
	type?: string;
	options?: string[];
	control?: string;
	min?: number;
	max?: number;
	step?: number;
	optional?: boolean;
	enumType?: string;
	fields?: { [key: string]: Spec };
	item?: Spec;
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
		onChange: (value: boolean) => void;
	}) => React.Element;
	NumberInput: (props: { value: number; onChange: (value: number) => void; width?: UDim }) => React.Element;
	Select: (props: {
		value: string;
		options: { label: string; value: string }[];
		onChange: (value: string) => void;
	}) => React.Element;
	RadioGroup: (props: {
		value: string;
		options: { label: string; value: string }[];
		onChange: (value: string) => void;
	}) => React.Element;
	Slider: (props: {
		value: number;
		min: number;
		max: number;
		step?: number;
		onChange: (value: number) => void;
	}) => React.Element;
};

export interface ControlsProps {
	theme: Theme;
	args: ArgValues;
	argTypes?: unknown;
	defaults?: unknown;
	description?: unknown;
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
		kind === "color" ||
		kind === "vector2" ||
		kind === "vector3" ||
		kind === "udim" ||
		kind === "udim2" ||
		kind === "EnumItem" ||
		kind === "asset" ||
		kind === "cframe"
	);
}

let rowSerial = 0;

function freshKey(name: string) {
	rowSerial += 1;
	return `${name}-${rowSerial}`;
}

function CustomEditor(props: { editor: string; value: unknown; onChange: (value: unknown) => void }) {
	const host = useRef<Frame>();
	const change = useRef(props.onChange);
	change.current = props.onChange;
	useEffect(() => {
		return mountControlEditor(props.editor, props.value, (incoming) => change.current(incoming));
	}, [props.editor, props.value]);
	return <frame ref={host} Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} />;
}

function Controls({ theme, args, argTypes, defaults, description, onChange, onReset }: ControlsProps) {
	const [faults, setFaults] = useState<{ [key: string]: string }>({});
	const [rowKeys, setRowKeys] = useState<{ [key: string]: Array<string> }>({});
	const specs = typeOf(argTypes) === "table" ? (argTypes as { [key: string]: Spec }) : {};
	const fallbacks = typeOf(defaults) === "table" ? (defaults as ArgValues) : {};
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
				TextColor3={theme.options.constants.colors.textMuted}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>,
		);
	}
	let order = 1;
	for (const [key, spec] of pairs(specs)) {
		const name = key as string;
		const value = args[name];
		const label = (
			<textlabel
				key={`${name}-label`}
				Text={argDoc(name, spec, fallbacks[name])}
				LayoutOrder={order}
				Size={new UDim2(1, 0, 0, theme.spacing.calc(1))}
				AutomaticSize={Enum.AutomaticSize.Y}
				TextWrapped={true}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.options.constants.colors.textMuted}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		);
		order += 1;
		rows.push(label);
		const options = (spec?.options ?? []).map((option) => ({ label: option, value: option }));
		const commitNumber = (incoming: unknown) => {
			const committed = commitNumberText(tostring(incoming));
			if (committed !== undefined) onChange(name, committed);
		};
		let editor: React.Element | undefined;
		if (spec?.type === "boolean") {
			editor = (
				<kit.Checkbox
					key={name}
					value={value === true}
					mixed={spec.optional === true && value === undefined}
					label={name}
					onChange={(incoming) => onChange(name, incoming)}
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
					onChange={commitNumber}
				/>
			);
		} else if (spec?.type === "number" && typeOf(value) === "number") {
			editor = <kit.NumberInput key={name} value={value as number} width={new UDim(1, 0)} onChange={commitNumber} />;
		} else if (spec?.type === "number") {
			editor = (
				<Input
					key={name}
					{...({
						variant: "standard",
						width: new UDim(1, 0),
						text: "",
						placeholder: "number",
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
					onChange={(incoming) => onChange(name, incoming)}
				/>
			);
		} else if (spec?.type === "enum") {
			editor = (
				<kit.Select
					key={name}
					value={typeOf(value) === "string" ? (value as string) : ""}
					options={options}
					onChange={(incoming) => onChange(name, incoming)}
				/>
			);
		} else if (datatype(spec?.type)) {
			const commitText = (text: string) => {
				const parsed = parseDatatype(spec ?? {}, text);
				if (!parsed.ok) {
					setFaults((current) => writeFault(current, name, parsed.reason));
					return;
				}
				setFaults((current) => writeFault(current, name, ""));
				onChange(name, parsed.value);
			};
			if (spec?.type === "EnumItem" && options.size() > 0) {
				const selected = typeOf(value) === "EnumItem" ? (value as { Name: string }).Name : "";
				editor = (
					<kit.Select key={name} value={selected} options={options} onChange={(incoming) => commitText(incoming)} />
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
		} else if (spec?.type === "readonly") {
			editor = (
				<textlabel
					key={name}
					Text={readOnlyKind(value) ?? "readonly"}
					Size={new UDim2(1, 0, 0, theme.spacing.calc(1))}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.options.constants.colors.textMuted}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			);
		} else if (spec?.type === "custom") {
			editor = <CustomEditor key={name} editor={spec.editor ?? ""} value={value} onChange={(incoming) => onChange(name, incoming)} />;
		} else if (spec?.type === "array") {
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
				itemRows.push(
					<Input
						key={rowKey}
						{...({
							variant: "standard",
							width: new UDim(1, 0),
							text: tostring(items[index] ?? ""),
							onTextChanged: (text: string) => {
								const written = spec.item?.type === "number" ? commitNumberText(text) : text;
								if (written === undefined) return;
								onChange(name, insertItem(removeItem(items, index), index, written as defined));
							},
						} as React.ComponentProps<typeof Input> & { onTextChanged?: (text: string) => void })}
					/>,
				);
			}
			editor = (
				<frame key={name} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} />
					{itemRows}
					<textbutton
						key="Up"
						Text="Up"
						Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.secondary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: () => {
								const last = items.size() - 1;
								if (last < 1) return;
								onChange(name, moveItem(items, last, last - 1));
								setRowKeys((current) => patchField(current, name, moveItem(keys, last, last - 1)) as { [key: string]: Array<string> });
							},
						}}
					/>
					<textbutton
						key="Delete"
						Text="Delete"
						Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.secondary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: () => {
								const last = items.size() - 1;
								if (last < 0) return;
								onChange(name, removeItem(items, last));
								setRowKeys((current) => patchField(current, name, removeItem(keys, last)) as { [key: string]: Array<string> });
							},
						}}
					/>
					<textbutton
						key="Add"
						Text="Add"
						Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.secondary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{
							MouseButton1Click: () => {
								const blank = spec.item?.type === "number" ? 0 : "";
								onChange(name, insertItem(items, items.size(), blank));
								setRowKeys((current) => patchField(current, name, insertItem(keys, keys.size(), freshKey(name))) as { [key: string]: Array<string> });
							},
						}}
					/>
				</frame>
			);
		} else if (spec?.type === "union") {
			const tag = spec.tag ?? "kind";
			const record = typeOf(value) === "table" ? (value as { [key: string]: unknown }) : {};
			const selected = tostring(record[tag] ?? "");
			const variantNames: Array<{ label: string; value: string }> = [];
			for (const [variant] of pairs(spec.variants ?? {})) variantNames.push({ label: variant as string, value: variant as string });
			editor = (
				<kit.Select
					key={name}
					value={selected}
					options={variantNames}
					onChange={(incoming) => onChange(name, switchUnion(tag, incoming, {}))}
				/>
			);
		} else if (spec?.type === "object" || spec?.type === "dictionary") {
			const record = typeOf(value) === "table" ? (value as { [key: string]: unknown }) : {};
			const fieldRows: Array<React.Element> = [];
			const entries = spec.type === "object" ? spec.fields ?? {} : record;
			for (const [field] of pairs(entries)) {
				const fieldName = field as string;
				fieldRows.push(
					<Input
						key={fieldName}
						{...({
							variant: "standard",
							width: new UDim(1, 0),
							text: tostring(record[fieldName] ?? ""),
							placeholder: fieldName,
							onTextChanged: (text: string) => onChange(name, patchField(record, fieldName, text)),
						} as React.ComponentProps<typeof Input> & { onTextChanged?: (text: string) => void })}
					/>,
				);
			}
			editor = (
				<frame key={name} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} />
					{fieldRows}
				</frame>
			);
		} else if (spec?.type === "string") {
			editor = (
				<Input
					key={name}
					{...({
						variant: "standard",
						width: new UDim(1, 0),
						text: typeOf(value) === "string" ? (value as string) : "",
						onInput: (text: string) => onChange(name, text),
						onTextChanged: (text: string) => onChange(name, text),
					} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
				/>
			);
		}
		if (editor !== undefined) {
			rows.push(
				<frame
					key={`${name}-editor`}
					LayoutOrder={order}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundTransparency={1}
				>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(1))} />
					{editor}
					{faults[name] !== undefined && faults[name].size() > 0 && (
						<textlabel
							key="Fault"
							Text={faults[name]}
							Size={new UDim2(1, 0, 0, theme.spacing.calc(1))}
							BackgroundTransparency={1}
							Font={theme.typography.fontFamilies.default}
							TextSize={theme.typography.fontSizes.caption}
							TextColor3={theme.palette.error.main}
							TextXAlignment={Enum.TextXAlignment.Left}
						/>
					)}
					{spec?.optional === true && value !== undefined && (
						<textbutton
							key="Clear"
							Text="Clear"
							Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
							BackgroundTransparency={1}
							Font={theme.typography.fontFamilies.semibold}
							TextSize={theme.typography.fontSizes.caption}
							TextColor3={theme.palette.secondary.main}
							TextXAlignment={Enum.TextXAlignment.Left}
							Event={{ MouseButton1Click: () => onChange(name, undefined) }}
						/>
					)}
				</frame>,
			);
		}
		order += 1;
	}
	rows.push(
		order > 1 ? (
			<textbutton
				key="Reset"
				Text="Reset"
				LayoutOrder={0}
				Size={new UDim2(0, theme.spacing.calc(4), 0, theme.spacing.calc(1.5))}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.secondary.main}
				TextXAlignment={Enum.TextXAlignment.Left}
				Event={{ MouseButton1Click: onReset }}
			/>
		) : (
			<textlabel
				key="NoControls"
				Text="No controls for this story"
				LayoutOrder={0}
				Size={new UDim2(1, 0, 0, theme.spacing.calc(1))}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.options.constants.colors.textMuted}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		),
	);

	return (
		<scrollingframe
			key="ControlsList"
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollBarThickness={theme.spacing.calc(0.5)}
		>
			<uilistlayout Padding={new UDim(0, theme.padding.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			<textlabel
				key="ControlsTitle"
				Text="Controls"
				LayoutOrder={-2}
				Size={new UDim2(1, 0, 0, theme.spacing.calc(1))}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.options.constants.colors.textMuted}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
			{rows}
		</scrollingframe>
	);
}

export default Controls;
