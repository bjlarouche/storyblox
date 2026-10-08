import React, { useState } from "@rbxts/react";
import { Checkbox } from "@rbxts/uiblox";

function CheckboxFocusStory() {
	const [value, setValue] = useState(false);
	return <Checkbox value={value} label="Keep the mark" onChange={setValue} />;
}

export default {
	title: "Components/CheckboxFocus",
	render: () => <CheckboxFocusStory />,
};
