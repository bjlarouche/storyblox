import React from "@rbxts/react";
import { Input } from "@rbxts/uiblox";
import { useArg } from "./kit";

interface Args {
	text: string;
	placeholder: string;
	disabled: boolean;
	readOnly: boolean;
	hasError: boolean;
	variant: "filled" | "outlined" | "standard";
	color: "primary" | "secondary";
	helperText: string;
}

const sizes = ["small", "medium", "large"] as const;

function InputStory(args: Args) {
	const [text, setText] = useArg(args.text);
	return (
		<frame Size={new UDim2(0, 220, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={0} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<Input
					text={text}
					placeholder={args.placeholder}
					disabled={args.disabled}
					readOnly={args.readOnly}
					hasError={args.hasError}
					variant={args.variant}
					color={args.color}
					helperText={args.helperText === "" ? undefined : args.helperText}
					width={new UDim(1, 0)}
					onTextChanged={setText}
				/>
			</frame>
			{sizes.map((size, index) => (
				<frame key={size} LayoutOrder={index + 1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<Input text={size} variant="outlined" size={size} width={new UDim(1, 0)} onTextChanged={() => {}} />
				</frame>
			))}
			<frame LayoutOrder={4} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<Input text="" placeholder="Required" variant="outlined" size="medium" hasError helperText="Required" width={new UDim(1, 0)} onTextChanged={() => {}} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Input",
	preview: { kind: "gui", width: 260, height: 280 },
	args: { text: "Story", placeholder: "Search", disabled: false, readOnly: false, hasError: false, variant: "filled", color: "secondary", helperText: "Helper" },
	argTypes: {
		text: { type: "string" },
		placeholder: { type: "string" },
		disabled: { type: "boolean" },
		readOnly: { type: "boolean" },
		hasError: { type: "boolean" },
		variant: { type: "enum", options: ["filled", "outlined", "standard"] },
		color: { type: "enum", options: ["primary", "secondary"] },
		helperText: { type: "string" },
	},
	render: (args: Args) => <InputStory {...args} />,
};
