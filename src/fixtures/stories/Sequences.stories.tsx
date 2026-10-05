import React from "@rbxts/react";

export default {
	title: "Controls/Sequences",
	description: "ColorSequence and NumberSequence controls for gradient and transparency curves.",
	args: {
		gradient: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(255, 80, 80)),
			new ColorSequenceKeypoint(0.5, Color3.fromRGB(80, 255, 140)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(80, 120, 255)),
		]),
		fade: new NumberSequence([
			new NumberSequenceKeypoint(0, 0),
			new NumberSequenceKeypoint(0.5, 0.4),
			new NumberSequenceKeypoint(1, 1),
		]),
	},
	argTypes: {
		gradient: { type: "colorSequence" },
		fade: { type: "numberSequence" },
	},
	render: (args: { gradient: ColorSequence; fade: NumberSequence }) => (
		<frame Size={new UDim2(1, 0, 0, 48)} BackgroundColor3={new Color3(1, 1, 1)} BorderSizePixel={0}>
			<uigradient Color={args.gradient} Transparency={args.fade} />
		</frame>
	),
};
