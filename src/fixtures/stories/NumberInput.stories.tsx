import React, { useState } from "@rbxts/react";
import { NumberInput } from "@rbxts/uiblox";

const sizes = ["small", "medium", "large"] as const;

function Field(props: { order: number; size: "small" | "medium" | "large"; disabled?: boolean }) {
	const [value, setValue] = useState(4);
	return (
		<frame LayoutOrder={props.order} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<NumberInput
				value={value}
				min={0}
				max={12}
				step={1}
				size={props.size}
				stepper
				disabled={props.disabled}
				width={new UDim(0, 96)}
				onChange={setValue}
			/>
		</frame>
	);
}

export default {
	title: "Components/Number Input",
	preview: { kind: "gui", width: 280, height: 180 },
	render: () => (
		<frame Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			{sizes.map((size, index) => (
				<Field key={size} order={index} size={size} />
			))}
			<Field order={3} size="medium" disabled />
		</frame>
	),
};
