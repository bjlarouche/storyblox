import React, { useState } from "@rbxts/react";
import { Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kit";
import { Popover } from "./kitBreadth";

function PopoverStory(args: { open: boolean }) {
	const { theme } = useTheme();
	const [open, setOpen] = useArg(args.open);
	const [anchor, setAnchor] = useState<TextButton>();
	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<textbutton
				ref={setAnchor}
				AnchorPoint={new Vector2(0, 1)}
				Position={new UDim2(0, 8, 1, -8)}
				Size={new UDim2(0, 96, 0, 28)}
				Text={open ? "Hide" : "Show"}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.body}
				TextColor3={theme.palette.text.primary}
				BackgroundColor3={theme.palette.surface.paper}
				BorderSizePixel={0}
				Event={{ Activated: () => setOpen(!open) }}
			>
				<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
				<uistroke Color={theme.palette.border} ApplyStrokeMode={Enum.ApplyStrokeMode.Border} />
			</textbutton>
			<Popover anchor={anchor} open={open} preferredWidth={180} onDismiss={() => setOpen(false)}>
				<Typography text="Text on the elevated surface." />
			</Popover>
		</frame>
	);
}

export default {
	title: "Components/Popover",
	preview: { kind: "gui", width: 320, height: 220 },
	args: { open: true },
	argTypes: { open: { type: "boolean" } },
	render: (args: { open: boolean }) => <PopoverStory {...args} />,
};
