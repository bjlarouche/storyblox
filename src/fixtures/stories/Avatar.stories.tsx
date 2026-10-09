import React from "@rbxts/react";
import { Icons } from "@rbxts/uiblox";
import { Avatar } from "./kitBreadth";

interface Args {
	name: string;
	size: number;
	variant: "circular" | "rounded" | "square";
	image: string;
}

export default {
	title: "Components/Avatar",
	args: { name: "Ada Lovelace", size: 40, variant: "circular", image: Icons.Settings },
	argTypes: {
		name: { type: "string" },
		size: { type: "number" },
		variant: { type: "enum", options: ["circular", "rounded", "square"] },
		image: { type: "string" },
	},
	preview: { kind: "gui", width: 220, height: 80 },
	render: (args: Args) => (
		<frame AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 12)} VerticalAlignment={Enum.VerticalAlignment.Center} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Avatar name={args.name} size={args.size} variant={args.variant} image={args.image === "" ? undefined : args.image} />
			<Avatar name="Ada Lovelace" />
			<Avatar name="Grace Hopper" size={28} variant="rounded" />
		</frame>
	),
};
