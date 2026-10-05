import React from "@rbxts/react";
import { AppBar } from "./kitBreadth";

interface Args {
	title: string;
	elevation: "flat" | "raised";
}

export default {
	title: "Components/AppBar",
	args: { title: "Storyblox", elevation: "raised" },
	argTypes: {
		title: { type: "string" },
		elevation: { type: "enum", options: ["flat", "raised"] },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(1, 0, 0, 64)} BackgroundTransparency={1}>
			<AppBar title={args.title} elevation={args.elevation} />
		</frame>
	),
};
