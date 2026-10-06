import React from "@rbxts/react";

export default {
	title: "Shell/Globals",
	description: "Render context receives globals and parameters.",
	globals: { brand: "storyblox" },
	parameters: { layout: "centered" },
	render: (_args: unknown, context?: { globals?: { brand?: string }; parameters?: { layout?: string } }) => {
		const brand = context?.globals?.brand ?? "?";
		const layout = context?.parameters?.layout ?? "?";
		return (
			<textlabel
				Size={new UDim2(0, 220, 0, 40)}
				BackgroundTransparency={1}
				Text={`${brand} · ${layout}`}
				TextSize={16}
				Font={Enum.Font.SourceSans}
				TextXAlignment={Enum.TextXAlignment.Center}
			/>
		);
	},
};
