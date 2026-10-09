import React from "@rbxts/react";
import { Rating, useArg } from "./kitBreadth";

interface Args {
	value: number;
	max: number;
	size: "small" | "medium" | "large";
	disabled: boolean;
	readOnly: boolean;
}

function RatingStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 180, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={1} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Rating value={value} max={args.max} size={args.size} disabled={args.disabled} readOnly={args.readOnly} onChange={setValue} />
			</frame>
			<frame LayoutOrder={2} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Rating value={4} onChange={() => {}} />
			</frame>
			<frame LayoutOrder={3} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Rating value={2} disabled={true} onChange={() => {}} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Rating",
	preview: { kind: "gui", width: 220, height: 120 },
	args: { value: 3, max: 5, size: "medium", disabled: false, readOnly: false },
	argTypes: {
		value: { type: "number", min: 0, max: 5, step: 1 },
		max: { type: "number", min: 1, max: 10, step: 1 },
		size: { type: "enum", options: ["small", "medium", "large"] },
		disabled: { type: "boolean" },
		readOnly: { type: "boolean" },
	},
	render: (args: Args) => <RatingStory {...args} />,
};
