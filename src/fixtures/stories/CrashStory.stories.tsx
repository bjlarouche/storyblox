import React from "@rbxts/react";

export default {
	title: "Dev/Crash Story",
	description: "Dev-only: story render throws; canvas boundary must catch it.",
	preview: { kind: "gui", width: 320, height: 80, background: new Color3(0.12, 0.14, 0.18) },
	render: () => {
		error("intentional story crash");
		return <frame />;
	},
};
