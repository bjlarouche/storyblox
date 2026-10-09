import React from "@rbxts/react";
import { Snackbar, useArg } from "./kitBreadth";

interface Args {
	message: string;
	open: boolean;
	action: string;
	variant: "default" | "success" | "error" | "warning";
}

const LINE = "This snackbar line stays inside the padding when it wraps.";
const VARIANTS = ["default", "success", "warning", "error"] as const;

function slot(order: number, height: number, child: React.ReactNode) {
	return (
		<frame key={`snack-${order}`} LayoutOrder={order} Size={new UDim2(1, 0, 0, height)} BackgroundTransparency={1}>
			{child}
		</frame>
	);
}

function SnackbarStory(args: Args) {
	const [open, setOpen] = useArg(args.open);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 280, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{slot(
				1,
				56,
				<Snackbar
					message={args.message}
					open={open}
					action={args.action === "" ? undefined : args.action}
					variant={args.variant}
					duration={1e6}
					onAction={() => setOpen(false)}
					onDismiss={() => setOpen(false)}
				/>,
			)}
			{VARIANTS.map((variant, index) =>
				slot(
					index + 2,
					56,
					<Snackbar message={variant} open={true} variant={variant} duration={1e6} onDismiss={() => {}} />,
				),
			)}
			{slot(6, 80, <Snackbar message={LINE} open={true} variant="warning" duration={1e6} onDismiss={() => {}} />)}
		</frame>
	);
}

export default {
	title: "Components/Snackbar",
	preview: { kind: "gui", width: 300, height: 420 },
	args: { message: "Saved", open: true, action: "Undo", variant: "success" },
	argTypes: {
		message: { type: "string" },
		open: { type: "boolean" },
		action: { type: "string" },
		variant: { type: "enum", options: ["default", "success", "error", "warning"] },
	},
	render: (args: Args) => <SnackbarStory {...args} />,
};
