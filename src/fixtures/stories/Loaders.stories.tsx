import React from "@rbxts/react";

interface Args {
	label: string;
	greeting?: string;
}

export default {
	title: "Shell/Loaders",
	description: "Sync loaders merge data into args before render.",
	args: { label: "world" },
	argTypes: { label: { type: "string" } },
	loaders: [
		() => ({ greeting: "hello" }),
		(context: { args: Args }) => ({ label: `${context.args.label}!` }),
	],
	render: (args: Args) => (
		<textlabel
			Size={new UDim2(0, 200, 0, 36)}
			BackgroundTransparency={1}
			Text={`${args.greeting ?? "?"} ${args.label}`}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Center}
		/>
	),
};
