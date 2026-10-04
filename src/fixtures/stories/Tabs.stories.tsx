import React from "@rbxts/react";
import { Tabs, useArg } from "./kit";

const options = [
	{ label: "Left", value: "left" },
	{ label: "Right", value: "right" },
];

function TabsStory(args: { value: string }) {
	const [value, setValue] = useArg(args.value);
	return <Tabs value={value} options={options} onChange={setValue} />;
}

export default {
	title: "Components/Tabs",
	args: { value: "left" },
	argTypes: { value: { type: "enum", options: ["left", "right"], control: "radio" } },
	render: (args: { value: string }) => <TabsStory {...args} />,
};
