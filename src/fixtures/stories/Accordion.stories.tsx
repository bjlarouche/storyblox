import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Accordion, useArg } from "./kitBreadth";

interface Args {
	title: string;
	open: boolean;
	disabled: boolean;
	square: boolean;
}

function AccordionStory(args: Args) {
	const { theme } = useTheme();
	const [open, setOpen] = useArg(args.open);
	return (
		<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<Accordion title={args.title} open={open} disabled={args.disabled} square={args.square} onChange={setOpen}>
				<textlabel
					Size={new UDim2(1, 0, 0, 24)}
					BackgroundTransparency={1}
					Text="Panel"
					TextSize={16}
					Font={Enum.Font.SourceSans}
					TextColor3={theme.palette.text.primary}
				/>
			</Accordion>
		</frame>
	);
}

export default {
	title: "Components/Accordion",
	args: { title: "Section", open: true, disabled: false, square: false },
	argTypes: {
		title: { type: "string" },
		open: { type: "boolean" },
		disabled: { type: "boolean" },
		square: { type: "boolean" },
	},
	render: (args: Args) => <AccordionStory {...args} />,
};
