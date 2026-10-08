import React from "@rbxts/react";
import { Timeline } from "./kitBreadth";

export default {
	title: "Components/Timeline",
	render: () => (
		<Timeline
			items={[
				{ title: "Packed", caption: "Left the bay", tone: "done" },
				{ title: "On the road", caption: "Ridge route", tone: "active" },
				{ title: "Deliver", tone: "pending" },
			]}
		/>
	),
};
