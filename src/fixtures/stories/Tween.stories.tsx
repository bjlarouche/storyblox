import React, { useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { createStyles, makeStyles, Theme, WriteableStyle } from "@rbxts/uiblox";
import { BounceState, clampState, nextLeg, seedState } from "./bounceMath";

export interface TweenArgs {
	speed: number;
	size: number;
	easing: Enum.EasingStyle;
	squash: boolean;
	paused: boolean;
	seed: number;
}

const SQUASH_TIME = 0.08;
const EASING_OPTIONS = ["Linear", "Sine", "Quad", "Cubic", "Back", "Bounce"];

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		canvas: {
			Size: new UDim2(1, 0, 1, 0),
			BackgroundColor3: theme.palette.surface.paper,
			BorderSizePixel: 0,
		} as WriteableStyle<Frame>,
		ball: {
			AnchorPoint: new Vector2(0.5, 0.5),
			BorderSizePixel: 0,
			BackgroundColor3: theme.palette.primary.main,
		} as WriteableStyle<Frame>,
	}),
);

function mark(ball: Frame, phase: string, state: BounceState) {
	ball.SetAttribute("storybloxBouncePhase", phase);
	ball.SetAttribute("storybloxBounceX", state.x);
	ball.SetAttribute("storybloxBounceY", state.y);
}

function BounceScene(args: TweenArgs) {
	const { canvas, ball: ballStyle } = useStyles();
	const canvasRef = useRef<Frame>();
	const ballRef = useRef<Frame>();
	const diameter = math.max(args.size, 8);

	useEffect(() => {
		const host = canvasRef.current;
		const ball = ballRef.current;
		if (!host || !ball) return;

		let alive = true;
		let state: BounceState = seedState(args.seed, host.AbsoluteSize.X, host.AbsoluteSize.Y, diameter / 2);
		let tween: Tween | undefined;
		let completed: RBXScriptConnection | undefined;
		let resize: RBXScriptConnection | undefined;

		const stopTween = () => {
			if (completed !== undefined) {
				completed.Disconnect();
				completed = undefined;
			}
			if (tween !== undefined) {
				tween.Cancel();
				tween.Destroy();
				tween = undefined;
			}
		};

		const place = (incoming: BounceState, phase: string) => {
			state = clampState(incoming, host.AbsoluteSize.X, host.AbsoluteSize.Y, diameter / 2);
			ball.Position = UDim2.fromOffset(state.x, state.y);
			ball.Size = UDim2.fromOffset(diameter, diameter);
			mark(ball, phase, state);
		};

		const runLeg = () => {
			if (!alive) return;
			stopTween();
			state = clampState(state, host.AbsoluteSize.X, host.AbsoluteSize.Y, diameter / 2);
			ball.Position = UDim2.fromOffset(state.x, state.y);
			ball.Size = UDim2.fromOffset(diameter, diameter);

			// Reduced-motion hook: speed 0 or paused freezes at a known seed/current state.
			if (args.paused || args.speed <= 0) {
				mark(ball, args.paused ? "paused" : "idle", state);
				return;
			}

			const leg = nextLeg(state, host.AbsoluteSize.X, host.AbsoluteSize.Y, diameter / 2, args.speed);
			if (leg.duration <= 0) {
				state = { x: leg.x, y: leg.y, vx: leg.vx, vy: leg.vy };
				place(state, "idle");
				return;
			}

			mark(ball, "moving", state);
			const info = new TweenInfo(leg.duration, args.easing, Enum.EasingDirection.Out, 0, false, 0);
			tween = TweenService.Create(ball, info, { Position: UDim2.fromOffset(leg.x, leg.y) });
			completed = tween.Completed.Connect((playback) => {
				if (!alive || playback !== Enum.PlaybackState.Completed) return;
				state = { x: leg.x, y: leg.y, vx: leg.vx, vy: leg.vy };
				mark(ball, "impact", state);
				if (!args.squash) {
					runLeg();
					return;
				}
				stopTween();
				const flatX = leg.hitX !== 0 ? diameter * 0.7 : diameter * 1.15;
				const flatY = leg.hitY !== 0 ? diameter * 0.7 : diameter * 1.15;
				ball.Size = UDim2.fromOffset(flatX, flatY);
				const restore = new TweenInfo(SQUASH_TIME, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
				tween = TweenService.Create(ball, restore, { Size: UDim2.fromOffset(diameter, diameter) });
				completed = tween.Completed.Connect((squashPlayback) => {
					if (!alive || squashPlayback !== Enum.PlaybackState.Completed) return;
					runLeg();
				});
				tween.Play();
			});
			tween.Play();
		};

		place(state, args.paused || args.speed <= 0 ? (args.paused ? "paused" : "idle") : "start");
		resize = host.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
			if (!alive) return;
			state = clampState(state, host.AbsoluteSize.X, host.AbsoluteSize.Y, diameter / 2);
			ball.Position = UDim2.fromOffset(state.x, state.y);
			runLeg();
		});
		runLeg();

		return () => {
			if (!alive) return;
			alive = false;
			stopTween();
			if (resize !== undefined) resize.Disconnect();
		};
	}, [args.speed, args.size, args.easing, args.squash, args.paused, args.seed, diameter]);

	return (
		<frame key="BounceCanvas" ref={canvasRef} {...canvas}>
			<frame key="BounceBall" ref={ballRef} {...ballStyle} Size={UDim2.fromOffset(diameter, diameter)}>
				<uicorner key="Round" CornerRadius={new UDim(1, 0)} />
			</frame>
		</frame>
	);
}

export default {
	title: "Animation/Bouncing Ball",
	description: "Theme-aware ball bouncing on TweenService legs. Dev fixture.",
	args: {
		speed: 180,
		size: 40,
		easing: Enum.EasingStyle.Linear,
		squash: true,
		paused: false,
		seed: 1,
	} satisfies TweenArgs,
	argTypes: {
		speed: { type: "number", control: "slider", min: 0, max: 480, step: 10 },
		size: { type: "number", control: "slider", min: 16, max: 96, step: 4 },
		easing: { type: "EnumItem", enumType: "EasingStyle", options: EASING_OPTIONS },
		squash: { type: "boolean" },
		paused: { type: "boolean" },
		seed: { type: "number", control: "slider", min: 0, max: 12, step: 1 },
	},
	cases: {
		pausedSeed: (env: {
			find: (name: string) => Instance | undefined;
			setArg: (name: string, value: unknown) => void;
			wait: () => void;
			expect: (ok: boolean, message: string) => void;
		}) => {
			env.setArg("paused", true);
			env.setArg("seed", 0);
			env.setArg("speed", 180);
			env.wait();
			const ball = env.find("BounceBall") as Frame | undefined;
			env.expect(ball !== undefined, "ball");
			env.expect(ball?.GetAttribute("storybloxBouncePhase") === "paused", "paused phase");
			const x = ball?.GetAttribute("storybloxBounceX");
			const y = ball?.GetAttribute("storybloxBounceY");
			env.expect(typeOf(x) === "number" && typeOf(y) === "number", "position attrs");
		},
	},
	render: (args: TweenArgs) => <BounceScene {...args} />,
};
