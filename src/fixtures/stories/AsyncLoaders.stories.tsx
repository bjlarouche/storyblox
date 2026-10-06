import React from "@rbxts/react";

interface Args {
	label: string;
	greeting?: string;
}

export default {
	title: "Shell/AsyncLoaders",
	description: "Thenable loaders settle before render.",
	args: { label: "world" },
	argTypes: { label: { type: "string" } },
	loaders: [
		() => ({ greeting: "hello" }),
		() => ({
			then: (ok: (value: { label: string }) => void) => ok({ label: "async" }),
		}),
	],
	render: (args: Args) => (
		<textlabel
			Size={new UDim2(0, 220, 0, 36)}
			BackgroundTransparency={1}
			Text={`${args.greeting ?? "?"} ${args.label}`}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Center}
		/>
	),
};
