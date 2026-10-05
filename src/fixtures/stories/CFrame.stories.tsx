import React from "@rbxts/react";
import { CFrameEditor, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function CFrameStory(args: Args) {
	const [value, setValue] = useArg(new CFrame());
	return <CFrameEditor value={value} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/CFrame",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <CFrameStory {...args} />,
};
