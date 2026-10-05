import React from "@rbxts/react";
import { Card } from "./kitBreadth";

interface Args {
	title: string;
	subtitle: string;
	elevation: "flat" | "raised";
	square: boolean;
	body: string;
}

export default {
	title: "Components/Card",
	args: { title: "Card", subtitle: "Subtitle", elevation: "flat", square: false, body: "Body" },
	argTypes: {
		title: { type: "string" },
		subtitle: { type: "string" },
		elevation: { type: "enum", options: ["flat", "raised"] },
		square: { type: "boolean" },
		body: { type: "string" },
	},
	render: (args: Args) => (
		<Card title={args.title} subtitle={args.subtitle} elevation={args.elevation} square={args.square}>
			<textlabel Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} Text={args.body} TextSize={16} Font={Enum.Font.SourceSans} />
		</Card>
	),
};
