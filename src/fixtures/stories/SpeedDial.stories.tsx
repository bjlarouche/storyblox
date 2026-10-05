import React from "@rbxts/react";
import { Icons } from "@rbxts/uiblox";
import { SpeedDial, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	disabled: boolean;
	direction: "up" | "down" | "left" | "right";
}

function SpeedDialStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<frame Size={new UDim2(0, 200, 0, 200)} BackgroundTransparency={1}>
			<SpeedDial
				open={open}
				onOpenChange={setOpen}
				disabled={args.disabled}
				direction={args.direction}
				actions={[
					{ icon: Icons.Save },
					{ icon: Icons.Settings },
					{ icon: Icons.Delete },
				]}
			/>
		</frame>
	);
}

export default {
	title: "Components/Speed Dial",
	args: { open: true, disabled: false, direction: "up" },
	argTypes: {
		open: { type: "boolean" },
		disabled: { type: "boolean" },
		direction: { type: "enum", options: ["up", "down", "left", "right"] },
	},
	render: (args: Args) => <SpeedDialStory {...args} />,
};
