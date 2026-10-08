import React, { useState } from "@rbxts/react";
import { RangeSlider } from "./kitBreadth";

function RangeStory() {
	const [value, setValue] = useState({ start: 20, finish: 60 });
	return <RangeSlider min={0} max={100} step={1} value={value} onChange={setValue} />;
}

export default {
	title: "Components/RangeSlider",
	render: () => <RangeStory />,
};
