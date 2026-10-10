import React, { useState } from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import InspectorPane from "../../packages/ui/template/components/InspectorPane";

const ARG_TYPES = {
	label: { type: "string" },
	count: { type: "number" },
	enabled: { type: "boolean" },
	tone: { type: "enum", options: ["low", "high"] },
};

function InspectorStory() {
	const { theme } = useTheme();
	const [args, setArgs] = useState({ label: "Cove", count: 2, enabled: true, tone: "low" });
	return (
		<frame Size={new UDim2(0, 280, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
			<InspectorPane
				theme={theme}
				args={args}
				argTypes={ARG_TYPES}
				defaults={args}
				description="Story controls"
				onChange={(key, value) => setArgs((current) => ({ ...current, [key]: value }))}
				onReset={() => setArgs({ label: "Cove", count: 2, enabled: true, tone: "low" })}
				actions={{ events: [{ name: "onClick", values: ["Cove"] }], onReset: () => {} }}
				docs={{ title: "Chrome/Inspector", description: "Story controls", source: "return nil" }}
			/>
		</frame>
	);
}

export default {
	title: "Chrome/Inspector",
	preview: { kind: "gui", width: 280, height: 420 },
	render: () => <InspectorStory />,
};
