import React from "@rbxts/react";
import { Input, Select } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

const options = [
	{ label: "Continue", value: "continue" },
	{ label: "Other", value: "other" },
];

interface Args {
	loading: boolean;
	reducedMotion: boolean;
	disabled: boolean;
	text: string;
	value: string;
}

function FieldLoadingStory(args: Args) {
	const [text, setText] = useArg(args.text);
	const [value, setValue] = useArg(args.value);
	return (
		<frame Size={new UDim2(0, 280, 0, 96)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 12)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<Input
				text={text}
				placeholder="Search"
				variant="outlined"
				width={new UDim(1, 0)}
				loading={args.loading}
				reducedMotion={args.reducedMotion}
				disabled={args.disabled}
				onTextChanged={setText}
			/>
			<Select
				value={value}
				options={options}
				placeholder="Pick"
				loading={args.loading}
				reducedMotion={args.reducedMotion}
				disabled={args.disabled}
				onChange={setValue}
			/>
		</frame>
	);
}

export default {
	title: "Components/Field Loading",
	args: { loading: true, reducedMotion: false, disabled: false, text: "Story", value: "continue" },
	argTypes: {
		loading: { type: "boolean" },
		reducedMotion: { type: "boolean" },
		disabled: { type: "boolean" },
		text: { type: "string" },
		value: { type: "enum", options: ["continue", "other"] },
	},
	render: (args: Args) => <FieldLoadingStory {...args} />,
};
