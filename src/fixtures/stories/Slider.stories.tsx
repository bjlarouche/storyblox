import React from "@rbxts/react";
import { Slider, useArg } from "./kit";

interface Args {
	value: number;
	min: number;
	max: number;
	step: number;
	disabled: boolean;
	marks: boolean;
	color: "primary" | "accent";
	size: "small" | "medium" | "large";
}

function SliderStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<Slider
			value={value}
			min={args.min}
			max={args.max}
			step={args.step}
			disabled={args.disabled}
			marks={args.marks}
			color={args.color}
			size={args.size}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Slider",
	args: { value: 40, min: 0, max: 100, step: 5, disabled: false, marks: true, color: "accent", size: "small" },
	argTypes: {
		value: { type: "number", control: "slider", min: 0, max: 100, step: 5 },
		min: { type: "number" },
		max: { type: "number" },
		step: { type: "number" },
		disabled: { type: "boolean" },
		marks: { type: "boolean" },
		color: { type: "enum", options: ["primary", "accent"] },
		size: { type: "enum", options: ["small", "medium", "large"] },
	},
	render: (args: Args) => <SliderStory {...args} />,
};
