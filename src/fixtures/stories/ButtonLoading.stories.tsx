import React, { useState } from "@rbxts/react";
import { Button } from "./kit";

interface Args {
	text: string;
	variant: "contained" | "outlined" | "text";
	size: "small" | "medium" | "large";
	loading: boolean;
	loadingLabel: string;
	loadingPosition: "start" | "center" | "end";
	reducedMotion: boolean;
	disabled: boolean;
}

function LoadingStory(args: Args) {
	const [clicks, setClicks] = useState(0);
	return (
		<frame Size={new UDim2(0, 280, 0, 72)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, 12)}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<Button
				id="LoadButton"
				text={args.text}
				variant={args.variant}
				size={args.size}
				loading={args.loading}
				loadingLabel={args.loadingLabel === "" ? undefined : args.loadingLabel}
				loadingPosition={args.loadingPosition}
				reducedMotion={args.reducedMotion}
				disabled={args.disabled}
				onLeftClick={() => setClicks(clicks + 1)}
			/>
			<textlabel
				key="ClickCount"
				Text={tostring(clicks)}
				Size={new UDim2(0, 32, 0, 24)}
				BackgroundTransparency={1}
				TextSize={16}
				Font={Enum.Font.SourceSans}
			/>
		</frame>
	);
}

export default {
	title: "Components/Button Loading",
	args: {
		text: "Save",
		variant: "contained",
		size: "medium",
		loading: true,
		loadingLabel: "",
		loadingPosition: "center",
		reducedMotion: false,
		disabled: false,
	},
	argTypes: {
		text: { type: "string" },
		variant: { type: "enum", options: ["contained", "outlined", "text"] },
		size: { type: "enum", options: ["small", "medium", "large"] },
		loading: { type: "boolean" },
		loadingLabel: { type: "string" },
		loadingPosition: { type: "enum", options: ["start", "center", "end"] },
		reducedMotion: { type: "boolean" },
		disabled: { type: "boolean" },
	},
	cases: {
		loadingBlocks: (env: {
			find: (name: string) => Instance | undefined;
			setArg: (name: string, value: unknown) => void;
			wait: () => void;
			expect: (ok: boolean, message: string) => void;
		}) => {
			env.setArg("loading", false);
			env.setArg("disabled", false);
			env.wait();
			env.wait();
			const button = env.find("LoadButton") as TextButton | undefined;
			env.expect(button !== undefined, "button");
			const size = button?.AbsoluteSize;
			env.setArg("loading", true);
			env.wait();
			env.wait();
			env.expect(button?.Active === false, "no click while loading");
			env.expect(button?.AbsoluteSize.X === size?.X && button?.AbsoluteSize.Y === size?.Y, "size stays put");
			env.setArg("loading", false);
			env.wait();
			env.wait();
			env.expect(button?.Active === true, "clicks return");
		},
	},
	render: (args: Args) => <LoadingStory {...args} />,
};
