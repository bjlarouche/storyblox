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
	render: (args: Args) => (
		<Breadcrumbs
			separator={args.separator}
			maxItems={args.maxItems < 1 ? undefined : args.maxItems}
			items={items}
		/>
	),
};
