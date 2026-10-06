import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Dialog, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	title: string;
	showActions: boolean;
}

function DialogStory(args: Args) {
	const { theme } = useTheme();
	const [open, setOpen] = useArg(args.open);
	return (
		<>
			{!open && (
				<textbutton
					Size={new UDim2(0, 120, 0, 28)}
					Text="Open dialog"
					TextColor3={theme.palette.text.primary}
					BackgroundColor3={theme.palette.surface.paper}
					Event={{ Activated: () => setOpen(true) }}
				/>
			)}
			<Dialog
				open={open}
				title={args.title === "" ? undefined : args.title}
				onClose={() => setOpen(false)}
				actions={
					args.showActions ? (
						<textbutton
							Size={new UDim2(0, 72, 0, 28)}
							BackgroundTransparency={1}
							Text="Close"
							TextSize={14}
							Font={Enum.Font.SourceSans}
							TextColor3={theme.palette.primary.main}
							Event={{ Activated: () => setOpen(false) }}
						/>
					) : undefined
				}
			>
				<textlabel
					Size={new UDim2(1, 0, 0, 24)}
					BackgroundTransparency={1}
					Text="Body"
					TextSize={16}
					Font={Enum.Font.SourceSans}
					TextColor3={theme.palette.text.primary}
				/>
			</Dialog>
		</>
	);
}

export default {
	title: "Components/Dialog",
	args: { open: true, title: "Confirm", showActions: true },
	argTypes: {
		open: { type: "boolean" },
		title: { type: "string" },
		showActions: { type: "boolean" },
	},
	render: (args: Args) => <DialogStory {...args} />,
};
