import React from "@rbxts/react";

export default {
	title: "Controls/Font",
	description: "FontFace control with family, weight, and style; Enum.Font stays available on Data Types.",
	args: {
		face: Font.fromEnum(Enum.Font.Gotham),
	},
	argTypes: {
		face: { type: "font", description: "Modern FontFace" },
	},
	render: (args: { face: Font }) => (
		<textlabel
			Text="The quick brown fox"
			Size={new UDim2(1, 0, 0, 48)}
			BackgroundTransparency={1}
			TextSize={24}
			FontFace={args.face}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Center}
		/>
	),
};
