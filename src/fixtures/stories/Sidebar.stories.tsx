import React from "@rbxts/react";
import { Sidebar, TreeView } from "@rbxts/uiblox";

const tree = {
	title: "Places",
	branches: [
		{
			title: "Coast",
			leaves: [{ title: "Cove" }, { title: "A longer place name that stays on one line" }],
		},
	],
};

export default {
	title: "Components/Sidebar",
	render: () => (
		<frame Size={new UDim2(0, 200, 0, 180)} BackgroundTransparency={1}>
			<Sidebar size="large" ignoreInset>
				<TreeView tree={tree} selected="Coast/A longer place name that stays on one line" />
			</Sidebar>
		</frame>
	),
};
