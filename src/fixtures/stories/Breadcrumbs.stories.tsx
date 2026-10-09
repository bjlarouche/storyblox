import React from "@rbxts/react";
import { Breadcrumbs } from "./kitBreadth";

interface Args {
	separator: string;
	maxItems: number;
}

const items = [
	{ label: "Home" },
	{ label: "Library" },
	{ label: "Docs" },
	{ label: "API" },
	{ label: "Item" },
];

export default {
	title: "Components/Breadcrumbs",
	args: { separator: "/", maxItems: 3 },
	argTypes: {
		separator: { type: "string" },
		maxItems: { type: "number", min: 0, max: 5, step: 1 },
	},
	preview: { kind: "gui", width: 320, height: 80 },
	render: (args: Args) => (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 280, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Breadcrumbs separator={args.separator} maxItems={args.maxItems < 1 ? undefined : args.maxItems} items={items} />
			<Breadcrumbs
				items={[
					{ label: "Home" },
					{ label: "A longer destination that stays inside the item" },
					{ label: "Item" },
				]}
			/>
		</frame>
	),
};
