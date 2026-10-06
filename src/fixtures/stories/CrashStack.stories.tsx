import React from "@rbxts/react";
import { SafeBoundary } from "packages/ui/template";

function Boom(): React.Element {
	error("intentional deep crash");
}

function Nest({ depth }: { depth: number }): React.Element {
	return <frame BackgroundTransparency={1}>{depth > 0 ? <Nest depth={depth - 1} /> : <Boom />}</frame>;
}

export default {
	title: "Dev/Crash Stack",
	description: "Dev-only: deep throw; full stack scrolls, Retry stays pinned.",
	preview: { kind: "gui", width: 360, height: 220, background: new Color3(0.12, 0.14, 0.18) },
	render: () => (
		<SafeBoundary resetKey="stack">
			<Nest depth={30} />
		</SafeBoundary>
	),
};
