import React, { useState } from "@rbxts/react";
import { Collapse } from "./kitBreadth";

function CollapseStory() {
	const [open, setOpen] = useState(true);
	return (
		<frame Size={new UDim2(0, 160, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			<textbutton
				Text={open ? "Hide" : "Show"}
				Size={new UDim2(0, 80, 0, 28)}
				BackgroundTransparency={1}
				TextSize={14}
				LayoutOrder={0}
				Event={{ Activated: () => setOpen(!open) }}
			/>
			<Collapse open={open}>
				<textlabel
					Text="The ridge stays lit."
					Size={new UDim2(1, 0, 0, 24)}
					BackgroundTransparency={1}
					TextSize={14}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			</Collapse>
		</frame>
	);
}

export default {
	title: "Components/Collapse",
	render: () => <CollapseStory />,
};
