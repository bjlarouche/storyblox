import React from "@rbxts/react";
import { Snackbar, useArg } from "./kitBreadth";

interface Args {
	message: string;
	open: boolean;
	action: string;
	variant: "default" | "success" | "error" | "warning";
}

function SnackbarStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<Snackbar
			message={args.message}
			open={open}
			action={args.action === "" ? undefined : args.action}
			variant={args.variant}
			onAction={() => setOpen(false)}
			onDismiss={() => setOpen(false)}
		/>
	);
}

export default {
	title: "Components/Snackbar",
	args: { message: "Saved", open: true, action: "Undo", variant: "success" },
	argTypes: {
		message: { type: "string" },
		open: { type: "boolean" },
		action: { type: "string" },
		variant: { type: "enum", options: ["default", "success", "error", "warning"] },
	},
	render: (args: Args) => <SnackbarStory {...args} />,
};
