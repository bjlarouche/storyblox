import React from "@rbxts/react";

export default {
	title: "Fixture/Viewport Host",
	preview: { kind: "viewport", preset: "tablet" },
	render: () => (
		<part key="HostPart" Size={new Vector3(4, 4, 4)} Anchored={true} Color={new Color3(1, 0.4, 0.2)} />
	),
};
