import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Divider } from "./kitBreadth";

interface Args {
	orientation: "Horizontal" | "Vertical";
	text: string;
}

function DividerStory(args: Args) {
	const { theme } = useTheme();
	const labeled = args.orientation === "Horizontal" && args.text !== "";
	return (
		<frame Size={new UDim2(0, 240, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
		<frame Size={new UDim2(0, 240, 0, 120)} BackgroundTransparency={1} BorderSizePixel={0} ClipsDescendants={true} LayoutOrder={0}>
			<textlabel
				Size={new UDim2(1, 0, 0, 24)}
				BackgroundTransparency={1}
				Text="Above"
				TextSize={14}
				TextColor3={theme.palette.text.secondary}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>
			<frame
				Size={
					args.orientation === "Vertical"
						? new UDim2(0, 4, 1, -48)
						: new UDim2(1, 0, 0, args.text === "" ? 8 : 28)
				}
				Position={new UDim2(0, 0, 0, 28)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				ClipsDescendants={true}
			>
				<Divider
					orientation={args.orientation}
					text={args.text === "" ? undefined : args.text}
					sx={labeled ? { Size: new UDim2(1, 0, 0, 24), ClipsDescendants: false } : undefined}
				/>
			</frame>
			<textlabel
				Size={new UDim2(1, 0, 0, 24)}
				Position={new UDim2(0, 0, 1, -24)}
				BackgroundTransparency={1}
				Text="Below"
				TextSize={14}
				TextColor3={theme.palette.text.secondary}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>
		</frame>
			<frame Size={new UDim2(1, 0, 0, 28)} BackgroundTransparency={1} LayoutOrder={1}>
				<Divider text="A longer caption that stays on one line" />
			</frame>
		</frame>
	);
}

export default {
	title: "Layout/Divider",
	args: { orientation: "Horizontal", text: "Or" },
	argTypes: {
		orientation: { type: "enum", options: ["Horizontal", "Vertical"] },
		text: { type: "string" },
	},
	render: (args: Args) => <DividerStory {...args} />,
};
