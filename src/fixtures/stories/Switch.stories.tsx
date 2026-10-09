import React from "@rbxts/react";
import { Switch, useArg } from "./kit";

interface Args {
	value: boolean;
	label: string;
	disabled: boolean;
	size: "small" | "medium" | "large";
	color: "primary" | "accent";
}

function SwitchStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 220, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={1} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Switch
					value={value}
					label={args.label}
					disabled={args.disabled}
					size={args.size}
					color={args.color}
					onChange={setValue}
				/>
			</frame>
			<frame LayoutOrder={2} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Switch value={true} label="Small" size="small" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={3} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Switch value={true} label="Large" size="large" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={4} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Switch value={true} label="Disabled" size="medium" disabled={true} onChange={() => {}} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Switch",
	preview: { kind: "gui", width: 260, height: 180 },
	args: { value: true, label: "Enabled", disabled: false, size: "medium", color: "accent" },
	argTypes: {
		value: { type: "boolean", control: "switch" },
		label: { type: "string" },
		disabled: { type: "boolean" },
		size: { type: "enum", options: ["small", "medium", "large"] },
		color: { type: "enum", options: ["primary", "accent"] },
	},
	render: (args: Args) => <SwitchStory {...args} />,
};
