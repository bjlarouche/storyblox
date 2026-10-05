import React from "@rbxts/react";
import { StoryToolHost } from "packages/defineStory";
import { hostColor } from "./hostColor";

export default {
	title: "3D/Camera",
	preview: { kind: "viewport", preset: "tablet" },
	tools: (host: StoryToolHost) => [
		{ id: "orbit", label: "Orbit", onClick: () => host.orbit() },
		{ id: "cam-reset", label: "Cam reset", onClick: () => host.resetCamera() },
	],
	render: () => (
		<part key="HostPart" Size={new Vector3(4, 4, 4)} Anchored={true} Color={hostColor} />
	),
};
