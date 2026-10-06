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

function BadgeStory(args: Args) {
	const { theme } = useTheme();
	return (
		<Badge count={args.count} max={args.max} invisible={args.invisible} variant={args.variant} color={args.color}>
			<textlabel
				Size={new UDim2(0, 72, 0, 24)}
				BackgroundTransparency={1}
				Text="Inbox"
				TextSize={16}
				Font={Enum.Font.SourceSans}
				TextColor3={theme.palette.text.primary}
			/>
		</Badge>
	);
}

export default {
	title: "Components/Badge",
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
