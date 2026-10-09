import React from "@rbxts/react";
import { Markdown } from "@rbxts/uiblox";

export default {
	title: "Components/Markdown",
	render: () => (
		<frame Size={new UDim2(0, 220, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<Markdown value={"A longer sentence that wraps inside the padding.\n\nSee the [north route](route) before dusk."} />
		</frame>
	),
};
