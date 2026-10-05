import React from "@rbxts/react";
import { Badge } from "./kitBreadth";

interface Args {
	count: number;
	max: number;
	invisible: boolean;
	variant: "standard" | "dot";
	color: "error" | "primary" | "success";
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
	render: (args: Args) => (
		<Badge count={args.count} max={args.max} invisible={args.invisible} variant={args.variant} color={args.color}>
			<textlabel Size={new UDim2(0, 48, 0, 24)} BackgroundTransparency={1} Text="Inbox" TextSize={16} Font={Enum.Font.SourceSans} />
		</Badge>
	),
};
