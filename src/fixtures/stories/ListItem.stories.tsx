import React from "@rbxts/react";
import { ListItem } from "./kitBreadth";

export default {
	title: "Components/List Item",
	args: { text: "Primary", secondary: "Secondary", selected: false, disabled: false },
	argTypes: {
		text: { type: "string" },
		secondary: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
	},
	render: (args: { text: string; secondary: string; selected: boolean; disabled: boolean }) => (
		<ListItem text={args.text} secondary={args.secondary} selected={args.selected} disabled={args.disabled} />
	),
};
