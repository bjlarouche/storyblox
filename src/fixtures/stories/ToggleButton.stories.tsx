import React from "@rbxts/react";
import { ToggleButton, useArg } from "./kitBreadth";

interface Args {
	label: string;
	selected: boolean;
	disabled: boolean;
	size: "small" | "medium" | "large";
}

function slot(order: number, child: React.ReactNode) {
	return (
		<frame key={`toggle-${order}`} LayoutOrder={order} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
			{child}
		</frame>
	);
}

function ToggleButtonStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 160, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			{slot(
				1,
				<ToggleButton
					label={args.label}
					selected={selected}
					disabled={args.disabled}
					size={args.size}
					onActivated={() => setSelected(!selected)}
				/>,
			)}
			{slot(2, <ToggleButton label="Selected" selected={true} onActivated={() => {}} />)}
			{slot(3, <ToggleButton label="Idle" selected={false} onActivated={() => {}} />)}
			{slot(4, <ToggleButton label="Disabled" selected={true} disabled={true} onActivated={() => {}} />)}
		</frame>
	);
}

export default {
	title: "Components/Toggle Button",
	preview: { kind: "gui", width: 200, height: 180 },
	args: { label: "Bold", selected: true, disabled: false, size: "medium" },
	argTypes: {
		label: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		size: { type: "enum", options: ["small", "medium", "large"] },
	},
	render: (args: Args) => <ToggleButtonStory {...args} />,
};
