import React, { useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";

const Switch = (
	Uiblox as unknown as {
		Switch: (props: {
			value: boolean;
			onChange: (value: boolean) => void;
			label?: string;
		}) => React.Element;
	}
).Switch;

function SwitchFocusStory() {
	const [value, setValue] = useState(true);
	return <Switch value={value} label="Enabled" onChange={setValue} />;
}

export default {
	title: "Components/SwitchFocus",
	render: () => <SwitchFocusStory />,
};
