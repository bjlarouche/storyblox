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
	mode: "default" | "empty" | "no-results";
}

function SelectStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	const empty = args.mode === "empty";
	const noResults = args.mode === "no-results";
	return (
		<Select
			value={empty ? "" : value}
			options={empty ? [] : options}
			placeholder={args.placeholder}
			disabled={args.disabled}
			searchable={noResults || undefined}
			defaultOpen={empty || noResults}
			defaultQuery={noResults ? "zzz" : undefined}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Select",
	args: { placeholder: "Pick one", value: "", disabled: false, mode: "default" },
	argTypes: {
		placeholder: { type: "string" },
		value: { type: "enum", options: ["", "one", "two"] },
		disabled: { type: "boolean" },
		mode: { type: "enum", options: ["default", "empty", "no-results"] },
	},
	render: (args: Args) => <SelectStory {...args} />,
};
