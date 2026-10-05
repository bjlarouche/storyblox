import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import DocsPanel from "packages/ui/template/components/DocsPanel";

interface Args {
	label: string;
	count: number;
}

function DocsDemo(args: Args) {
	const { theme } = useTheme();
	return (
		<frame Size={new UDim2(1, 0, 0, 200)} BorderSizePixel={0}>
			<DocsPanel
				theme={theme}
				title="Shell/Docs"
				description="Docs pane with description and prop table."
				argTypes={{
					label: { type: "string", description: "Visible label" },
					count: { type: "number", control: "slider", description: "Item count" },
				}}
				source={`label=${args.label} count=${args.count}`}
			/>
		</frame>
	);
}

export default {
	title: "Shell/Docs",
	description: "Docs pane with description and prop table.",
	features: { docs: true },
	args: { label: "Hello", count: 3 },
	argTypes: {
		label: { type: "string", description: "Visible label" },
		count: { type: "number", control: "slider", min: 0, max: 10, description: "Item count" },
	},
	render: (args: Args) => <DocsDemo {...args} />,
};
