import React from "@rbxts/react";
import { Typography } from "@rbxts/uiblox";
import { SplitPane, useArg } from "./kit";

function pane(text: string) {
	return (
		<Typography
			text={text}
			variant="body"
			align="center"
			sx={{
				Size: UDim2.fromScale(1, 1),
				AutomaticSize: Enum.AutomaticSize.None,
				TextYAlignment: Enum.TextYAlignment.Center,
			}}
		/>
	);
}

interface Args {
	value: number;
	min: number;
	vertical: boolean;
}

function SplitStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<frame Size={new UDim2(1, 0, 0, 120)} BackgroundTransparency={1}>
			<SplitPane
				value={value}
				min={args.min}
				vertical={args.vertical}
				onChange={setValue}
				first={pane("First")}
				second={pane("Second")}
			/>
		</frame>
	);
}

export default {
	title: "Components/SplitPane",
	args: { value: 160, min: 80, vertical: false },
	argTypes: {
		value: { type: "number", control: "slider", min: 0, max: 400, step: 10 },
		min: { type: "number", control: "slider", min: 0, max: 200, step: 10 },
		vertical: { type: "boolean" },
	},
	render: (args: Args) => <SplitStory {...args} />,
};
