import React from "@rbxts/react";
import { ToggleButton, useArg } from "./kitBreadth";

interface Args {
	label: string;
	selected: boolean;
	disabled: boolean;
}

function ToggleButtonStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	return (
		<ToggleButton
			label={args.label}
			selected={selected}
			disabled={args.disabled}
			onActivated={() => setSelected(!selected)}
		/>
	);
}

export default {
	title: "Components/Toggle Button",
	args: { label: "Bold", selected: false, disabled: false },
	argTypes: {
		label: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <ToggleButtonStory {...args} />,
};
