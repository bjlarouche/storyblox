import React from "@rbxts/react";
import { AssetField, useArg } from "./kitBreadth";

interface Args {
	value: string;
	disabled: boolean;
}

function AssetFieldStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return <AssetField value={value} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/Asset Field",
	args: { value: "", disabled: false },
	argTypes: {
		value: { type: "string" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <AssetFieldStory {...args} />,
};
