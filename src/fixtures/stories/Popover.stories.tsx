import React, { useState } from "@rbxts/react";
import { Typography } from "@rbxts/uiblox";
import { useArg } from "./kit";
import { Popover } from "./kitBreadth";

function PopoverStory(args: { open: boolean }) {
	const [open, setOpen] = useArg(args.open);
	const [anchor, setAnchor] = useState<TextButton>();
	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<textbutton
				ref={setAnchor}
				AnchorPoint={new Vector2(0, 1)}
				Position={new UDim2(0, 8, 1, -8)}
				Size={new UDim2(0, 96, 0, 28)}
				Text={open ? "Hide" : "Show"}
				Event={{ Activated: () => setOpen(!open) }}
			/>
			<Popover anchor={anchor} open={open} preferredWidth={180} onDismiss={() => setOpen(false)}>
				<Typography text="Text on the elevated surface." />
			</Popover>
		</frame>
	);
}

export default {
	title: "Components/Popover",
	preview: { kind: "gui", width: 320, height: 220 },
	args: { open: true },
	argTypes: { open: { type: "boolean" } },
	render: (args: { open: boolean }) => <PopoverStory {...args} />,
};
