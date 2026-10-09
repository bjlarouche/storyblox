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
	const action = args.showActions ? (
		<textbutton
			Size={new UDim2(0, 64, 0, 24)}
			BackgroundTransparency={1}
			Text="Action"
			TextSize={14}
			Font={Enum.Font.SourceSans}
			TextColor3={theme.palette.primary.main}
		/>
	) : undefined;
	return (
		<frame Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 12)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={0} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
				<Card
					title={args.title}
					subtitle={args.subtitle}
					elevation={args.elevation}
					square={args.square}
					actions={action}
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
			</frame>
			<frame LayoutOrder={1} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
				<Card title="Save these changes before you leave" subtitle="Regular face under the heading" elevation="flat" />
			</frame>
		</frame>
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
