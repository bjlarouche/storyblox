import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";

interface Args {
	tiny: boolean;
}

function A11yDemo(args: Args) {
	const { theme } = useTheme();
	const size = args.tiny ? 16 : 32;
	return (
		<frame Size={new UDim2(0, 240, 0, 96)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} />
			<textbutton
				key="Tiny"
				Text="tiny"
				Size={new UDim2(0, size, 0, size)}
				BackgroundColor3={theme.palette.primary.main}
				TextColor3={theme.palette.text.primary}
				Selectable={false}
			/>
			<textbutton
				key="Empty"
				Text=""
				Size={new UDim2(0, 48, 0, 28)}
				BackgroundColor3={theme.palette.primary.main}
				TextColor3={theme.palette.text.primary}
			/>
			<textlabel
				key="Contrast"
				Text="low contrast"
				Size={new UDim2(0, 160, 0, 28)}
				BackgroundColor3={Color3.fromRGB(200, 200, 200)}
				TextColor3={Color3.fromRGB(180, 180, 180)}
				TextSize={theme.typography.fontSizes.caption}
				Font={theme.typography.fontFamilies.default}
			/>
		</frame>
	);
}

export default {
	title: "Shell/A11y",
	description: "A11y heuristics: Selectable, target size, empty label, contrast.",
	args: { tiny: true },
	argTypes: { tiny: { type: "boolean" } },
	render: (args: Args) => <A11yDemo {...args} />,
};
