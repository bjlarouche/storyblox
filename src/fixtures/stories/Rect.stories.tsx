import React from "@rbxts/react";
import { RectEditor, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function RectStory(args: Args) {
	const [value, setValue] = useArg(new Rect(0, 0, 1, 1));
	return <RectEditor value={value} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/Rect",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <RectStory {...args} />,
};
