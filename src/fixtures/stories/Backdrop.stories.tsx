import React from "@rbxts/react";
import { Backdrop, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	invisible: boolean;
}

function BackdropStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<frame Size={new UDim2(0, 280, 0, 160)} BackgroundColor3={Color3.fromRGB(40, 44, 52)} BorderSizePixel={0}>
			<textlabel
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				Text="Surface under backdrop"
				TextColor3={Color3.fromRGB(220, 220, 220)}
			/>
			<Backdrop open={open} invisible={args.invisible} onClick={() => setOpen(false)} />
			{!open && (
				<textbutton
					Size={new UDim2(0, 100, 0, 28)}
					Position={new UDim2(0.5, 0, 0.5, 0)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Text="Show"
					ZIndex={2}
					Event={{ Activated: () => setOpen(true) }}
				/>
			)}
		</frame>
	);
}

export default {
	title: "Feedback/Backdrop",
	args: { open: true, invisible: false },
	argTypes: {
		open: { type: "boolean" },
		invisible: { type: "boolean" },
	},
	render: (args: Args) => <BackdropStory {...args} />,
};
