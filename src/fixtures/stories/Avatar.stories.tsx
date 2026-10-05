import React from "@rbxts/react";
import { Avatar } from "./kitBreadth";

export default {
	title: "Components/Avatar",
	args: { name: "Ada Lovelace", size: 40 },
	argTypes: {
		name: { type: "string" },
		size: { type: "number" },
	},
	render: (args: { name: string; size: number }) => <Avatar name={args.name} size={args.size} />,
};
