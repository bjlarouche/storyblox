import React from "@rbxts/react";
import { Rating, useArg } from "./kitBreadth";

interface Args {
	value: number;
	max: number;
	disabled: boolean;
}

function RatingStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return <Rating value={value} max={args.max} disabled={args.disabled} onChange={setValue} />;
}

export default {
	title: "Components/Rating",
	args: { value: 3, max: 5, disabled: false },
	argTypes: {
		value: { type: "number", min: 0, max: 5, step: 1 },
		max: { type: "number", min: 1, max: 10, step: 1 },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <RatingStory {...args} />,
};
