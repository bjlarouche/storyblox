import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Box } from "./kitBreadth";

interface Args {
	padding: number;
	bgcolor: "transparent" | "paper" | "elevated" | "input";
	label: string;
}

function BoxStory(args: Args) {
	const { theme } = useTheme();
	return (
		<Box padding={args.padding} bgcolor={args.bgcolor}>
			<textlabel
				AutomaticSize={Enum.AutomaticSize.XY}
				Size={UDim2.fromScale(0, 0)}
				BackgroundTransparency={1}
				Text={args.label}
				TextColor3={theme.palette.text.primary}
				TextSize={14}
			/>
		</Box>
	);
}

export default {
	title: "Layout/Box",
	args: { padding: 2, bgcolor: "paper", label: "Boxed content" },
	argTypes: {
		padding: { type: "number", min: 0, max: 4, step: 0.5 },
		bgcolor: { type: "enum", options: ["transparent", "paper", "elevated", "input"] },
		label: { type: "string" },
	},
	render: (args: Args) => <BoxStory {...args} />,
};
