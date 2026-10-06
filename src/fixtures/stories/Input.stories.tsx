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
}

function InputStory(args: Args) {
	const [text, setText] = useArg(args.text);
	return (
		<Input
			text={text}
			placeholder={args.placeholder}
			disabled={args.disabled}
			readOnly={args.readOnly}
			hasError={args.hasError}
			variant={args.variant}
			width={new UDim(1, 0)}
			onTextChanged={setText}
		/>
	);
}

export default {
	title: "Components/Input",
	args: { text: "Story", placeholder: "Search", disabled: false, readOnly: true, hasError: false, variant: "filled" },
	argTypes: {
		text: { type: "string" },
		placeholder: { type: "string" },
		disabled: { type: "boolean" },
		readOnly: { type: "boolean" },
		hasError: { type: "boolean" },
		variant: { type: "enum", options: ["filled", "outlined", "standard"] },
	},
	render: (args: Args) => <InputStory {...args} />,
};
