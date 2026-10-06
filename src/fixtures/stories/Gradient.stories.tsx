import React from "@rbxts/react";
import { GradientEditor, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function GradientStory(args: Args) {
	const [value, setValue] = useArg({
		color: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(255, 80, 80)),
			new ColorSequenceKeypoint(0.5, Color3.fromRGB(80, 160, 255)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(255, 220, 80)),
		]),
		transparency: new NumberSequence([
			new NumberSequenceKeypoint(0, 0),
			new NumberSequenceKeypoint(1, 0.35),
		]),
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
