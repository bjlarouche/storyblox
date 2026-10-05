import React from "@rbxts/react";
import { Chip, useArg } from "./kitBreadth";

interface Args {
	label: string;
	selected: boolean;
	disabled: boolean;
	deletable: boolean;
}

function ChipStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	const [visible, setVisible] = useArg(true);
	if (!visible) {
		return (
			<textbutton
				Size={new UDim2(0, 100, 0, 28)}
				Text="Show chip"
				Event={{ Activated: () => setVisible(true) }}
			/>
		);
	}
	return (
		<Chip
			label={args.label}
			selected={selected}
			disabled={args.disabled}
			onActivated={() => setSelected(!selected)}
			onDelete={args.deletable ? () => setVisible(false) : undefined}
		/>
	);
}

export default {
	title: "Components/Chip",
	args: { label: "Chip", selected: false, disabled: false, deletable: true },
	argTypes: {
		label: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		deletable: { type: "boolean" },
	},
	render: (args: Args) => <ChipStory {...args} />,
};
