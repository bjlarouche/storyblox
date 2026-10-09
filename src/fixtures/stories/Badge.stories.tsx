import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Badge } from "./kitBreadth";

interface Args {
	count: number;
	max: number;
	invisible: boolean;
	variant: "standard" | "dot";
	color: "error" | "primary" | "success";
}

const COLORS = ["error", "primary", "success"] as const;

function BadgeStory(args: Args) {
	const { theme } = useTheme();
	const mark = (text: string) => (
		<textlabel
			Size={new UDim2(0, 72, 0, 24)}
			BackgroundTransparency={1}
			Text={text}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextColor3={theme.palette.text.primary}
		/>
	);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, 16)}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={1} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Badge count={args.count} max={args.max} invisible={args.invisible} variant={args.variant} color={args.color}>
					{mark("Inbox")}
				</Badge>
			</frame>
			{COLORS.map((color, index) => (
				<frame
					key={color}
					LayoutOrder={index + 2}
					AutomaticSize={Enum.AutomaticSize.XY}
					Size={UDim2.fromScale(0, 0)}
					BackgroundTransparency={1}
				>
					<Badge count={color === "error" ? 120 : 3} max={99} color={color}>
						{mark(color)}
					</Badge>
				</frame>
			))}
			<frame LayoutOrder={5} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Badge variant="dot" color="primary">
					{mark("Dot")}
				</Badge>
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Badge",
	preview: { kind: "gui", width: 420, height: 80 },
	args: { count: 3, max: 99, invisible: false, variant: "standard", color: "primary" },
	argTypes: {
		count: { type: "number" },
		max: { type: "number" },
		invisible: { type: "boolean" },
		variant: { type: "enum", options: ["standard", "dot"] },
		color: { type: "enum", options: ["error", "primary", "success"] },
	},
	render: (args: Args) => <BadgeStory {...args} />,
};
