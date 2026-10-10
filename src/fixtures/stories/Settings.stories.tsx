import React, { useState } from "@rbxts/react";
import SettingsPanel from "../../packages/ui/storyblox/components/SettingsPanel";

function SettingsStory() {
	const [extra, setExtra] = useState("Workspace,Workspace.Stories");
	return <SettingsPanel extraRoots={extra} onExtraRootsChange={setExtra} onClose={() => undefined} />;
}

export default {
	title: "Shell/Settings",
	description: "Plugin story folders and extra scan paths.",
	render: () => <SettingsStory />,
};
