import React from "@rbxts/react";

export default {
	title: "Controls/Color",
	description: "Color3 control with ColorPicker; reset restores the default paint.",
	args: {
		paint: Color3.fromRGB(51, 102, 153),
		accent: Color3.fromRGB(255, 80, 80),
	},
	argTypes: {
		paint: { type: "color", description: "Primary fill" },
		accent: { type: "color", optional: true, description: "Optional accent; Clear unsets" },
	},
	render: (args: { paint: Color3; accent?: Color3 }) => (
		<frame Size={new UDim2(1, 0, 0, 48)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 8)} />
			<frame Size={UDim2.fromOffset(48, 48)} BackgroundColor3={args.paint} BorderSizePixel={0} />
			<frame
				Size={UDim2.fromOffset(48, 48)}
				BackgroundColor3={args.accent ?? Color3.fromRGB(200, 200, 200)}
				BackgroundTransparency={args.accent === undefined ? 0.5 : 0}
				BorderSizePixel={0}
			/>
			<textlabel
				Text={`paint R=${math.floor(args.paint.R * 255 + 0.5)} accent=${args.accent === undefined ? "unset" : "set"}`}
				Size={new UDim2(1, -112, 1, 0)}
				BackgroundTransparency={1}
				TextSize={14}
				Font={Enum.Font.SourceSans}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Center}
			/>
		</frame>
	),
};
