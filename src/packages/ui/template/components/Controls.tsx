import React from "@rbxts/react";
import { Input, Theme } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { ArgValues } from "../storyArgs";

interface Spec {
	type?: string;
	options?: string[];
}

const kit = Uiblox as unknown as {
	Checkbox: (props: { value: boolean; label?: string; onChange: (value: boolean) => void }) => React.Element;
	NumberInput: (props: { value: number; onChange: (value: number) => void; width?: UDim }) => React.Element;
	Select: (props: {
		value: string;
		options: { label: string; value: string }[];
		onChange: (value: string) => void;
	}) => React.Element;
};

export interface ControlsProps {
	theme: Theme;
	args: ArgValues;
	argTypes?: unknown;
	onChange: (key: string, value: unknown) => void;
	onReset: () => void;
}

function Controls({ theme, args, argTypes, onChange, onReset }: ControlsProps) {
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
		if (spec?.type === "boolean") {
			rows.push(
				<kit.Checkbox
					key={name}
					value={value === true}
					label={name}
					onChange={(incoming) => onChange(name, incoming)}
				/>,
			);
		} else if (spec?.type === "number" && typeOf(value) === "number") {
			rows.push(
				<kit.NumberInput
					key={name}
					value={value as number}
					width={new UDim(1, 0)}
					onChange={(incoming) => onChange(name, incoming)}
				/>,
			);
		} else if (spec?.type === "enum") {
			const options = (spec.options ?? []).map((option) => ({ label: option, value: option }));
			rows.push(
				<kit.Select
					key={name}
					value={typeOf(value) === "string" ? (value as string) : ""}
					options={options}
					onChange={(incoming) => onChange(name, incoming)}
				/>,
			);
		} else if (spec?.type === "string") {
			rows.push(
				<Input
					key={name}
					{...({
						variant: "standard",
						width: new UDim(1, 0),
						text: typeOf(value) === "string" ? (value as string) : "",
						onInput: (text: string) => onChange(name, text),
						onTextChanged: (text: string) => onChange(name, text),
					} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
				/>,
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
