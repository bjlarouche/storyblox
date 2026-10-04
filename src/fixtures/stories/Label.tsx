import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { labelColor } from "./Label.styles";
import { labelText } from "./labelText";

export function Label() {
	const { theme } = useTheme();
	return (
		<textlabel
			Text={labelText}
			TextColor3={labelColor(theme)}
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			TextScaled={true}
		/>
	);
}
