import React from "@rbxts/react";

export default {
	title: "Controls/Spatial",
	description: "Vector2, Vector3, UDim, and UDim2 compound editors.",
	args: {
		shift: new Vector2(4, 5),
		place: new Vector3(1, 2, 3),
		gap: new UDim(0.5, 8),
		span: new UDim2(0.5, 1, 1, -2),
	},
	argTypes: {
		shift: { type: "vector2" },
		place: { type: "vector3" },
		gap: { type: "udim" },
		span: { type: "udim2" },
	},
	render: (args: { shift: Vector2; place: Vector3; gap: UDim; span: UDim2 }) => (
		<textlabel
			Text={`shift=${args.shift.X},${args.shift.Y} place=${args.place.X},${args.place.Y},${args.place.Z} gap=${args.gap.Scale},${args.gap.Offset} spanY=${args.span.Y.Offset}`}
			Size={new UDim2(1, 0, 0, 24)}
			BackgroundTransparency={1}
			TextSize={14}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
