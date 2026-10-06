import React from "@rbxts/react";
import { Checkbox, useArg } from "./kit";

interface Args {
	value: boolean;
	disabled: boolean;
	label: string;
	size: "small" | "medium" | "large";
	mixed?: boolean;
}

function CheckboxStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<Checkbox
			value={value}
			disabled={args.disabled}
			mixed={args.mixed}
			label={args.label}
			size={args.size}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Checkbox",
	args: { value: true, disabled: false, label: "Checkbox", size: "medium" },
	argTypes: {
		value: { type: "boolean" },
		disabled: { type: "boolean" },
		label: { type: "string" },
		size: { type: "enum", options: ["small", "medium", "large"] },
		mixed: { type: "boolean", optional: true },
	},
	render: (args: Args) => <CheckboxStory {...args} />,
};
