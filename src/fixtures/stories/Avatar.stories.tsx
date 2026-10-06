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
	args: { name: "Ada Lovelace", size: 40, variant: "rounded", image: Icons.Settings },
	argTypes: {
		name: { type: "string" },
		size: { type: "number" },
		variant: { type: "enum", options: ["circular", "rounded", "square"] },
		image: { type: "string" },
	},
	render: (args: Args) => (
		<Avatar
			name={args.name}
			size={args.size}
			variant={args.variant}
			image={args.image === "" ? undefined : args.image}
		/>
	),
};
