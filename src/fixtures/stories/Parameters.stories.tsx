import React from "@rbxts/react";

export default {
	title: "Shell/Parameters",
	description: "Layout, docs page, and which callbacks are logged.",
	features: { docs: true, actions: true },
	parameters: {
		layout: "centered",
		docs: { page: "Centered in the preview. Docs page comes from parameters. Only onPress is logged." },
		actions: { names: ["onPress"] },
	},
	args: {
		label: "Go",
		onPress: () => {},
		onIgnore: () => {},
	},
	argTypes: {
		label: { type: "string" },
		onPress: { type: "readonly" },
		onIgnore: { type: "readonly" },
	},
	render: (args: { label: string; onPress: () => void; onIgnore: () => void }) => (
		<textbutton
			key="ParametersButton"
			Text={args.label}
			Size={new UDim2(0, 120, 0, 36)}
			Event={{
				MouseButton1Click: () => {
					args.onPress();
					args.onIgnore();
				},
			}}
		/>
	),
};
