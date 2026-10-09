import React from "@rbxts/react";
import { RadioGroup, useArg } from "./kit";

interface Args {
	options: string[];
	value: string;
	disabled: boolean;
	row: boolean;
	size: "small" | "medium" | "large";
}

function RadioStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	const options = args.options.map((option) => ({ label: option, value: option }));
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 280, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 12)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={1} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<RadioGroup
					value={value}
					options={options}
					disabled={args.disabled}
					row={args.row}
					size={args.size}
					onChange={setValue}
				/>
			</frame>
			<frame LayoutOrder={2} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<RadioGroup value="a" options={[{ label: "Small", value: "a" }]} size="small" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={3} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<RadioGroup value="a" options={[{ label: "Large", value: "a" }]} size="large" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={4} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<RadioGroup
					value="a"
					options={[{ label: "Disabled", value: "a" }]}
					size="medium"
					disabled={true}
					onChange={() => {}}
				/>
			</frame>
		</frame>
	);
}

export default {
	title: "Components/RadioGroup",
	preview: { kind: "gui", width: 320, height: 220 },
	args: { options: ["alpha", "beta", "gamma"], value: "alpha", disabled: false, row: true, size: "medium" },
	argTypes: {
		options: { type: "array", item: { type: "string" } },
		value: { type: "string" },
		disabled: { type: "boolean" },
		row: { type: "boolean" },
		size: { type: "enum", options: ["small", "medium", "large"] },
	},
	render: (args: Args) => <RadioStory {...args} />,
};
