import React from "@rbxts/react";
import { EnumPicker, useArg } from "./kitBreadth";

interface Args {
	disabled: boolean;
}

function EnumPickerStory(args: Args) {
	const items = Enum.Font.GetEnumItems();
	const [value, setValue] = useArg(items[0]);
	return <EnumPicker value={value} items={items} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Controls/Enum Picker",
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <EnumPickerStory {...args} />,
};
