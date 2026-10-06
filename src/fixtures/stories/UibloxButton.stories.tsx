import React from "@rbxts/react";
import { Button } from "@rbxts/uiblox";

interface Args {
	text: string;
	variant: "contained" | "outlined" | "text";
	size: "small" | "medium" | "large";
	color: "primary" | "secondary";
	disabled: boolean;
	fullWidth: boolean;
}

export default {
	title: "Components/Button",
	args: { text: "Button", variant: "contained", size: "medium", color: "secondary", disabled: false, fullWidth: true },
	argTypes: {
		text: { type: "string" },
		variant: { type: "enum", options: ["contained", "outlined", "text"] },
		size: { type: "enum", options: ["small", "medium", "large"] },
		color: { type: "enum", options: ["primary", "secondary"] },
		disabled: { type: "boolean" },
		fullWidth: { type: "boolean" },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(0, 220, 0, 40)} BackgroundTransparency={1}>
			<Button
				text={args.text}
				variant={args.variant}
				size={args.size}
				color={args.color}
				disabled={args.disabled}
				fullWidth={args.fullWidth}
			/>
		</frame>
	),
};
