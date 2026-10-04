import React, { useState } from "@rbxts/react";
import { RadioGroup } from "./kit";

const options = [
	{ label: "Alpha", value: "alpha" },
	{ label: "Beta", value: "beta" },
];

function RadioStory() {
	const [value, setValue] = useState("alpha");
	return <RadioGroup value={value} options={options} onChange={setValue} />;
}

export default {
	title: "Components/RadioGroup",
	template: () => <RadioStory />,
};
