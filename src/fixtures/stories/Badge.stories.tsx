import React from "@rbxts/react";
import { Badge } from "./kitBreadth";

export default {
	title: "Components/Badge",
	args: { count: 3, max: 99, invisible: false },
	argTypes: {
		count: { type: "number" },
		max: { type: "number" },
		invisible: { type: "boolean" },
	},
	render: (args: { count: number; max: number; invisible: boolean }) => (
		<Badge count={args.count} max={args.max} invisible={args.invisible}>
			<textlabel Size={new UDim2(0, 48, 0, 24)} BackgroundTransparency={1} Text="Inbox" TextSize={16} Font={Enum.Font.SourceSans} />
		</Badge>
	),
};
