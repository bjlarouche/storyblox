import React from "@rbxts/react";
import { Accordion, useArg } from "./kitBreadth";

interface Args {
	title: string;
	open: boolean;
}

function AccordionStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<Accordion title={args.title} open={open} onChange={setOpen}>
			<textlabel Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} Text="Panel" TextSize={16} Font={Enum.Font.SourceSans} />
		</Accordion>
	);
}

export default {
	title: "Components/Accordion",
	args: { title: "Section", open: false },
	argTypes: {
		title: { type: "string" },
		open: { type: "boolean" },
	},
	render: (args: Args) => <AccordionStory {...args} />,
};
