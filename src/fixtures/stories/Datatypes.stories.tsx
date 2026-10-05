import React from "@rbxts/react";

export default {
	title: "Layout/Data Types",
	args: {
		paint: new Color3(0.2, 0.4, 0.6),
		brick: new BrickColor(23),
		shift: new Vector2(4, 5),
		place: new Vector3(1, 2, 3),
		gap: new UDim(0.5, 8),
		span: new UDim2(0.5, 1, 1, -2),
		font: Enum.Font.SourceSans,
		face: Font.fromEnum(Enum.Font.Gotham),
		gradient: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(255, 80, 80)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(80, 120, 255)),
		]),
		fade: new NumberSequence([
			new NumberSequenceKeypoint(0, 0),
			new NumberSequenceKeypoint(1, 1),
		]),
		icon: 123,
		origin: new CFrame(0, 1, 0),
	},
	argTypes: {
		paint: { type: "color" },
		brick: { type: "brickColor" },
		shift: { type: "vector2" },
		place: { type: "vector3" },
		gap: { type: "udim" },
		span: { type: "udim2" },
		font: { type: "EnumItem", enumType: "Font" },
		face: { type: "font" },
		gradient: { type: "colorSequence" },
		fade: { type: "numberSequence" },
		icon: { type: "asset" },
		origin: { type: "cframe" },
	},
	render: (args: {
		paint: Color3;
		brick: BrickColor;
		shift: Vector2;
		place: Vector3;
		gap: UDim;
		span: UDim2;
		font: Enum.Font;
		face: Font;
		gradient: ColorSequence;
		fade: NumberSequence;
		icon: number;
		origin: CFrame;
	}) => (
		<textlabel
			Text={`R=${args.paint.R} brick=${args.brick.Name} shift=${args.shift.X} X=${args.place.X} offset=${args.gap.Offset} span=${args.span.Y.Offset} font=${args.font.Name} face=${args.face.Family} stops=${args.gradient.Keypoints.size()} fade=${args.fade.Keypoints.size()} icon=${args.icon} Y=${args.origin.Y}`}
			Size={new UDim2(1, 0, 0, 24)}
			BackgroundTransparency={1}
			TextSize={16}
			FontFace={args.face}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
