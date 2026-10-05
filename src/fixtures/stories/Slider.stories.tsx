import React from "@rbxts/react";
import { Slider, useArg } from "./kit";

interface Args {
	value: number;
	min: number;
	max: number;
	step: number;
	disabled: boolean;
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
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Slider",
	args: { value: 40, min: 0, max: 100, step: 5, disabled: false },
	argTypes: {
		value: { type: "number", control: "slider", min: 0, max: 100, step: 5 },
		min: { type: "number" },
		max: { type: "number" },
		step: { type: "number" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <SliderStory {...args} />,
};
