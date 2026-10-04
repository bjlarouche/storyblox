import React from "@rbxts/react";
import { Button } from "@rbxts/uiblox";

interface Args {
	text: string;
	variant: "contained" | "outlined" | "text";
	disabled: boolean;
}

export default {
	title: "Components/Button",
	args: { text: "Button", variant: "contained", disabled: false },
	argTypes: {
		text: { type: "string" },
		variant: { type: "enum", options: ["contained", "outlined", "text"] },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <Button text={args.text} variant={args.variant} disabled={args.disabled} />,
};
