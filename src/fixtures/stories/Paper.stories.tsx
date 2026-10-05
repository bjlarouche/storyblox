import React from "@rbxts/react";
import { Paper } from "./kitBreadth";

export default {
	title: "Components/Paper",
	args: { elevation: "flat", text: "Surface" },
	argTypes: {
		elevation: { type: "enum", options: ["flat", "raised"] },
		text: { type: "string" },
	},
	render: (args: { elevation: "flat" | "raised"; text: string }) => (
		<Paper elevation={args.elevation}>
			<textlabel Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} Text={args.text} TextSize={16} Font={Enum.Font.SourceSans} />
		</Paper>
	),
};
