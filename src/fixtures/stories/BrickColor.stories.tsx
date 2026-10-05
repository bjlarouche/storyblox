import React from "@rbxts/react";

export default {
	title: "Controls/BrickColor",
	description: "BrickColor control with BrickColorPicker.",
	args: {
		paint: new BrickColor(21),
	},
	argTypes: {
		paint: { type: "brickColor", description: "Named brick swatch" },
	},
	render: (args: { paint: BrickColor }) => (
		<frame Size={new UDim2(1, 0, 0, 48)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 8)} />
			<frame Size={UDim2.fromOffset(48, 48)} BackgroundColor3={args.paint.Color} BorderSizePixel={0} />
			<textlabel
				Text={`${args.paint.Name} (#${args.paint.Number})`}
				Size={new UDim2(1, -56, 1, 0)}
				BackgroundTransparency={1}
				TextSize={14}
				Font={Enum.Font.SourceSans}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Center}
			/>
		</frame>
	),
};
