import React from "@rbxts/react";
import { Timeline } from "./kitBreadth";

export default {
	title: "Components/Timeline",
	render: () => (
		<frame Size={new UDim2(0, 220, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<Timeline
				items={[
					{ title: "Packed", caption: "Left the bay", tone: "done" },
					{
						title: "A longer stop name that stays on one line",
						caption: "The ridge route stays on one line too",
						tone: "active",
					},
					{ title: "Deliver", tone: "pending" },
				]}
			/>
		</frame>
	),
};
