import React from "@rbxts/react";
import { Skeleton } from "./kit";

interface Args {
	variant: "text" | "rectangular" | "rounded" | "circular";
	animation: "pulse" | "shimmer" | "still";
	width: number;
	height: number;
	lines: number;
	gap: number;
	reducedMotion: boolean;
}

export default {
	title: "Feedback/Skeleton",
	args: {
		variant: "text",
		animation: "shimmer",
		width: 180,
		height: 14,
		lines: 3,
		gap: 16,
		reducedMotion: false,
	},
	argTypes: {
		variant: { type: "enum", options: ["text", "rectangular", "rounded", "circular"] },
		animation: { type: "enum", options: ["pulse", "shimmer", "still"] },
		width: { type: "number", control: "slider", min: 40, max: 280, step: 10 },
		height: { type: "number", control: "slider", min: 8, max: 80, step: 2 },
		lines: { type: "number", control: "slider", min: 1, max: 5, step: 1 },
		gap: { type: "number", control: "slider", min: 0, max: 32, step: 2 },
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
			const gradient = host?.FindFirstChildWhichIsA("UIGradient", true) as UIGradient | undefined;
			env.expect(gradient !== undefined, "reduced motion keeps static gradient");
			env.expect(
				gradient !== undefined && gradient.Offset.X === 0 && gradient.Offset.Y === 0,
				"reduced motion gradient is still",
			);
		},
	},
	preview: { kind: "gui", width: 240, height: 200 },
	render: (args: Args) => (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 220, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 12)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame key="SkeletonHost" LayoutOrder={1} Size={new UDim2(0, args.width, 0, 120)} BackgroundTransparency={1}>
				<Skeleton
					variant={args.variant}
					width={args.width}
					height={args.height}
					lines={args.variant === "text" ? args.lines : 1}
					gap={args.gap}
					animation={args.animation === "still" ? false : args.animation}
					reducedMotion={args.reducedMotion}
				/>
			</frame>
			<frame LayoutOrder={2} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Skeleton variant="rounded" width={120} height={36} animation={false} />
			</frame>
			<frame LayoutOrder={3} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Skeleton variant="circular" width={40} height={40} animation={false} />
			</frame>
		</frame>
	),
};
