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
		<Box
			padding={args.padding}
			bgcolor={args.bgcolor}
			sx={{ Size: new UDim2(0, 220, 0, 96), AutomaticSize: Enum.AutomaticSize.None }}
		>
			<frame Size={UDim2.fromScale(1, 1)} BackgroundColor3={theme.palette.surface.input} BorderSizePixel={0}>
				<textlabel
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Text={args.label}
					TextWrapped={true}
					TextColor3={theme.palette.text.primary}
					TextSize={14}
					Font={Enum.Font.SourceSans}
				/>
			</frame>
		</Box>
	);
}

export default {
	title: "Layout/Box",
	preview: { kind: "gui", width: 280, height: 160 },
	args: { padding: 2, bgcolor: "paper", label: "Inside the padding" },
	argTypes: {
		padding: { type: "number", min: 0, max: 4, step: 0.5 },
		bgcolor: { type: "enum", options: ["transparent", "paper", "elevated", "input"] },
		label: { type: "string" },
	},
	render: (args: Args) => <BoxStory {...args} />,
};
