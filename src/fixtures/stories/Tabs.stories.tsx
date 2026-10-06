import React from "@rbxts/react";
import { Tabs, useArg } from "./kit";

const options = [
	{ label: "Left", value: "left" },
	{ label: "Center", value: "center" },
	{ label: "Right", value: "right" },
];

interface Args {
	value: string;
	orientation: "horizontal" | "vertical";
	centered: boolean;
	disabled: boolean;
}

function TabsStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<frame
			Size={args.orientation === "vertical" ? new UDim2(0, 160, 0, 160) : new UDim2(0, 320, 0, 40)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
		>
			<Tabs
				value={value}
				options={options}
				orientation={args.orientation}
				centered={args.centered}
				disabled={args.disabled}
				onChange={setValue}
			/>
		</frame>
	);
}

export default {
	title: "Components/Tabs",
	args: { value: "left", orientation: "horizontal", centered: false, disabled: false },
	argTypes: {
		value: { type: "enum", options: ["left", "center", "right"], control: "radio" },
		orientation: { type: "enum", options: ["horizontal", "vertical"] },
		centered: { type: "boolean" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <TabsStory {...args} />,
};
