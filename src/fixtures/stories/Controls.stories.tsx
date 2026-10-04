import React from "@rbxts/react";

export default {
	title: "Fixture/Controls",
	args: { tone: "low", amount: 20 },
	argTypes: {
		tone: { type: "enum", options: ["low", "high"], control: "radio" },
		amount: { type: "number", control: "slider", min: 0, max: 100, step: 5 },
		count: { type: "number", optional: true },
		disabled: { type: "boolean", optional: true },
	},
	render: (args: { tone?: string; amount?: number; count?: number; disabled?: boolean }) => (
		<textlabel
			Text={`tone=${args.tone ?? ""} amount=${args.amount ?? ""} count=${args.count === undefined ? "absent" : tostring(args.count)} disabled=${args.disabled === undefined ? "absent" : tostring(args.disabled)}`}
			Size={new UDim2(1, 0, 0, 24)}
			BackgroundTransparency={1}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
