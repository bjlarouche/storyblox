import React from "@rbxts/react";
import { List } from "./kitBreadth";

interface Args {
	direction: "Horizontal" | "Vertical";
	gap: number;
	wrap: boolean;
}

function Chip(props: { order: number; text: string }) {
	return (
		<textlabel
			AutomaticSize={Enum.AutomaticSize.XY}
			Size={UDim2.fromScale(0, 0)}
			BackgroundColor3={Color3.fromRGB(60, 80, 110)}
			BorderSizePixel={0}
			Text={`  ${props.text}  `}
			TextColor3={Color3.fromRGB(240, 240, 240)}
			TextSize={14}
			LayoutOrder={props.order}
		/>
	);
}

export default {
	title: "Layout/List",
	args: { direction: "Horizontal", gap: 8, wrap: true },
	argTypes: {
		direction: { type: "enum", options: ["Horizontal", "Vertical"] },
		gap: { type: "number", min: 0, max: 24, step: 2 },
		wrap: { type: "boolean" },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(0, 220, 0, 120)} BackgroundTransparency={1} BorderSizePixel={0}>
			<List
				fillDirection={
					args.direction === "Vertical" ? Enum.FillDirection.Vertical : Enum.FillDirection.Horizontal
				}
				padding={new UDim(0, args.gap)}
				wrap={args.wrap ? "wrap" : "no-wrap"}
			>
				<Chip order={0} text="One" />
				<Chip order={1} text="Two" />
				<Chip order={2} text="Three" />
				<Chip order={3} text="Four" />
				<Chip order={4} text="Five" />
			</List>
		</frame>
	),
};
