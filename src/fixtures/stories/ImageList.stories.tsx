import React from "@rbxts/react";
import { ImageList } from "./kitBreadth";

const sources = [
	"rbxassetid://7072723006",
	"rbxassetid://8772040340",
	"rbxassetid://8793943638",
	"rbxassetid://8583122940",
	"rbxassetid://8771814151",
	"rbxassetid://9306610505",
];

const labels = ["Cove", "Dune", "Harbor", "Ridge", "Field", "Pier"];

interface Args {
	cols: number;
	gap: number;
	itemSize: number;
	titles: boolean;
}

export default {
	title: "Layout/Image List",
	args: { cols: 3, gap: 1, itemSize: 72, titles: true },
	argTypes: {
		cols: { type: "number", min: 1, max: 6, step: 1 },
		gap: { type: "number", min: 0, max: 3, step: 0.5 },
		itemSize: { type: "number", min: 48, max: 128, step: 8 },
		titles: { type: "boolean" },
	},
	render: (args: Args) => (
		<ImageList
			items={sources.map((src, index) => ({
				src,
				title: args.titles ? labels[index] : undefined,
			}))}
			cols={args.cols}
			gap={args.gap}
			itemSize={args.itemSize}
		/>
	),
};
