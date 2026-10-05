import React from "@rbxts/react";
import { Dialog, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	title: string;
}

function DialogStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<Dialog open={open} title={args.title} onClose={() => setOpen(false)}>
			<textlabel Size={new UDim2(1, 0, 0, 24)} BackgroundTransparency={1} Text="Body" TextSize={16} Font={Enum.Font.SourceSans} />
		</Dialog>
	);
}

export default {
	title: "Components/Dialog",
	args: { open: true, title: "Confirm" },
	argTypes: {
		open: { type: "boolean" },
		title: { type: "string" },
	},
	render: (args: Args) => <DialogStory {...args} />,
};
