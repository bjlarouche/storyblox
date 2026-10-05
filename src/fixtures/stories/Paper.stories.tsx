import React from "@rbxts/react";
import { Paper } from "./kitBreadth";

interface Args {
	elevation: "flat" | "raised" | "outlined";
	square: boolean;
	text: string;
}

export default {
	title: "Components/Paper",
	args: { elevation: "outlined", square: false, text: "Surface" },
	argTypes: {
		elevation: { type: "enum", options: ["flat", "raised", "outlined"] },
		square: { type: "boolean" },
		text: { type: "string" },
	},
	render: (args: Args) => (
		<Paper elevation={args.elevation} square={args.square}>
			<textlabel Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} Text={args.text} TextSize={16} Font={Enum.Font.SourceSans} />
		</Paper>
	),
};
