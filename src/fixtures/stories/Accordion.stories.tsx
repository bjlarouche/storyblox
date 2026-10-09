import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Accordion, useArg } from "./kitBreadth";

interface Args {
	title: string;
	open: boolean;
	disabled: boolean;
	square: boolean;
}

const LINE = "A longer section title that stays inside the header padding";
const NOTE = "A note that wraps beside the icon";
const BODY = "The panel copy stays inside the padding when the line wraps.";

function panel(text: string, color: Color3) {
	return (
		<textlabel
			Size={new UDim2(1, 0, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={text}
			TextWrapped={true}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextColor3={color}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	);
}

function AccordionStory(args: Args) {
	const { theme } = useTheme();
	const [open, setOpen] = useArg(args.open);
	const ink = theme.palette.text.primary;
	return (
		<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<Accordion title={args.title} open={open} disabled={args.disabled} square={args.square} onChange={setOpen}>
					{panel("Panel", ink)}
				</Accordion>
			</frame>
			<frame LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<Accordion title={LINE} note={NOTE} defaultOpen={true}>
					{panel(BODY, ink)}
				</Accordion>
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Accordion",
	preview: { kind: "gui", width: 320, height: 240 },
	args: { title: "Section", open: true, disabled: false, square: false },
	argTypes: {
		title: { type: "string" },
		open: { type: "boolean" },
		disabled: { type: "boolean" },
		square: { type: "boolean" },
	},
	render: (args: Args) => <AccordionStory {...args} />,
};
