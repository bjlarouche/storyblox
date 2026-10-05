import React from "@rbxts/react";

interface Args {
	label: string;
}

export default {
	title: "Shell/Tags",
	description: "Tagged story for include/exclude filtering.",
	tags: ["dev", "shell"],
	args: { label: "tagged" },
	argTypes: { label: { type: "string" } },
	render: (args: Args) => (
		<textlabel
			Size={new UDim2(0, 160, 0, 32)}
			BackgroundTransparency={1}
			Text={args.label}
			TextSize={16}
			Font={Enum.Font.SourceSans}
		/>
	),
};
