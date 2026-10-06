import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";

interface Args {
	label: string;
}

function ChromeDemo(args: Args) {
	const { theme } = useTheme();
	return (
		<textlabel
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			Text={args.label}
			TextColor3={theme.palette.text.primary}
			TextSize={theme.typography.fontSizes.body}
			Font={theme.typography.fontFamilies.default}
			TextXAlignment={Enum.TextXAlignment.Center}
			TextYAlignment={Enum.TextYAlignment.Center}
		/>
	);
}

export default {
	title: "Shell/Chrome",
	description: "Canvas zoom, grid, fit, remount, and theme toolbar.",
	preview: { kind: "frame", preset: "phone" as const },
	args: { label: "Use zoom / grid / fit" },
	argTypes: { label: { type: "string" } },
	render: (args: Args) => <ChromeDemo {...args} />,
};
