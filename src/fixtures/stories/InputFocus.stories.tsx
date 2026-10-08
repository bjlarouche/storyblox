import React, { useState } from "@rbxts/react";
import { Input } from "@rbxts/uiblox";

function InputFocusStory() {
	const [text, setText] = useState("Ridge");
	return <Input text={text} placeholder="Name" onTextChanged={setText} />;
}

export default {
	title: "Components/InputFocus",
	render: () => <InputFocusStory />,
};
