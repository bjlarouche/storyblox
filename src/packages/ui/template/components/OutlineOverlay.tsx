import React from "@rbxts/react";
import { Theme } from "@rbxts/uiblox";
import { BoxRect, overlayLocal } from "packages/layoutTools";

export interface OutlineOverlayProps {
	theme: Theme;
	boxes: BoxRect[];
	measure?: boolean;
	origin?: BoxRect;
	scale?: number;
}

function OutlineOverlay({ theme, boxes, measure, origin, scale = 1 }: OutlineOverlayProps) {
	const stroke = theme.palette.primary.main;
	const labelColor = theme.palette.text.primary;
	const rows = new Array<React.Element>();
	for (let index = 0; index < boxes.size(); index++) {
		const raw = boxes[index];
		const box = origin !== undefined ? overlayLocal(raw, origin, scale) : raw;
		rows.push(
			<frame
				key={`outline-${index}`}
				Size={new UDim2(0, box.width, 0, box.height)}
				Position={new UDim2(0, box.x, 0, box.y)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				ZIndex={1000}
			>
				<uistroke Color={stroke} Thickness={1} Transparency={0.25} />
				{measure === true && (
					<textlabel
						key="Measure"
						Text={`${math.floor(box.width)}×${math.floor(box.height)}`}
						Size={new UDim2(0, 0, 0, 14)}
						AutomaticSize={Enum.AutomaticSize.X}
						Position={new UDim2(0, 2, 0, 2)}
						BackgroundTransparency={0.35}
						BackgroundColor3={theme.palette.surface.paper}
						BorderSizePixel={0}
						Font={theme.typography.fontFamilies.default}
						TextSize={11}
						TextColor3={labelColor}
						ZIndex={1001}
					/>
				)}
			</frame>,
		);
	}

	return (
		<frame key="OutlineOverlay" Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0} ZIndex={999}>
			{rows}
		</frame>
	);
}

export default OutlineOverlay;
