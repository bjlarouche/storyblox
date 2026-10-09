import React from "@rbxts/react";
import { AppBar } from "./kitBreadth";

interface Args {
	title: string;
	elevation: "flat" | "raised";
	color: "default" | "primary";
}

const LINE = "A longer title that stays inside the bar padding";

function bar(order: number, child: React.ReactNode) {
	return (
		<frame key={`bar-${order}`} LayoutOrder={order} Size={new UDim2(1, 0, 0, 56)} BackgroundTransparency={1}>
			{child}
		</frame>
	);
}

export default {
	title: "Components/AppBar",
	preview: { kind: "gui", width: 320, height: 200 },
	args: { title: "Storyblox", elevation: "raised", color: "primary" },
	argTypes: {
		title: { type: "string" },
		elevation: { type: "enum", options: ["flat", "raised"] },
		color: { type: "enum", options: ["default", "primary"] },
	},
	render: (args: Args) => (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 280, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{bar(1, <AppBar title={args.title} elevation={args.elevation} color={args.color} />)}
			{bar(2, <AppBar title={LINE} elevation="flat" color="default" />)}
			{bar(3, <AppBar title="Night watch" subtitle={LINE} color="primary" elevation="raised" />)}
		</frame>
	),
};
