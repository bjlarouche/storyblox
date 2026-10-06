import React from "@rbxts/react";
import { RadioGroup, useArg } from "./kit";

interface Args {
	options: string[];
	value: string;
	disabled: boolean;
	row: boolean;
	size: "small" | "medium" | "large";
}

function RadioStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	const options = args.options.map((option) => ({ label: option, value: option }));
	return (
		<RadioGroup
			value={value}
			options={options}
			disabled={args.disabled}
			row={args.row}
			size={args.size}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/RadioGroup",
	args: { options: ["alpha", "beta", "gamma"], value: "alpha", disabled: false, row: false, size: "small" },
	argTypes: {
		options: { type: "array", item: { type: "string" } },
		value: { type: "string" },
		disabled: { type: "boolean" },
		row: { type: "boolean" },
		size: { type: "enum", options: ["small", "medium", "large"] },
	},
	render: (args: Args) => <RadioStory {...args} />,
};
