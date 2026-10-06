import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Backdrop, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	invisible: boolean;
}

function BackdropStory(args: Args) {
	const { theme } = useTheme();
	const [open, setOpen] = useArg(args.open);
	return (
		<frame Size={new UDim2(0, 280, 0, 160)} BackgroundColor3={theme.palette.surface.paper} BorderSizePixel={0}>
			<textlabel
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				Text="Surface under backdrop"
				TextSize={16}
				Font={Enum.Font.SourceSans}
				TextColor3={theme.palette.text.primary}
			/>
			<Backdrop open={open} invisible={args.invisible} onClick={() => setOpen(false)} />
			{!open && (
				<textbutton
					Size={new UDim2(0, 100, 0, 28)}
					Position={new UDim2(0.5, 0, 0.5, 0)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Text="Show"
					TextColor3={theme.palette.text.primary}
					BackgroundColor3={theme.palette.surface.elevated}
					ZIndex={2}
					Event={{ Activated: () => setOpen(true) }}
				/>
			)}
		</frame>
	);
}

export default {
	title: "Feedback/Backdrop",
	args: { open: true, invisible: false },
	argTypes: {
		open: { type: "boolean" },
		invisible: { type: "boolean" },
	},
	render: (args: Args) => <BackdropStory {...args} />,
};
