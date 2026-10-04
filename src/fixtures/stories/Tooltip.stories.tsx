import React from "@rbxts/react";
import { Tooltip } from "./kit";

export default {
	title: "Components/Tooltip",
	template: () => (
		<Tooltip text="Hint">
			<textlabel
				Size={new UDim2(0, 80, 0, 24)}
				BackgroundTransparency={1}
				Text="Hover"
				TextSize={18}
				Font={Enum.Font.SourceSans}
			/>
		</Tooltip>
	),
};
