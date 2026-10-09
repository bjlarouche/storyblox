import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { ScrollView } from "./kitBreadth";

interface Args {
	padding: number;
}

function ScrollViewStory(args: Args) {
	const { theme } = useTheme();
	return (
		<ScrollView
			sx={{
				Size: new UDim2(0, 240, 0, 120),
				AutomaticSize: Enum.AutomaticSize.None,
				p: args.padding,
			}}
		>
			<frame Size={new UDim2(1, 0, 0, 180)} BackgroundColor3={theme.palette.surface.input} BorderSizePixel={0}>
				<textlabel
					Size={new UDim2(1, 0, 0, 28)}
					BackgroundTransparency={1}
					Text="Inside the padding"
					TextColor3={theme.palette.text.primary}
					TextSize={14}
					Font={Enum.Font.SourceSans}
				/>
			</frame>
		</ScrollView>
	);
}

export default {
	title: "Layout/ScrollView",
	preview: { kind: "gui", width: 280, height: 160 },
	args: { padding: 2 },
	argTypes: {
		padding: { type: "number", min: 0, max: 4, step: 0.5 },
	},
	render: (args: Args) => <ScrollViewStory {...args} />,
};
