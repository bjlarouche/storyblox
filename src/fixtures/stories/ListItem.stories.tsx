import React from "@rbxts/react";
import { ListItem } from "./kitBreadth";

interface Args {
	text: string;
	secondary: string;
	selected: boolean;
	disabled: boolean;
	dense: boolean;
}

export default {
	title: "Components/List Item",
	args: { text: "Primary", secondary: "Secondary", selected: false, disabled: false, dense: false },
	argTypes: {
		text: { type: "string" },
		secondary: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		dense: { type: "boolean" },
	},
	render: (args: Args) => (
		<ListItem
			text={args.text}
			secondary={args.secondary}
			selected={args.selected}
			disabled={args.disabled}
			dense={args.dense}
		/>
	),
};
