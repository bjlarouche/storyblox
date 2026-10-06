import React from "@rbxts/react";
import { ToggleButtonGroup, useArg } from "./kitBreadth";

const options = [
	{ label: "Left", value: "left" },
	{ label: "Center", value: "center" },
	{ label: "Right", value: "right" },
];

interface Args {
	value: string;
	disabled: boolean;
	orientation: "horizontal" | "vertical";
	size: "small" | "medium" | "large";
}

function ToggleButtonGroupStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<ToggleButtonGroup
			value={value}
			options={options}
			disabled={args.disabled}
			orientation={args.orientation}
			size={args.size}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Toggle Button Group",
	args: { value: "left", disabled: false, orientation: "vertical", size: "small" },
	argTypes: {
		value: { type: "enum", options: ["left", "center", "right"] },
		disabled: { type: "boolean" },
		orientation: { type: "enum", options: ["horizontal", "vertical"] },
		size: { type: "enum", options: ["small", "medium", "large"] },
	},
	render: (args: Args) => <ToggleButtonGroupStory {...args} />,
};
