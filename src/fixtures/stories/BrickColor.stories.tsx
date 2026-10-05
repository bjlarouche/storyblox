import React from "@rbxts/react";
import { BrickColorPicker, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function BrickColorStory(args: Args) {
	const [value, setValue] = useArg(new BrickColor("Bright red"));
	return <BrickColorPicker value={value} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/BrickColor",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <BrickColorStory {...args} />,
};
