import React from "@rbxts/react";
import { Typography } from "@rbxts/uiblox";

interface Args {
	text: string;
	variant: "h1" | "h2" | "h3" | "body" | "caption" | "button" | "overline";
	color: "primary" | "secondary" | "textPrimary" | "error";
}

export default {
	title: "Components/Typography",
	args: { text: "Heading", variant: "h1", color: "primary" },
	argTypes: {
		text: { type: "string" },
		variant: { type: "enum", options: ["h1", "h2", "h3", "body", "caption", "button", "overline"] },
		color: { type: "enum", options: ["primary", "secondary", "textPrimary", "error"] },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(0, 280, 0, 48)} BackgroundTransparency={1}>
			<Typography text={args.text} variant={args.variant} color={args.color} />
		</frame>
	),
};
