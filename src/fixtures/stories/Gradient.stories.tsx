import React from "@rbxts/react";
import { GradientEditor, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function GradientStory(args: Args) {
	const [value, setValue] = useArg({
		color: new ColorSequence(new Color3(1, 1, 1)),
		transparency: new NumberSequence(0),
		rotation: 0,
		offset: new Vector2(),
		enabled: true,
	});
	return <GradientEditor value={value} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/Gradient",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <GradientStory {...args} />,
};
