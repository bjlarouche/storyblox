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
		<frame Size={new UDim2(0, 220, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Link text={args.text} color={args.color} underline={args.underline} disabled={args.disabled} />
			<Link text="Open docs" color="primary" underline="always" />
			<Link text="Open docs" color="primary" underline="hover" />
		</frame>
	),
};
