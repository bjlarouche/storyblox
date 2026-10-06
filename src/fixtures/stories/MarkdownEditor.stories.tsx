import React from "@rbxts/react";
import { MarkdownEditor, useArg } from "./kitBreadth";

const SAMPLE = `# Markdown editor

Write on the left, preview on the right.

## Inline

**Bold**, *italic*, \`code\`, and [links](https://example.com).

## List

- One
- Two

1. First
2. Second

> A short quote

\`\`\`
const ok = true;
\`\`\`

---

Paste HTML into the edit pane and click **Paste HTML**.
`;

const HTML_SAMPLE = `<h1>From HTML</h1><p>Hello <strong>world</strong> and <em>friends</em>.</p><ul><li>One</li><li>Two</li></ul>`;

interface Args {
	mode: "split" | "edit" | "preview";
	fullscreen: boolean;
	value: string;
}

function MarkdownEditorStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	const [mode, setMode] = useArg(args.mode);
	const [fullscreen, setFullscreen] = useArg(args.fullscreen);
	return (
		<frame Size={fullscreen ? UDim2.fromScale(1, 1) : new UDim2(1, 0, 0, 360)} BorderSizePixel={0} BackgroundTransparency={1}>
			<MarkdownEditor
				value={value}
				onChange={setValue}
				mode={mode}
				onModeChange={setMode}
				fullscreen={fullscreen}
				onFullscreenChange={setFullscreen}
			/>
		</frame>
	);
}

export default {
	title: "Inputs/Markdown",
	args: { mode: "split", fullscreen: false, value: SAMPLE },
	argTypes: {
		mode: { type: "enum", options: ["split", "edit", "preview"] },
		fullscreen: { type: "boolean" },
		value: { type: "string" },
	},
	// HTML_SAMPLE: paste into value then use Paste HTML → preview
	render: (args: Args) => <MarkdownEditorStory {...args} />,
};

export { HTML_SAMPLE };
