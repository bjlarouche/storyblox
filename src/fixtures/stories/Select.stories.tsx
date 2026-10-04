import React, { useState } from "@rbxts/react";
import { Select } from "./kit";

const options = [
	{ label: "One", value: "one" },
	{ label: "Two", value: "two" },
];

function SelectStory() {
	const [value, setValue] = useState("one");
	return <Select value={value} options={options} onChange={setValue} />;
}

export default {
	title: "Components/Select",
	template: () => <SelectStory />,
};
