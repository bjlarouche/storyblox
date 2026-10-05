import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { CircularProgress, LinearProgress } from "./kit";

interface Args {
	kind: "linear" | "circular";
	value: number;
	indeterminate: boolean;
	tone: "primary" | "text" | "inverse";
	reducedMotion: boolean;
	disabled: boolean;
	size: number;
}

function fillScale(root: Instance | undefined) {
	if (root === undefined) return undefined;
	let found: number | undefined;
	const walk = (instance: Instance) => {
		if (instance.IsA("Frame")) {
			const scale = instance.Size.X.Scale;
			if (scale > 0.05 && scale < 0.9) found = scale;
		}
		for (const child of instance.GetChildren()) walk(child);
	};
	walk(root);
	return found;
}

function ProgressStory(args: Args) {
	const { theme } = useTheme();
	const color =
		args.tone === "text"
			? theme.palette.text.primary
			: args.tone === "inverse"
				? theme.palette.text.inverse
				: theme.palette.primary.main;

	return (
		<frame key="ProgressHost" Size={new UDim2(0, 220, 0, 72)} BackgroundTransparency={1}>
			{args.kind === "circular" ? (
				<CircularProgress
					value={args.indeterminate ? undefined : args.value}
					size={args.size}
					color={color}
					reducedMotion={args.reducedMotion}
					disabled={args.disabled}
				/>
			) : (
				<LinearProgress
					value={args.value}
					indeterminate={args.indeterminate}
					reducedMotion={args.reducedMotion}
					disabled={args.disabled}
					className={{ Size: new UDim2(1, 0, 0, 8) }}
				/>
			)}
		</frame>
	);
}

export default {
	title: "Feedback/Progress",
	args: {
		kind: "circular",
		value: 0.4,
		indeterminate: true,
		tone: "primary",
		reducedMotion: false,
		disabled: false,
		size: 36,
	},
	argTypes: {
		kind: { type: "enum", options: ["linear", "circular"] },
		value: { type: "number", control: "slider", min: 0, max: 1, step: 0.05 },
		indeterminate: { type: "boolean" },
		tone: { type: "enum", options: ["primary", "text", "inverse"] },
		reducedMotion: { type: "boolean" },
		disabled: { type: "boolean" },
		size: { type: "number", control: "slider", min: 16, max: 72, step: 4 },
	},
	cases: {
		determinate: (env: {
			find: (name: string) => Instance | undefined;
			setArg: (name: string, value: unknown) => void;
			wait: () => void;
			expect: (ok: boolean, message: string) => void;
		}) => {
			env.setArg("kind", "linear");
			env.setArg("indeterminate", false);
			env.setArg("value", 0.25);
			env.setArg("reducedMotion", true);
			env.wait();
			env.wait();
			const scale = fillScale(env.find("ProgressHost"));
			env.expect(scale !== undefined && math.abs(scale - 0.25) < 0.02, "bar matches value");
		},
		paused: (env: {
			find: (name: string) => Instance | undefined;
			setArg: (name: string, value: unknown) => void;
			wait: () => void;
			expect: (ok: boolean, message: string) => void;
		}) => {
			env.setArg("kind", "linear");
			env.setArg("indeterminate", true);
			env.setArg("reducedMotion", true);
			env.wait();
			env.wait();
			const host = env.find("ProgressHost");
			let position = 1;
			const walk = (instance: Instance) => {
				if (instance.IsA("Frame") && instance.Size.X.Scale > 0.2 && instance.Size.X.Scale < 0.5) {
					position = instance.Position.X.Scale;
				}
				for (const child of instance.GetChildren()) walk(child);
			};
			if (host) walk(host);
			env.expect(position === 0, "reduced motion holds the bar");
		},
	},
	render: (args: Args) => <ProgressStory {...args} />,
};
