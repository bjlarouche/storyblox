import React, { useState } from "@rbxts/react";
import { SplitPane } from "./kit";

function pane(text: string) {
	return (
		<textlabel
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			Text={text}
			TextSize={18}
			Font={Enum.Font.SourceSans}
		/>
	);
}

function SplitStory() {
	const [value, setValue] = useState(160);
	return (
		<frame Size={new UDim2(1, 0, 0, 120)} BackgroundTransparency={1}>
			<SplitPane value={value} onChange={setValue} first={pane("First")} second={pane("Second")} />
		</frame>
	);
}

export default {
	title: "Components/SplitPane",
	template: () => <SplitStory />,
};
