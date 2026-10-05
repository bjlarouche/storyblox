import React from "@rbxts/react";
import { PhysicalPropertiesEditor, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function PhysicalPropertiesStory(args: Args) {
	const [value, setValue] = useArg(new PhysicalProperties(0.7, 0.3, 0.5));
	return <PhysicalPropertiesEditor value={value} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/Physical Properties",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <PhysicalPropertiesStory {...args} />,
};
