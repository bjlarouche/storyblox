import React, { useState } from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import Controls from "../../packages/ui/template/components/Controls";

const ARG_TYPES = {
	label: { type: "string" },
	count: { type: "number" },
	enabled: { type: "boolean" },
	tone: { type: "enum", options: ["low", "high"] },
};

function ControlsStory() {
	const { theme } = useTheme();
	const [args, setArgs] = useState({ label: "Cove", count: 2, enabled: false, tone: "high" });
	return (
		<frame Size={new UDim2(0, 280, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
			<Controls
				theme={theme}
				args={args}
				argTypes={ARG_TYPES}
				onChange={(key, value) => setArgs((current) => ({ ...current, [key]: value }))}
				onReset={() => setArgs({ label: "Cove", count: 2, enabled: false, tone: "high" })}
			/>
		</frame>
	);
}

export default {
	title: "Chrome/Controls",
	preview: { kind: "gui", width: 280, height: 360 },
	render: () => <ControlsStory />,
};
