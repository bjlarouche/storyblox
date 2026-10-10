import React from "@rbxts/react";
import CanvasToolbar from "../../packages/ui/template/components/CanvasToolbar";

const noop = () => {};

function row(order: number, live: boolean) {
	return (
		<frame
			key={live ? "on" : "off"}
			LayoutOrder={order}
			Size={new UDim2(1, 0, 0, 36)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0, 4)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<CanvasToolbar
				zoom={live ? 1.5 : 1}
				fit={live}
				sizePick={live ? "phone" : undefined}
				orientation={live ? "landscape" : "portrait"}
				canOrient
				grid={live}
				outline={live}
				measure={live}
				bgStep={live ? 2 : 0}
				density={live ? "compact" : "comfortable"}
				dark={!live}
				inspectorOpen={live}
				settingsOpen={live}
				showInspector
				showSettings
				onZoom={noop}
				onFit={noop}
				onSize={noop}
				onOrient={noop}
				onGrid={noop}
				onOutline={noop}
				onMeasure={noop}
				onBackground={noop}
				onDensity={noop}
				onTheme={noop}
				onInspector={noop}
				onSettings={noop}
				onRemount={noop}
			/>
		</frame>
	);
}

export default {
	title: "Chrome/Toolbar",
	preview: { kind: "gui", width: 720, height: 96 },
	render: () => (
		<frame Size={new UDim2(1, 0, 0, 80)} BackgroundTransparency={1} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			{row(1, false)}
			{row(2, true)}
		</frame>
	),
};
