import React from "@rbxts/react";
import { Drawer, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	edge: "left" | "right";
	width: number;
}

function DrawerStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<>
			{!open && (
				<textbutton
					Size={new UDim2(0, 120, 0, 28)}
					Text="Open drawer"
					Event={{ Activated: () => setOpen(true) }}
				/>
			)}
			<Drawer
				open={open}
				edge={args.edge}
				width={args.width < 1 ? undefined : args.width}
				onClose={() => setOpen(false)}
			>
				<textlabel
					Size={new UDim2(1, 0, 0, 24)}
					BackgroundTransparency={1}
					Text="Drawer"
					TextSize={16}
					Font={Enum.Font.SourceSans}
				/>
			</Drawer>
		</>
	);
}

export default {
	title: "Components/Drawer",
	args: { open: true, edge: "left", width: 0 },
	argTypes: {
		open: { type: "boolean" },
		edge: { type: "enum", options: ["left", "right"] },
		width: { type: "number", min: 0, max: 400, step: 20 },
	},
	render: (args: Args) => <DrawerStory {...args} />,
};
