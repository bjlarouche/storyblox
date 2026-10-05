import React from "@rbxts/react";
import { hostColor } from "./hostColor";

export default {
	title: "3D/Camera",
	preview: { kind: "viewport", preset: "tablet" },
	render: () => (
		<part key="HostPart" Size={new Vector3(4, 4, 4)} Anchored={true} Color={hostColor} />
	),
};
