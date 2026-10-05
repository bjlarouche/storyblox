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
	mode: "default" | "empty" | "no-results";
}

function AutocompleteStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	const empty = args.mode === "empty";
	const noResults = args.mode === "no-results";
	return (
		<Autocomplete
			value={empty ? "" : value}
			options={empty ? [] : options}
			disabled={args.disabled}
			placeholder="Fruit"
			defaultOpen={empty || noResults}
			defaultQuery={noResults ? "zzz" : undefined}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Autocomplete",
	args: { value: "apple", disabled: false, mode: "default" },
	argTypes: {
		value: { type: "enum", options: ["apple", "banana", "cherry"] },
		disabled: { type: "boolean" },
		mode: { type: "enum", options: ["default", "empty", "no-results"] },
	},
	render: (args: Args) => <AutocompleteStory {...args} />,
};
