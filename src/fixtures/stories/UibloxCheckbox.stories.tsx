import React from "@rbxts/react";
import { Checkbox } from "@rbxts/uiblox";
import { useArg } from "./kit";

interface Args {
	value: boolean;
	disabled: boolean;
	label: string;
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
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Checkbox",
	args: { value: false, disabled: false, label: "Checkbox" },
	argTypes: {
		value: { type: "boolean" },
		disabled: { type: "boolean" },
		label: { type: "string" },
		mixed: { type: "boolean", optional: true },
	},
	render: (args: Args) => <CheckboxStory {...args} />,
};
