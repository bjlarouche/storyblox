import React, { useState } from "@rbxts/react";
import { Popover } from "./kitBreadth";

function PopoverStory() {
	const [open, setOpen] = useState(false);
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
				<textlabel
					Text="Pinned under the button."
					Size={new UDim2(1, 0, 0, 28)}
					BackgroundTransparency={1}
					TextSize={14}
				/>
			</Popover>
		</>
	);
}

export default {
	title: "Components/Popover",
	render: () => <PopoverStory />,
};
