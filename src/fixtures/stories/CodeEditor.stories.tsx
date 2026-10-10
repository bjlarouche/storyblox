import React from "@rbxts/react";
import { CodeEditor, useArg } from "./kitBreadth";

const SAMPLES: { [key: string]: string } = {
	luau: "local function ready(count)\n\t-- gate\n\treturn count > 0\nend",
	ts: "function ready(count: number) {\n\t// gate\n\treturn count > 0;\n}",
	json: '{\n\t"ready": true,\n\t"count": 2\n}',
	text: "plain note\nno colors",
};

interface Args {
	language: "luau" | "ts" | "json" | "text";
}

function CodeEditorStory(args: Args) {
	const sample = SAMPLES[args.language] ?? SAMPLES.luau;
	const [value, setValue] = useArg(sample);
	return (
		<frame Size={new UDim2(0, 280, 0, 160)} BackgroundTransparency={1}>
			<CodeEditor value={value} onChange={setValue} language={args.language} placeholder="Code" />
		</frame>
	);
}

export default {
	title: "Inputs/Code",
	preview: { kind: "gui", width: 320, height: 200 },
	args: { language: "luau" },
	argTypes: {
		language: { type: "enum", options: ["luau", "ts", "json", "text"] },
	},
	render: (args: Args) => <CodeEditorStory {...args} />,
};
