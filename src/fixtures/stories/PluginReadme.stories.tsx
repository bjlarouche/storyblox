import React from "@rbxts/react";
import { pluginReadme } from "fixtures/docs/pluginReadme";
import { MarkdownEditor, useArg } from "./kitBreadth";

interface Args {
	mode: "split" | "edit" | "preview";
}

function PluginReadmeStory(args: Args) {
	const [value, setValue] = useArg(pluginReadme);
	const [mode, setMode] = useArg(args.mode);
	return (
		<frame Size={new UDim2(1, 0, 0, 420)} BorderSizePixel={0} BackgroundTransparency={1}>
			<MarkdownEditor value={value} onChange={setValue} mode={mode} onModeChange={setMode} />
		</frame>
	);
}

export default {
	title: "Docs/Plugin README",
	args: { mode: "preview" },
	argTypes: {
		mode: { type: "enum", options: ["split", "edit", "preview"] },
	},
	render: (args: Args) => <PluginReadmeStory {...args} />,
};
