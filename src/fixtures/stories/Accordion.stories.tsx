import React from "@rbxts/react";
import { Accordion, useArg } from "./kitBreadth";

interface Args {
	title: string;
	open: boolean;
	disabled: boolean;
	square: boolean;
}

function AccordionStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<Accordion title={args.title} open={open} disabled={args.disabled} square={args.square} onChange={setOpen}>
			<textlabel Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} Text="Panel" TextSize={16} Font={Enum.Font.SourceSans} />
		</Accordion>
	);
}

export default {
	title: "Components/Accordion",
	args: { title: "Section", open: false, disabled: false, square: true },
	argTypes: {
		title: { type: "string" },
		open: { type: "boolean" },
		disabled: { type: "boolean" },
		square: { type: "boolean" },
	},
	render: (args: Args) => <AccordionStory {...args} />,
};
