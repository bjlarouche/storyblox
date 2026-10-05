import React from "@rbxts/react";
import { Badge } from "./kitBreadth";

interface Args {
	count: number;
	max: number;
	invisible: boolean;
	variant: "standard" | "dot";
}

export default {
	title: "Components/Badge",
	args: { count: 3, max: 99, invisible: false, variant: "standard" },
	argTypes: {
		count: { type: "number" },
		max: { type: "number" },
		invisible: { type: "boolean" },
		variant: { type: "enum", options: ["standard", "dot"] },
	},
	render: (args: Args) => (
		<Badge count={args.count} max={args.max} invisible={args.invisible} variant={args.variant}>
			<textlabel Size={new UDim2(0, 48, 0, 24)} BackgroundTransparency={1} Text="Inbox" TextSize={16} Font={Enum.Font.SourceSans} />
		</Badge>
	),
};
