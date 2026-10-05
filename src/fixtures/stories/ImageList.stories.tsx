import React from "@rbxts/react";
import { ImageList } from "./kitBreadth";

const items = [
	{ src: "rbxassetid://7072723006" },
	{ src: "rbxassetid://8772040340" },
	{ src: "rbxassetid://8793943638" },
	{ src: "rbxassetid://8583122940" },
	{ src: "rbxassetid://8771814151" },
	{ src: "rbxassetid://9306610505" },
];

interface Args {
	cols: number;
	gap: number;
	itemSize: number;
}

export default {
	title: "Layout/Image List",
	args: { cols: 3, gap: 1, itemSize: 72 },
	argTypes: {
		cols: { type: "number", min: 1, max: 6, step: 1 },
		gap: { type: "number", min: 0, max: 3, step: 0.5 },
		itemSize: { type: "number", min: 48, max: 128, step: 8 },
	},
	render: (args: Args) => (
		<ImageList items={items} cols={args.cols} gap={args.gap} itemSize={args.itemSize} />
	),
};
