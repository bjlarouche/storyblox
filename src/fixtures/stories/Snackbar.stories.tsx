import React from "@rbxts/react";
import { Snackbar, useArg } from "./kitBreadth";

interface Args {
	message: string;
	open: boolean;
	action: string;
}

function SnackbarStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<Snackbar
			message={args.message}
			open={open}
			action={args.action === "" ? undefined : args.action}
			onAction={() => setOpen(false)}
			onDismiss={() => setOpen(false)}
		/>
	);
}

export default {
	title: "Components/Snackbar",
	args: { message: "Saved", open: true, action: "Undo" },
	argTypes: {
		message: { type: "string" },
		open: { type: "boolean" },
		action: { type: "string" },
	},
	render: (args: Args) => <SnackbarStory {...args} />,
};
