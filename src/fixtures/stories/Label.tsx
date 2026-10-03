import React from "@rbxts/react";
import { labelColor } from "./Label.styles";
import { labelText } from "./labelText";

export function Label() {
	return (
		<textlabel
			Text={labelText}
			TextColor3={labelColor}
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			TextScaled={true}
		/>
	);
}
