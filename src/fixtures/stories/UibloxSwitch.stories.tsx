import React from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import { useArg } from "./kit";

interface Args {
	value: boolean;
	disabled: boolean;
	label: string;
	size: "small" | "medium" | "large";
}

const Switch = (
	Uiblox as unknown as {
		Switch: (props: {
			value: boolean;
			onChange: (value: boolean) => void;
			disabled?: boolean;
			label?: string;
			size?: "small" | "medium" | "large";
		}) => React.Element;
	}
).Switch;

function SwitchStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<Switch
			value={value}
			disabled={args.disabled}
			label={args.label}
			size={args.size}
			onChange={setValue}
		/>
	);
}

export default {
	title: "Components/Switch",
	args: { value: true, disabled: false, label: "Enabled", size: "medium" },
	argTypes: {
		value: { type: "boolean" },
		disabled: { type: "boolean" },
		label: { type: "string" },
		size: { type: "enum", options: ["small", "medium", "large"] },
	},
	render: (args: Args) => <SwitchStory {...args} />,
};
