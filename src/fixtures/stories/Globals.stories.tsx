import React from "@rbxts/react";

export default {
	title: "Shell/Globals",
	description: "Render context receives globals and parameters.",
	globals: { brand: "storyblox" },
	parameters: { layout: "centered" },
	render: (_args: unknown, context?: { globals?: { brand?: string; theme?: string; density?: string }; parameters?: { layout?: string } }) => {
		const brand = context?.globals?.brand ?? "?";
		const layout = context?.parameters?.layout ?? "?";
		const themeName = context?.globals?.theme ?? "?";
		const density = context?.globals?.density ?? "?";
		return (
			<textlabel
				Size={new UDim2(0, 280, 0, 40)}
				BackgroundTransparency={1}
				Text={`${brand} · ${layout} · ${themeName} · ${density}`}
				TextSize={16}
				Font={Enum.Font.SourceSans}
				TextXAlignment={Enum.TextXAlignment.Center}
			/>
		);
	},
};
