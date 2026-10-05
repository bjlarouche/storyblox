import React from "@rbxts/react";
import { Switch, useArg } from "./kit";

interface Args {
	value: boolean;
	label: string;
	disabled: boolean;
}

function SwitchStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return <Switch value={value} label={args.label} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Components/Switch",
	args: { value: true, label: "Enabled", disabled: false },
	argTypes: {
		value: { type: "boolean", control: "switch" },
		label: { type: "string" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <SwitchStory {...args} />,
};
