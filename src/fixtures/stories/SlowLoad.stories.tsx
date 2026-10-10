import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";

const SLOW_SEC = 0.25;

export function slowStoryPause(seconds = SLOW_SEC) {
	task.wait(seconds);
}

function SlowFace() {
	const { theme } = useTheme();
	return (
		<textlabel
			Text="Slow story"
			Size={new UDim2(0, 160, 0, 24)}
			BackgroundTransparency={1}
			Font={theme.typography.fontFamilies.semibold}
			TextSize={theme.typography.fontSizes.body}
			TextColor3={theme.palette.text.primary}
		/>
	);
}

export default {
	title: "Shell/Slow load",
	tags: ["dev"],
	render: () => {
		slowStoryPause();
		return <SlowFace />;
	},
};
