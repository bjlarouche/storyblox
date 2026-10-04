import React from "@rbxts/react";
import { Label } from "./Label";

export default {
	title: "Fixture/Styled",
	component: Label,
	template: () => (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<uilistlayout Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Label />
			<Label variant="secondary" />
			<Label variant="error" />
			<Label emphasis={true} />
		</frame>
	),
};
