import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Paper } from "./kitBreadth";

interface Args {
	elevation: "flat" | "raised" | "outlined";
	square: boolean;
	text: string;
}

function Label(props: { text: string; color: Color3 }) {
	return (
		<textlabel
			AutomaticSize={Enum.AutomaticSize.X}
			Size={new UDim2(0, 0, 0, 24)}
			BackgroundTransparency={1}
			Text={props.text}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextColor3={props.color}
		/>
	);
}

function PaperStory(args: Args) {
	const { theme } = useTheme();
	const ink = theme.palette.text.primary;
	return (
		<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={0} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Paper elevation={args.elevation} square={args.square}>
					<Label text={args.text} color={ink} />
				</Paper>
			</frame>
			<frame LayoutOrder={1} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Paper elevation="flat">
					<Label text="One surface padding" color={ink} />
				</Paper>
			</frame>
		</frame>
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
