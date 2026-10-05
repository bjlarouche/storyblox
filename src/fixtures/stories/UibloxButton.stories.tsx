import React from "@rbxts/react";
import { Button } from "@rbxts/uiblox";

interface Args {
	text: string;
	variant: "contained" | "outlined" | "text";
	size: "small" | "medium" | "large";
	disabled: boolean;
}

export default {
	title: "Components/Button",
	args: { text: "Button", variant: "contained", size: "medium", disabled: false },
	argTypes: {
		text: { type: "string" },
		variant: { type: "enum", options: ["contained", "outlined", "text"] },
		size: { type: "enum", options: ["small", "medium", "large"] },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => (
		<Button text={args.text} variant={args.variant} size={args.size} disabled={args.disabled} />
	),
};
