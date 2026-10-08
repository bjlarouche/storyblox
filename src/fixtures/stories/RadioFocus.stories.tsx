import React, { useState } from "@rbxts/react";
import { RadioGroup } from "./kit";

const options = [
	{ label: "Alpha", value: "alpha" },
	{ label: "Beta", value: "beta" },
];

function RadioFocusStory() {
	const [value, setValue] = useState("alpha");
	return <RadioGroup value={value} options={options} onChange={setValue} />;
}

export default {
	title: "Components/RadioFocus",
	render: () => <RadioFocusStory />,
};
