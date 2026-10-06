import React from "@rbxts/react";
import { Alert, useArg } from "./kitBreadth";

interface Args {
	severity: "info" | "success" | "warning" | "error";
	title: string;
	message: string;
	closable: boolean;
	filled: boolean;
	square: boolean;
}

function AlertStory(args: Args) {
	const [visible, setVisible] = useArg(true);
	if (!visible) {
		return (
			<textbutton
				Size={new UDim2(0, 120, 0, 28)}
				Text="Show alert"
				Event={{ Activated: () => setVisible(true) }}
			/>
		);
	}
	return (
		<Alert
			severity={args.severity}
			title={args.title === "" ? undefined : args.title}
			message={args.message}
			filled={args.filled}
			square={args.square}
			onClose={args.closable ? () => setVisible(false) : undefined}
		/>
	);
}

export default {
	title: "Feedback/Alert",
	args: { severity: "info", title: "Note", message: "Something happened", closable: true, filled: true, square: true },
	argTypes: {
		severity: { type: "enum", options: ["info", "success", "warning", "error"] },
		title: { type: "string" },
		message: { type: "string" },
		closable: { type: "boolean" },
		filled: { type: "boolean" },
		square: { type: "boolean" },
	},
	render: (args: Args) => <AlertStory {...args} />,
};
