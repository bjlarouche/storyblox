import React from "@rbxts/react";
import { ColorPicker, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function ColorStory(args: Args) {
	const [paint, setPaint] = useArg(Color3.fromRGB(51, 102, 153));
	return <ColorPicker value={paint} disabled={args.disabled} onChange={setPaint} />;
}

export default {
	title: "Controls/Color",
	description: "Color3 control with ColorPicker; reset restores the default paint.",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <ColorStory {...args} />,
};
