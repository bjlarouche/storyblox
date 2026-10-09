import React from "@rbxts/react";
import { Sparkline } from "@rbxts/uiblox";

export default {
	title: "Components/Sparkline",
	render: () => (
		<frame Size={new UDim2(0, 120, 0, 36)} BackgroundTransparency={1}>
			<Sparkline values={[2, 9, 4, 12, 3, 8]} width={120} height={36} area mark={5} />
		</frame>
	),
};
