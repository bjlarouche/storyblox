import React from "@rbxts/react";
import { Snackbar, useArg } from "./kitBreadth";

interface Args {
	message: string;
	open: boolean;
}

function SnackbarStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return <Snackbar message={args.message} open={open} onDismiss={() => setOpen(false)} />;
}

export default {
	title: "Components/Snackbar",
	args: { message: "Saved", open: true },
	argTypes: {
		message: { type: "string" },
		open: { type: "boolean" },
	},
	render: (args: Args) => <SnackbarStory {...args} />,
};
