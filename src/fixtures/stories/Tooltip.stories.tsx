import React from "@rbxts/react";
import { Tooltip } from "./kit";

export default {
	title: "Components/Tooltip",
	args: { text: "Hint", delay: 0.4 },
	argTypes: {
		text: { type: "string" },
		delay: { type: "number", control: "slider", min: 0, max: 2, step: 0.1 },
	},
	render: (args: { text: string; delay: number }) => (
		<Tooltip text={args.text} delay={args.delay}>
			<textlabel
				Size={new UDim2(0, 80, 0, 24)}
				BackgroundTransparency={1}
				Text="Hover"
				TextSize={18}
				Font={Enum.Font.SourceSans}
			/>
		</Tooltip>
	),
};
