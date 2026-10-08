import React from "@rbxts/react";
import { Tooltip } from "./kitBreadth";

export default {
	title: "Components/TooltipTitle",
	render: () => (
		<Tooltip title="Sort the shelf" text="Featured, rating, or player count.">
			<textbutton Size={new UDim2(0, 96, 0, 28)} Text="Sort" />
		</Tooltip>
	),
};
