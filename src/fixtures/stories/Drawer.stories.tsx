import React from "@rbxts/react";
import { Drawer, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	edge: "left" | "right";
}

function DrawerStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<Drawer open={open} edge={args.edge} onClose={() => setOpen(false)}>
			<textlabel Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} Text="Drawer" TextSize={16} Font={Enum.Font.SourceSans} />
		</Drawer>
	);
}

export default {
	title: "Components/Drawer",
	args: { open: true, edge: "left" },
	argTypes: {
		open: { type: "boolean" },
		edge: { type: "enum", options: ["left", "right"] },
	},
	render: (args: Args) => <DrawerStory {...args} />,
};
