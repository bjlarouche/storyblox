import React, { useEffect, useRef } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { createStyles, makeStyles, Theme, WriteableStyle } from "@rbxts/uiblox";

const useViewportStyles = makeStyles((theme: Theme) =>
	createStyles({
		viewport: {
			Size: new UDim2(1, 0, 1, 0),
			BackgroundColor3: theme.palette.background.paper,
			BorderSizePixel: 0,
		} as WriteableStyle<ViewportFrame>,
		part: {
			Size: new Vector3(4, 4, 4),
			Anchored: true,
			Color: theme.palette.primary.main,
		} as WriteableStyle<Part>,
	}),
);

function SpinningPart() {
	const { viewport, part } = useViewportStyles();
	const frameRef = useRef<ViewportFrame>();
	const cameraRef = useRef<Camera>();
	const partRef = useRef<Part>();

	useEffect(() => {
		const frame = frameRef.current;
		const camera = cameraRef.current;
		if (frame && camera) frame.CurrentCamera = camera;
		const spin = RunService.Heartbeat.Connect((dt) => {
			const current = partRef.current;
			if (current) current.CFrame = current.CFrame.mul(CFrame.Angles(0, dt, 0));
		});
		return () => spin.Disconnect();
	}, []);

	return (
		<viewportframe key="ViewportFixture" ref={frameRef} {...viewport}>
			<camera ref={cameraRef} CFrame={CFrame.lookAt(new Vector3(0, 5, 10), Vector3.zero)} />
			<worldmodel>
				<part ref={partRef} {...part} />
			</worldmodel>
		</viewportframe>
	);
}

export default {
	title: "Fixture/Viewport React",
	component: SpinningPart,
	template: () => <SpinningPart />,
};
