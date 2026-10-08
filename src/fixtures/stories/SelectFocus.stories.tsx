import React, { useState } from "@rbxts/react";
import { Select } from "@rbxts/uiblox";

const options = [
	{ label: "One", value: "one" },
	{ label: "Two", value: "two" },
];

function SelectFocusStory() {
	const [value, setValue] = useState("one");
	return <Select value={value} options={options} placeholder="Pick one" onChange={setValue} />;
}

export default {
	title: "Components/SelectFocus",
	render: () => <SelectFocusStory />,
};
