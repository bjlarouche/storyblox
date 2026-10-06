import React from "@rbxts/react";
import { ToggleButton, useArg } from "./kitBreadth";

interface Args {
	label: string;
	selected: boolean;
	disabled: boolean;
	size: "small" | "medium" | "large";
}

function ToggleButtonStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	return (
		<ToggleButton
			label={args.label}
			selected={selected}
			disabled={args.disabled}
			size={args.size}
			onActivated={() => setSelected(!selected)}
		/>
	);
}

export default {
	title: "Components/Toggle Button",
	args: { label: "Bold", selected: true, disabled: false, size: "medium" },
	argTypes: {
		label: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		size: { type: "enum", options: ["small", "medium", "large"] },
	},
	render: (args: Args) => <ToggleButtonStory {...args} />,
};
