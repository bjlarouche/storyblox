import React from "@rbxts/react";
import { RadioGroup, useArg } from "./kit";

interface Args {
	options: string[];
	value: string;
	disabled: boolean;
	row: boolean;
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
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/RadioGroup",
	args: { options: ["alpha", "beta", "gamma"], value: "alpha", disabled: false, row: false },
	argTypes: {
		options: { type: "array", item: { type: "string" } },
		value: { type: "string" },
		disabled: { type: "boolean" },
		row: { type: "boolean" },
	},
	render: (args: Args) => <RadioStory {...args} />,
};
