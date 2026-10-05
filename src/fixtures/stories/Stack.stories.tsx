import React from "@rbxts/react";
import { Stack } from "./kitBreadth";

interface Args {
	direction: "row" | "column";
	spacing: number;
	alignItems: "start" | "center" | "end";
	justifyContent: "start" | "center" | "end" | "space-between";
}

function Swatch(props: { text: string; order: number }) {
	return (
		<textlabel
			Size={new UDim2(0, 72, 0, 28)}
			BackgroundColor3={Color3.fromRGB(60, 60, 70)}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={Color3.fromRGB(240, 240, 240)}
			LayoutOrder={props.order}
		/>
	);
}

export default {
	title: "Layout/Stack",
	args: { direction: "row", spacing: 1, alignItems: "center", justifyContent: "start" },
	argTypes: {
		direction: { type: "enum", options: ["row", "column"] },
		spacing: { type: "number", min: 0, max: 4, step: 0.5 },
		alignItems: { type: "enum", options: ["start", "center", "end"] },
		justifyContent: { type: "enum", options: ["start", "center", "end", "space-between"] },
	},
	render: (args: Args) => (
		<Stack
			direction={args.direction}
			spacing={args.spacing}
			alignItems={args.alignItems}
			justifyContent={args.justifyContent}
		>
			<Swatch text="One" order={0} />
			<Swatch text="Two" order={1} />
			<Swatch text="Three" order={2} />
		</Stack>
	),
};
