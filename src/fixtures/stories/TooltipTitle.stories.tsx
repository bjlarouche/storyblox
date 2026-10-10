import React from "@rbxts/react";
import { Button } from "@rbxts/uiblox";
import { Tooltip } from "./kitBreadth";

export default {
	title: "Components/TooltipTitle",
	render: () => (
		<Tooltip title="Sort the shelf" text="Featured, rating, or player count.">
			<Button text="Sort" size="small" />
		</Tooltip>
	),
};
