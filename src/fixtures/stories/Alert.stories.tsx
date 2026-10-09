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

const LINE = "This note stays inside the padding when the line wraps.";
const TONES = ["info", "success", "warning", "error"] as const;

function slot(order: number, child: React.ReactNode) {
	return (
		<frame
			key={`alert-${order}`}
			LayoutOrder={order}
			Size={new UDim2(1, 0, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
		>
			{child}
		</frame>
	);
}

function AlertStory(args: Args) {
	const [visible, setVisible] = useArg(true);
	const first = visible ? (
		<Alert
			severity={args.severity}
			title={args.title === "" ? undefined : args.title}
			message={args.message}
			filled={args.filled}
			square={args.square}
			onClose={args.closable ? () => setVisible(false) : undefined}
		/>
	) : (
		<textbutton Size={new UDim2(0, 120, 0, 28)} Text="Show alert" Event={{ Activated: () => setVisible(true) }} />
	);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 280, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{slot(1, first)}
			{TONES.map((severity, index) =>
				slot(index + 2, <Alert severity={severity} title={severity} message={LINE} filled={true} />),
			)}
			{slot(6, <Alert severity="warning" title="Outlined" message={LINE} filled={false} />)}
		</frame>
	);
}

export default {
	title: "Feedback/Alert",
	preview: { kind: "gui", width: 300, height: 420 },
	args: { severity: "info", title: "Note", message: "Something happened", closable: true, filled: true, square: false },
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
