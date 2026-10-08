import React, { useState } from "@rbxts/react";
import { Slider } from "@rbxts/uiblox";

function SliderFocusStory() {
	const [value, setValue] = useState(40);
	return <Slider value={value} min={0} max={100} step={5} onChange={setValue} />;
}

export default {
	title: "Components/SliderFocus",
	render: () => <SliderFocusStory />,
};
