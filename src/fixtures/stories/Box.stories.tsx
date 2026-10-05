import React from "@rbxts/react";
import { Box } from "./kitBreadth";

interface Args {
	padding: number;
	bgcolor: "transparent" | "paper" | "elevated" | "input";
	label: string;
}

export default {
	title: "Layout/Box",
	args: { padding: 2, bgcolor: "paper", label: "Boxed content" },
	argTypes: {
		padding: { type: "number", min: 0, max: 4, step: 0.5 },
		bgcolor: { type: "enum", options: ["transparent", "paper", "elevated", "input"] },
		label: { type: "string" },
	},
	render: (args: Args) => (
		<Box padding={args.padding} bgcolor={args.bgcolor}>
			<textlabel
				AutomaticSize={Enum.AutomaticSize.XY}
				Size={UDim2.fromScale(0, 0)}
				BackgroundTransparency={1}
				Text={args.label}
				TextColor3={Color3.fromRGB(230, 230, 230)}
				TextSize={14}
			/>
		</Box>
	),
};
