import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Tooltip } from "./kit";

interface Args {
	text: string;
	delay: number;
}

function TooltipStory(args: Args) {
	const { theme } = useTheme();
	return (
		<Tooltip text={args.text} delay={args.delay}>
			<textlabel
				Size={new UDim2(0, 80, 0, 24)}
				BackgroundTransparency={1}
				Text="Hover"
				TextSize={18}
				Font={Enum.Font.SourceSans}
				TextColor3={theme.palette.text.primary}
			/>
		</Tooltip>
	);
}

export default {
	title: "Components/Tooltip",
	args: { text: "Hint", delay: 0.4 },
	argTypes: {
		text: { type: "string" },
		delay: { type: "number", control: "slider", min: 0, max: 2, step: 0.1 },
	},
	render: (args: Args) => <TooltipStory {...args} />,
};
