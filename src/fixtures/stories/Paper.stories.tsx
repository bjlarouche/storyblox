import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Paper } from "./kitBreadth";

interface Args {
	elevation: "flat" | "raised" | "outlined";
	square: boolean;
	text: string;
}

function PaperStory(args: Args) {
	const { theme } = useTheme();
	return (
		<Paper elevation={args.elevation} square={args.square}>
			<textlabel
				AutomaticSize={Enum.AutomaticSize.X}
				Size={new UDim2(0, 0, 0, 24)}
				BackgroundTransparency={1}
				Text={args.text}
				TextSize={16}
				Font={Enum.Font.SourceSans}
				TextColor3={theme.palette.text.primary}
			/>
		</Paper>
	);
}

export default {
	title: "Components/Paper",
	args: { elevation: "outlined", square: false, text: "Surface" },
	argTypes: {
		elevation: { type: "enum", options: ["flat", "raised", "outlined"] },
		square: { type: "boolean" },
		text: { type: "string" },
	},
	render: (args: Args) => <PaperStory {...args} />,
};
