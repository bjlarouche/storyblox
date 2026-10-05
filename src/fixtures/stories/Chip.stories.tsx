import React from "@rbxts/react";
import { Chip, useArg } from "./kitBreadth";

interface Args {
	label: string;
	selected: boolean;
	disabled: boolean;
}

function ChipStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	return (
		<Chip
			label={args.label}
			selected={selected}
			disabled={args.disabled}
			onActivated={() => setSelected(!selected)}
		/>
	);
}

export default {
	title: "Components/Chip",
	args: { label: "Chip", selected: false, disabled: false },
	argTypes: {
		label: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <ChipStory {...args} />,
};
