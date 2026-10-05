import React from "@rbxts/react";
import { Button } from "@rbxts/uiblox";

export default {
	title: "Examples/Button",
	component: Button,
	args: { label: "Primary", variant: "contained", disabled: false },
	argTypes: {
		label: { type: "string" },
		variant: { type: "enum", options: ["contained", "outlined", "text"] },
		disabled: { type: "boolean" },
	},
	render: (args: { label: string; variant: "contained" | "outlined" | "text"; disabled: boolean }) => (
		<Button text={args.label} color="primary" variant={args.variant} disabled={args.disabled} />
	),
};
