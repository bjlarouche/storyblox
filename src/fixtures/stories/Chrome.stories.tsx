import React from "@rbxts/react";

export default {
	title: "Shell/Chrome",
	description: "Canvas zoom, grid, fit, remount, and theme toolbar.",
	preview: { kind: "frame", preset: "phone" as const },
	render: () => (
		<textlabel
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			Text="Use zoom / grid / fit"
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Center}
			TextYAlignment={Enum.TextYAlignment.Center}
		/>
	),
};
