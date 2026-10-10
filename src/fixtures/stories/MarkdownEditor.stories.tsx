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

> This package is a work in progress.
> this is second line
> this is a third line
> this is a fourth line
>
> **Bold**, *italic*, \`code\`, and [links](https://example.com)

## Table

| Crew | Role | Watch |
| :--- | :---: | ---: |
| Ada | **Pilot** | 04:00 |
| Grace \\| Lin | Navigator | A longer watch note that wraps in the cell |

\`\`\`ts
const ok = true;
\`\`\`

---

Paste HTML into the edit pane and click **Paste HTML**.
`;

const HTML_SAMPLE = `<h1>From HTML</h1><p>Hello <strong>world</strong> and <em>friends</em>.</p><ul><li>One</li><li>Two</li></ul>`;

interface Args {
	mode: "split" | "edit" | "preview";
	fullscreen: boolean;
	resizable: boolean;
	height: number;
	value: string;
}

function MarkdownEditorStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	const [mode, setMode] = useArg(args.mode);
	const [fullscreen, setFullscreen] = useArg(args.fullscreen);
	const [height, setHeight] = useArg(args.height);
	return (
		<frame Size={fullscreen ? UDim2.fromScale(1, 1) : new UDim2(1, 0, 0, 600)} BorderSizePixel={0} BackgroundTransparency={1}>
			<MarkdownEditor
				value={value}
				onChange={setValue}
				mode={mode}
				onModeChange={setMode}
				fullscreen={fullscreen}
				onFullscreenChange={setFullscreen}
				resizable={args.resizable}
				height={height}
				minHeight={240}
				maxHeight={560}
				onHeightChange={setHeight}
			/>
		</frame>
	);
}

export default {
	title: "Inputs/Markdown",
	args: { mode: "split", fullscreen: false, resizable: true, height: 360, value: SAMPLE },
	argTypes: {
		mode: { type: "enum", options: ["split", "edit", "preview"] },
		fullscreen: { type: "boolean" },
		resizable: { type: "boolean" },
		height: { type: "number", min: 120, max: 680, step: 16 },
		value: { type: "string" },
	},
	// HTML_SAMPLE: paste into value then use Paste HTML → preview
	render: (args: Args) => <MarkdownEditorStory {...args} />,
};

export { HTML_SAMPLE };
