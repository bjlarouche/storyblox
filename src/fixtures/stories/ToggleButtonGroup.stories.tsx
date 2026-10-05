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
}

function ToggleButtonGroupStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<ToggleButtonGroup value={value} options={options} disabled={args.disabled} onChange={setValue} />
	);
}

export default {
	title: "Components/Toggle Button Group",
	args: { value: "left", disabled: false },
	argTypes: {
		value: { type: "enum", options: ["left", "center", "right"] },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <ToggleButtonGroupStory {...args} />,
};
