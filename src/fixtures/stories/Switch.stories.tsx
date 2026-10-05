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
		<Switch
			value={value}
			label={args.label}
			disabled={args.disabled}
			size={args.size}
			color={args.color}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Switch",
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
