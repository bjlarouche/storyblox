import React from "@rbxts/react";
import { stylingGuide } from "fixtures/docs/stylingGuide";
import { MarkdownEditor, useArg } from "./kitBreadth";

interface Args {
	mode: "split" | "edit" | "preview";
}

function StylingGuideStory(args: Args) {
	const [value, setValue] = useArg(stylingGuide);
	const [mode, setMode] = useArg(args.mode);
	return (
		<frame Size={new UDim2(1, 0, 0, 420)} BorderSizePixel={0} BackgroundTransparency={1}>
			<MarkdownEditor value={value} onChange={setValue} mode={mode} onModeChange={setMode} />
		</frame>
	);
}

export default {
	title: "Docs/Styling",
	args: { mode: "preview" },
	argTypes: {
		mode: { type: "enum", options: ["split", "edit", "preview"] },
	},
	render: (args: Args) => <StylingGuideStory {...args} />,
};
