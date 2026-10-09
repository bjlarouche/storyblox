import React, { useState } from "@rbxts/react";
import { Checkbox } from "./kit";

function CheckboxFocusStory() {
	const [value, setValue] = useState(false);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 220, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={1} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Checkbox value={value} label="Keep the mark" onChange={setValue} />
			</frame>
			<frame LayoutOrder={2} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Checkbox value={true} label="Small" size="small" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={3} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Checkbox value={true} label="Medium" size="medium" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={4} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Checkbox value={true} label="Large" size="large" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={5} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Checkbox value={true} label="Disabled" size="medium" disabled={true} onChange={() => {}} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/CheckboxFocus",
	preview: { kind: "gui", width: 260, height: 220 },
	render: () => <CheckboxFocusStory />,
};
