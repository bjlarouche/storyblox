import React from "@rbxts/react";
import { Avatar } from "./kitBreadth";

interface Args {
	name: string;
	size: number;
	variant: "circular" | "rounded" | "square";
}

export default {
	title: "Components/Avatar",
	args: { name: "Ada Lovelace", size: 40, variant: "rounded" },
	argTypes: {
		name: { type: "string" },
		size: { type: "number" },
		variant: { type: "enum", options: ["circular", "rounded", "square"] },
	},
	render: (args: Args) => <Avatar name={args.name} size={args.size} variant={args.variant} />,
};
