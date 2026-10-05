import React from "@rbxts/react";
import { Skeleton } from "./kit";

interface Args {
	variant: "text" | "rectangular" | "rounded" | "circular";
	animation: "pulse" | "shimmer" | "still";
	width: number;
	height: number;
	lines: number;
	reducedMotion: boolean;
}

export default {
	title: "Feedback/Skeleton",
	args: {
		variant: "text",
		animation: "pulse",
		width: 180,
		height: 14,
		lines: 3,
		reducedMotion: false,
	},
	argTypes: {
		variant: { type: "enum", options: ["text", "rectangular", "rounded", "circular"] },
		animation: { type: "enum", options: ["pulse", "shimmer", "still"] },
		width: { type: "number", control: "slider", min: 40, max: 280, step: 10 },
		height: { type: "number", control: "slider", min: 8, max: 80, step: 2 },
		lines: { type: "number", control: "slider", min: 1, max: 5, step: 1 },
		reducedMotion: { type: "boolean" },
	},
	cases: {
		still: (env: {
			find: (name: string) => Instance | undefined;
			setArg: (name: string, value: unknown) => void;
			wait: () => void;
			expect: (ok: boolean, message: string) => void;
		}) => {
			env.setArg("animation", "shimmer");
			env.setArg("reducedMotion", true);
			env.wait();
			env.wait();
			const host = env.find("SkeletonHost");
			env.expect(host !== undefined, "host");
			env.expect(host?.FindFirstChildWhichIsA("UIGradient", true) === undefined, "reduced motion stays still");
		},
	},
	render: (args: Args) => (
		<frame key="SkeletonHost" Size={new UDim2(0, args.width, 0, 120)} BackgroundTransparency={1}>
			<Skeleton
				variant={args.variant}
				width={args.width}
				height={args.height}
				lines={args.variant === "text" ? args.lines : 1}
				animation={args.animation === "still" ? false : args.animation}
				reducedMotion={args.reducedMotion}
			/>
		</frame>
	),
};
