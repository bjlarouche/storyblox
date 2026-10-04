import React, { useState } from "@rbxts/react";
import { Tabs } from "./kit";

const options = [
	{ label: "Left", value: "left" },
	{ label: "Right", value: "right" },
];

function TabsStory() {
	const [value, setValue] = useState("left");
	return <Tabs value={value} options={options} onChange={setValue} />;
}

export default {
	title: "Components/Tabs",
	template: () => <TabsStory />,
};
