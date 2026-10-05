import React from "@rbxts/react";
import { Link } from "./kitBreadth";

interface Args {
	text: string;
	color: "primary" | "inherit" | "error";
	underline: "always" | "hover" | "none";
	disabled: boolean;
}

export default {
	title: "Components/Link",
	args: { text: "Open docs", color: "primary", underline: "always", disabled: false },
	argTypes: {
		text: { type: "string" },
		color: { type: "enum", options: ["primary", "inherit", "error"] },
		underline: { type: "enum", options: ["always", "hover", "none"] },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => (
		<Link text={args.text} color={args.color} underline={args.underline} disabled={args.disabled} />
	),
};
