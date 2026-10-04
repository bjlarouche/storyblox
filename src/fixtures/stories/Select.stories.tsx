import React from "@rbxts/react";
import { Select, useArg } from "./kit";

const options = [
	{ label: "One", value: "one" },
	{ label: "Two", value: "two" },
];

interface Args {
	placeholder: string;
	value: string;
	disabled: boolean;
}

function SelectStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<Select
			value={value}
			options={options}
			placeholder={args.placeholder}
			disabled={args.disabled}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Select",
	args: { placeholder: "Pick one", value: "", disabled: false },
	argTypes: {
		placeholder: { type: "string" },
		value: { type: "enum", options: ["", "one", "two"] },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <SelectStory {...args} />,
};
