import React from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import { useTheme } from "@rbxts/uiblox";
import { Icon } from "./kitBreadth";

const Icons = (Uiblox as unknown as { Icons: { Settings: string; Search: string; Close: string } }).Icons;
const Mark = Icon as unknown as (props: { glyph: string; size: number; tint: Color3 }) => React.Element;

const DRAWN = [
	"close",
	"chevronDown",
	"chevronRight",
	"check",
	"add",
	"remove",
	"search",
	"menu",
	"more",
	"error",
	"warning",
	"info",
	"success",
	"folder",
];

interface Args {
	name: "Settings" | "Search" | "Close";
	size: "xs" | "sm" | "md" | "lg";
}

function Strip(props: { order: number; size: number; tint: Color3 }) {
	return (
		<frame LayoutOrder={props.order} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, 8)}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<>
				{DRAWN.map((name, index) => (
					<frame key={name} LayoutOrder={index} Size={UDim2.fromOffset(props.size, props.size)} BackgroundTransparency={1}>
						<Mark glyph={name} size={props.size} tint={props.tint} />
					</frame>
				))}
			</>
		</frame>
	);
}

function IconStory(args: Args) {
	const { theme } = useTheme();
	return (
		<frame Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 12)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Icon icon={Icons[args.name]} size={args.size} />
			<Strip order={1} size={16} tint={theme.palette.text.primary} />
			<Strip order={2} size={14} tint={theme.palette.text.primary} />
		</frame>
	);
}

export default {
	title: "Data Display/Icon",
	args: { name: "Settings", size: "md" },
	argTypes: {
		name: { type: "enum", options: ["Settings", "Search", "Close"] },
		size: { type: "enum", options: ["xs", "sm", "md", "lg"] },
	},
	render: (args: Args) => <IconStory {...args} />,
};
