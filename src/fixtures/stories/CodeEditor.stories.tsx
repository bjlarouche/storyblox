import React from "@rbxts/react";
import { CodeEditor, useArg } from "./kitBreadth";

const SAMPLE = `local function ready()
	return true
end`;

function CodeEditorStory() {
	const [value, setValue] = useArg(SAMPLE);
	const [language, setLanguage] = useArg("luau");
	return (
		<frame Size={new UDim2(1, 0, 0, 180)} BackgroundTransparency={1}>
			<CodeEditor value={value} onChange={setValue} language={language} onLanguageChange={setLanguage} placeholder="Code" />
		</frame>
	);
}

export default {
	title: "Inputs/Code",
	render: () => <CodeEditorStory />,
};
