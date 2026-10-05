import React, { useState } from "@rbxts/react";
import { Menu, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	empty: boolean;
}

function MenuStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	const [anchor, setAnchor] = useState<TextButton>();
	return (
		<>
			<textbutton
				ref={setAnchor}
				Size={new UDim2(0, 96, 0, 28)}
				Text="Open"
				Event={{ Activated: () => setOpen(true) }}
			/>
			<Menu
				anchor={anchor}
				open={open}
				items={
					args.empty
						? []
						: [
								{ id: "a", text: "One" },
								{ id: "b", text: "Two" },
								{ id: "c", text: "Disabled", disabled: true },
							]
				}
				onSelect={() => setOpen(false)}
				onClose={() => setOpen(false)}
			/>
		</>
	);
}

export default {
	title: "Components/Menu",
	args: { open: false, empty: false },
	argTypes: {
		open: { type: "boolean" },
		empty: { type: "boolean" },
	},
	render: (args: Args) => <MenuStory {...args} />,
};
