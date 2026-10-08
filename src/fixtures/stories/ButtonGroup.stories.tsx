import React, { useState } from "@rbxts/react";
import { Typography } from "@rbxts/uiblox";
import { ButtonGroup } from "./kitBreadth";

function GroupStory() {
	const [picked, setPicked] = useState("None");
	return (
		<frame Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<ButtonGroup
				items={[{ label: "Cut" }, { label: "Copy" }, { label: "Paste" }]}
				onItem={(index: number) => {
					const labels = ["Cut", "Copy", "Paste"];
					setPicked(labels[index] ?? "None");
				}}
			/>
			<Typography text={picked} sx={{ LayoutOrder: 1, Size: new UDim2(0, 80, 0, 20) }} />
		</frame>
	);
}

export default {
	title: "Components/ButtonGroup",
	render: () => <GroupStory />,
};
