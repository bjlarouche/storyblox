import React from "@rbxts/react";
import { Autocomplete, useArg } from "./kitBreadth";

const options = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Cherry", value: "cherry" },
];

interface Args {
	value: string;
	disabled: boolean;
}

function AutocompleteStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<Autocomplete
			value={value}
			options={options}
			disabled={args.disabled}
			placeholder="Fruit"
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Autocomplete",
	args: { value: "apple", disabled: false },
	argTypes: {
		value: { type: "enum", options: ["apple", "banana", "cherry"] },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <AutocompleteStory {...args} />,
};
