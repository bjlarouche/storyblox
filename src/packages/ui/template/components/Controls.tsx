import React, { useState } from "@rbxts/react";
import { Input, Theme } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { formatDatatype, parseDatatype } from "../../../argCodec";
import { ArgValues, commitNumberText } from "../storyArgs";

interface Spec {
	type?: string;
	options?: string[];
	control?: string;
	min?: number;
	max?: number;
	step?: number;
	optional?: boolean;
	enumType?: string;
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

function Controls({ theme, args, argTypes, onChange, onReset }: ControlsProps) {
	const [faults, setFaults] = useState<{ [key: string]: string }>({});
	const specs = typeOf(argTypes) === "table" ? (argTypes as { [key: string]: Spec }) : {};
	const rows: React.Element[] = [];
	let order = 1;
	for (const [key, spec] of pairs(specs)) {
		const name = key as string;
		const value = args[name];
		const label = (
			<textlabel
				key={`${name}-label`}
				Text={name}
				LayoutOrder={order}
				Size={new UDim2(1, 0, 0, theme.spacing.calc(1))}
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
			<textlabel
				key="ControlsTitle"
				Text="Controls"
				LayoutOrder={-1}
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
