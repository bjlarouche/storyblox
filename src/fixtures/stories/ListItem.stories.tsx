import React from "@rbxts/react";
import { ListItem } from "./kitBreadth";

interface Args {
	text: string;
	secondary: string;
	selected: boolean;
	disabled: boolean;
	dense: boolean;
	divider: boolean;
}

export default {
	title: "Components/List Item",
	args: { text: "Primary", secondary: "Secondary", selected: true, disabled: false, dense: false, divider: true },
	argTypes: {
		text: { type: "string" },
		secondary: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		dense: { type: "boolean" },
		divider: { type: "boolean" },
	},
	render: (args: Args) => (
		<ListItem
			text={args.text}
			secondary={args.secondary}
			selected={args.selected}
			disabled={args.disabled}
			dense={args.dense}
			divider={args.divider}
		/>
	),
};
