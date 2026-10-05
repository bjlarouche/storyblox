import React, { useEffect, useRef, useState } from "@rbxts/react";
import { RunService } from "@rbxts/services";

import {
	createReelFrames,
	destroyReelFrames,
	REEL_FRAME_SIZE,
	showReelFrame,
} from "./editableImageReel";

type Args = {
	fps: number;
	frameCount: number;
	paused: boolean;
	holdFrame: number;
};

function Reel({ fps, frameCount, paused, holdFrame }: Args) {
	const labelRef = useRef<ImageLabel>();
	const framesRef = useRef<EditableImage[]>([]);
	const indexRef = useRef(0);
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const frames = createReelFrames(frameCount);
		framesRef.current = frames;
		indexRef.current = 0;
		setIndex(0);
		const label = labelRef.current;
		if (label) showReelFrame(label, frames, 0);

		return () => {
			destroyReelFrames(frames);
			if (framesRef.current === frames) framesRef.current = [];
		};
	}, [frameCount]);

	useEffect(() => {
		const label = labelRef.current;
		const frames = framesRef.current;
		if (!label || frames.size() === 0) return;

		const hold = math.floor(holdFrame);
		if (hold >= 1) {
			const clamped = math.clamp(hold, 1, frames.size()) - 1;
			indexRef.current = clamped;
			setIndex(clamped);
			showReelFrame(label, frames, clamped);
			return;
		}

		showReelFrame(label, frames, indexRef.current);

		if (paused) return;

		const step = 1 / math.max(fps, 0.1);
		let elapsed = 0;
		const conn = RunService.Heartbeat.Connect((dt) => {
			elapsed += dt;
			if (elapsed < step) return;
			elapsed -= step;
			const nextIndex = (indexRef.current + 1) % frames.size();
			indexRef.current = nextIndex;
			setIndex(nextIndex);
			showReelFrame(label, frames, nextIndex);
		});
		return () => conn.Disconnect();
	}, [fps, paused, holdFrame, frameCount]);

	return (
		<frame key="EditableImageReel" Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<imagelabel
				key="ReelFrame"
				ref={labelRef}
				Size={UDim2.fromOffset(REEL_FRAME_SIZE * 3, REEL_FRAME_SIZE * 3)}
				Position={new UDim2(0.5, 0, 0.5, -12)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={Color3.fromRGB(12, 12, 16)}
				BorderSizePixel={0}
				ScaleType={Enum.ScaleType.Fit}
			/>
			<textlabel
				key="ReelStatus"
				Text={`frame ${index + 1}/${math.clamp(math.floor(frameCount), 2, 8)}${paused ? " paused" : ""}${
					holdFrame >= 1 ? " hold" : ""
				}`}
				Size={new UDim2(1, 0, 0, 20)}
				Position={new UDim2(0, 0, 1, -24)}
				BackgroundTransparency={1}
				TextSize={14}
				Font={Enum.Font.SourceSans}
				TextColor3={Color3.fromRGB(220, 220, 230)}
			/>
		</frame>
	);
}

export default {
	title: "Examples/EditableImage Reel",
	args: {
		fps: 4,
		frameCount: 3,
		paused: false,
		holdFrame: 0,
	},
	argTypes: {
		fps: { type: "number", control: "slider", min: 1, max: 12, step: 1 },
		frameCount: { type: "number", control: "slider", min: 2, max: 8, step: 1 },
		paused: { type: "boolean" },
		holdFrame: {
			type: "number",
			control: "slider",
			min: 0,
			max: 8,
			step: 1,
			description: "0 = play; 1..N holds that frame for captures",
		},
	},
	render: (args: Args) => <Reel {...args} />,
};
