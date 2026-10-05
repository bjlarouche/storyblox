import React from "@rbxts/react";
import { Card } from "./kitBreadth";

export default {
	title: "Components/Card",
	args: { title: "Card", subtitle: "Subtitle", elevation: "flat", body: "Body" },
	argTypes: {
		title: { type: "string" },
		subtitle: { type: "string" },
		elevation: { type: "enum", options: ["flat", "raised"] },
		body: { type: "string" },
	},
	render: (args: { title: string; subtitle: string; elevation: "flat" | "raised"; body: string }) => (
		<Card title={args.title} subtitle={args.subtitle} elevation={args.elevation}>
			<textlabel Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} Text={args.body} TextSize={16} Font={Enum.Font.SourceSans} />
		</Card>
	),
};
