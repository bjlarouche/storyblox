import React from "@rbxts/react";
import { NumberRangeEditor, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function NumberRangeStory(args: Args) {
	const [value, setValue] = useArg(new NumberRange(0, 1));
	return <NumberRangeEditor value={value} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/Number Range",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <NumberRangeStory {...args} />,
};
