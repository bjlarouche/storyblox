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
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<Tooltip text={args.text} delay={args.delay}>
				<textlabel
					Size={new UDim2(0, 80, 0, 24)}
					BackgroundTransparency={1}
					Text="Top"
					TextSize={18}
					Font={Enum.Font.SourceSans}
					TextColor3={theme.palette.text.primary}
				/>
			</Tooltip>
			<frame
				AnchorPoint={new Vector2(1, 1)}
				Position={new UDim2(1, -8, 1, -8)}
				AutomaticSize={Enum.AutomaticSize.XY}
				Size={new UDim2(0, 0, 0, 0)}
				BackgroundTransparency={1}
			>
				<Tooltip text={args.text} delay={args.delay}>
					<textlabel
						Size={new UDim2(0, 80, 0, 24)}
						BackgroundTransparency={1}
						Text="Corner"
						TextSize={18}
						Font={Enum.Font.SourceSans}
						TextColor3={theme.palette.text.primary}
					/>
				</Tooltip>
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Tooltip",
	preview: { kind: "gui", width: 320, height: 180 },
	args: { text: "Hint", delay: 0.4 },
	argTypes: {
		text: { type: "string" },
		delay: { type: "number", control: "slider", min: 0, max: 2, step: 0.1 },
	},
	render: (args: Args) => <TooltipStory {...args} />,
};
