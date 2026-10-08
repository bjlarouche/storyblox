import React, { useState } from "@rbxts/react";
import { Typography } from "@rbxts/uiblox";
import { useArg } from "./kit";
import { Popover } from "./kitBreadth";

function PopoverStory(args: { open: boolean }) {
	const [open, setOpen] = useArg(args.open);
	const [anchor, setAnchor] = useState<TextButton>();
	return (
		<>
			<textbutton
				ref={setAnchor}
				Size={new UDim2(0, 96, 0, 28)}
				Text={open ? "Hide" : "Show"}
				Event={{ Activated: () => setOpen(!open) }}
			/>
			<Popover anchor={anchor} open={open} preferredWidth={160} onDismiss={() => setOpen(false)}>
				<Typography text="Pinned under the button." />
			</Popover>
		</>
	);
}

export default {
	title: "Components/Popover",
	args: { open: false },
	argTypes: { open: { type: "boolean" } },
	render: (args: { open: boolean }) => <PopoverStory {...args} />,
};
