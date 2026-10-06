import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Card } from "./kitBreadth";

interface Args {
	title: string;
	subtitle: string;
	elevation: "flat" | "raised";
	square: boolean;
	body: string;
	showActions: boolean;
}

function CardStory(args: Args) {
	const { theme } = useTheme();
	return (
		<Card
			title={args.title}
			subtitle={args.subtitle}
			elevation={args.elevation}
			square={args.square}
			actions={
				args.showActions ? (
					<textbutton
						Size={new UDim2(0, 64, 0, 24)}
						BackgroundTransparency={1}
						Text="Action"
						TextSize={14}
						Font={Enum.Font.SourceSans}
						TextColor3={theme.palette.primary.main}
					/>
				) : undefined
			}
		>
			<textlabel
				Size={new UDim2(1, 0, 0, 24)}
				BackgroundTransparency={1}
				Text={args.body}
				TextSize={16}
				Font={Enum.Font.SourceSans}
				TextColor3={theme.palette.text.primary}
			/>
		</Card>
	);
}

export default {
	title: "Components/Card",
	args: { title: "Card", subtitle: "Subtitle", elevation: "raised", square: false, body: "Body", showActions: true },
	argTypes: {
		title: { type: "string" },
		subtitle: { type: "string" },
		elevation: { type: "enum", options: ["flat", "raised"] },
		square: { type: "boolean" },
		body: { type: "string" },
		showActions: { type: "boolean" },
	},
	render: (args: Args) => <CardStory {...args} />,
};
