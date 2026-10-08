import React, { useState } from "@rbxts/react";
import { Button, Typography } from "@rbxts/uiblox";
import { Collapse } from "./kitBreadth";

function CollapseStory() {
	const [open, setOpen] = useState(true);
	return (
		<frame Size={new UDim2(0, 160, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Button text={open ? "Hide" : "Show"} variant="text" sx={{ LayoutOrder: 0 }} onLeftClick={() => setOpen(!open)} />
			<Collapse open={open}>
				<Typography text="The ridge stays lit." />
			</Collapse>
		</frame>
	);
}

export default {
	title: "Components/Collapse",
	render: () => <CollapseStory />,
};
