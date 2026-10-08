import React, { useState } from "@rbxts/react";
import { Typography } from "@rbxts/uiblox";
import { Pager } from "./kitBreadth";

const pages = ["Salt", "Twine", "Cork"];

function PagerStory() {
	const [index, setIndex] = useState(0);
	return (
		<Pager index={index} count={pages.size()} onChange={setIndex}>
			<Typography text={pages[index] ?? ""} sx={{ Size: new UDim2(0, 80, 0, 24) }} />
		</Pager>
	);
}

export default {
	title: "Components/Pager",
	render: () => <PagerStory />,
};
