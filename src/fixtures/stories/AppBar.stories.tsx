import React from "@rbxts/react";
import { AppBar } from "./kitBreadth";

interface Args {
	title: string;
	elevation: "flat" | "raised";
	color: "default" | "primary";
}

export default {
	title: "Components/AppBar",
	args: { title: "Storyblox", elevation: "raised", color: "default" },
	argTypes: {
		title: { type: "string" },
		elevation: { type: "enum", options: ["flat", "raised"] },
		color: { type: "enum", options: ["default", "primary"] },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(1, 0, 0, 64)} BackgroundTransparency={1}>
			<AppBar title={args.title} elevation={args.elevation} color={args.color} />
		</frame>
	),
};
