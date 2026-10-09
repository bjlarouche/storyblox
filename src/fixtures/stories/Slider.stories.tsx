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
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 240, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={1} Size={new UDim2(1, 0, 0, 36)} BackgroundTransparency={1}>
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
			</frame>
			<frame LayoutOrder={2} Size={new UDim2(1, 0, 0, 28)} BackgroundTransparency={1}>
				<Slider value={30} min={0} max={100} size="small" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={3} Size={new UDim2(1, 0, 0, 40)} BackgroundTransparency={1}>
				<Slider value={70} min={0} max={100} size="large" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={4} Size={new UDim2(1, 0, 0, 32)} BackgroundTransparency={1}>
				<Slider value={40} min={0} max={100} size="medium" disabled={true} onChange={() => {}} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Slider",
	preview: { kind: "gui", width: 280, height: 180 },
	args: { value: 40, min: 0, max: 100, step: 5, disabled: false, marks: true, color: "accent", size: "medium" },
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
