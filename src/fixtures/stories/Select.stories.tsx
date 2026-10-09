import React from "@rbxts/react";
import { Select as SelectView, useArg } from "./kit";

const sizes = ["small", "medium", "large"] as const;

interface ErroredProps {
	value: string;
	options: Array<{ label: string; value: string }>;
	placeholder: string;
	size: "small" | "medium" | "large";
	hasError?: boolean;
	helperText?: string;
	onChange: (value: string) => void;
}

const Errored = SelectView as unknown as (props: ErroredProps) => React.Element;

const options = [
	{ label: "One", value: "one" },
	{ label: "Two", value: "two" },
];

interface Args {
	placeholder: string;
	value: string;
	disabled: boolean;
	mode: "default" | "empty" | "no-results";
}

function SelectStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	const empty = args.mode === "empty";
	const noResults = args.mode === "no-results";
	return (
		<frame Size={new UDim2(0, 220, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={0} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<SelectView
					value={empty ? "" : value}
					options={empty ? [] : options}
					placeholder={args.placeholder}
					disabled={args.disabled}
					searchable={noResults || undefined}
					defaultOpen={empty || noResults}
					defaultQuery={noResults ? "zzz" : undefined}
					onChange={setValue}
				/>
			</frame>
			{sizes.map((size, index) => (
				<frame key={size} LayoutOrder={index + 1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<SelectView value="" options={options} placeholder={size} size={size} onChange={() => {}} />
				</frame>
			))}
			<frame LayoutOrder={4} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<Errored value="" options={options} placeholder="Required" size="medium" hasError helperText="Required" onChange={() => {}} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Select",
	preview: { kind: "gui", width: 260, height: 280 },
	args: { placeholder: "Pick one", value: "", disabled: false, mode: "default" },
	argTypes: {
		placeholder: { type: "string" },
		value: { type: "enum", options: ["", "one", "two"] },
		disabled: { type: "boolean" },
		mode: { type: "enum", options: ["default", "empty", "no-results"] },
	},
	render: (args: Args) => <SelectStory {...args} />,
};
