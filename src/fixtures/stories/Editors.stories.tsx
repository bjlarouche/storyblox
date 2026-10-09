import React, { useState } from "@rbxts/react";
import { BrickColorPicker, FontEditor, RectEditor, VectorEditor } from "@rbxts/uiblox";

function Row(props: { order: number; children?: React.ReactNode }) {
	return (
		<frame
			LayoutOrder={props.order}
			Size={new UDim2(1, 0, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
		>
			{props.children}
		</frame>
	);
}

function Editors() {
	const [paint, setPaint] = useState<BrickColor>(new BrickColor("Institutional white"));
	const [vector, setVector] = useState<Vector2 | Vector3>(new Vector3(1, 2, 3));
	const [rect, setRect] = useState(new Rect(0, 0, 8, 8));
	const [face, setFace] = useState(Font.fromEnum(Enum.Font.Gotham));
	return (
		<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<Row order={0}>
				<BrickColorPicker value={paint} onChange={setPaint} />
			</Row>
			<Row order={1}>
				<VectorEditor value={vector} onChange={setVector} />
			</Row>
			<Row order={2}>
				<RectEditor value={rect} onChange={setRect} />
			</Row>
			<Row order={3}>
				<FontEditor value={face} onChange={setFace} />
			</Row>
		</frame>
	);
}

export default {
	title: "Components/Editors",
	preview: { kind: "gui", width: 320, height: 420 },
	render: () => <Editors />,
};
