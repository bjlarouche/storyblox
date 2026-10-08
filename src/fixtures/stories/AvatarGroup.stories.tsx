import React from "@rbxts/react";
import { AvatarGroup } from "./kitBreadth";

export default {
	title: "Components/AvatarGroup",
	render: () => (
		<AvatarGroup
			max={3}
			items={[{ name: "Ada North" }, { name: "Bea Shore" }, { name: "Cal West" }, { name: "Dee East" }]}
		/>
	),
};
