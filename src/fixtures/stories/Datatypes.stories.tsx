import React from "@rbxts/react";

export default {
	title: "Fixture/Datatypes",
	args: {
		paint: new Color3(0.2, 0.4, 0.6),
		shift: new Vector2(4, 5),
		place: new Vector3(1, 2, 3),
		gap: new UDim(0.5, 8),
		span: new UDim2(0.5, 1, 1, -2),
		font: Enum.Font.SourceSans,
		icon: 123,
		origin: new CFrame(0, 1, 0),
	},
	argTypes: {
		paint: { type: "color" },
		shift: { type: "vector2" },
		place: { type: "vector3" },
		gap: { type: "udim" },
		span: { type: "udim2" },
		font: { type: "EnumItem", enumType: "Font", options: ["SourceSans", "Gotham"] },
		icon: { type: "asset" },
		origin: { type: "cframe" },
	},
	render: (args: {
		paint: Color3;
		shift: Vector2;
		place: Vector3;
		gap: UDim;
		span: UDim2;
		font: Enum.Font;
		icon: number;
		origin: CFrame;
	}) => (
		<textlabel
			Text={`R=${args.paint.R} shift=${args.shift.X} X=${args.place.X} offset=${args.gap.Offset} span=${args.span.Y.Offset} font=${args.font.Name} icon=${args.icon} Y=${args.origin.Y}`}
			Size={new UDim2(1, 0, 0, 24)}
			BackgroundTransparency={1}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
