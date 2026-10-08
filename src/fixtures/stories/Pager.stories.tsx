import React, { useState } from "@rbxts/react";
import { Pager } from "./kitBreadth";

const pages = ["Salt", "Twine", "Cork"];

function PagerStory() {
	const [index, setIndex] = useState(0);
	return (
		<Pager index={index} count={pages.size()} onChange={setIndex}>
			<textlabel Text={pages[index] ?? ""} Size={new UDim2(0, 80, 0, 24)} BackgroundTransparency={1} TextSize={16} />
		</Pager>
	);
}

export default {
	title: "Components/Pager",
	render: () => <PagerStory />,
};
