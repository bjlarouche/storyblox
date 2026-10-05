import React from "@rbxts/react";
import { RayEditor, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function RayStory(args: Args) {
	const [value, setValue] = useArg(new Ray(new Vector3(), new Vector3(0, 1, 0)));
	return <RayEditor value={value} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/Ray",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <RayStory {...args} />,
};
