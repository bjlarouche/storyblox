import React from "@rbxts/react";
import { Markdown } from "@rbxts/uiblox";

export default {
	title: "Components/Markdown",
	render: () => (
		<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<Markdown
				value={"# A heading\n\nA longer sentence that wraps inside the padding.\n\n```luau\nlocal function ready()\n\treturn true\nend\n```\n\nSee the [north route](route) before dusk."}
			/>
		</frame>
	),
};
