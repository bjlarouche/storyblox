import Roact from "@rbxts/roact";
import { hooked, useState } from "@rbxts/roact-hooked";
import { CustomizedProps } from "@rbxts/uiblox";
import useCanvasStyles from "./Canvas.styles";

type DefaultCanvasComponent = Frame;

export interface CanvasProps {}

const Canvas = hooked<CustomizedProps<DefaultCanvasComponent, CanvasProps>>((props) => {
	const { className, [Roact.Children]: children } = props;
	const { root, scrollable, pageLayout, padding } = useCanvasStyles();

	const [canvasSize, setCanvasSize] = useState<UDim2>(new UDim2(0, 0, 0, 0));

	return (
		<frame Key="Canvas" {...root} {...className}>
			<scrollingframe
				Key="Scrollable"
				{...scrollable}
				CanvasSize={canvasSize}
				Event={{
					ChildAdded: (scrollingFrame, child) => {
						if (child.IsA("Frame")) {
							const xSize = child.AbsoluteSize.X <= scrollingFrame.AbsoluteCanvasSize.X ? 0 : child.AbsoluteSize.X;
							const ySize = child.AbsoluteSize.Y <= scrollingFrame.AbsoluteCanvasSize.Y ? 0 : child.AbsoluteSize.Y;

							setCanvasSize(new UDim2(0, xSize, 0, ySize));
						}
					},
					ChildRemoved: (_, child) => {
						if (child.IsA("Frame")) {
							try {
								setCanvasSize(new UDim2(0, 0, 0, 0));
							} catch {
								// Component is unmounting. Do nothing.
							}
						}
					},
				}}
			>
				<uipagelayout Key="PageLayout" {...pageLayout} />
				<uipadding Key="Padding" {...padding} />
				{children}
			</scrollingframe>
		</frame>
	);
});

export default Canvas;
