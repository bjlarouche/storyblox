import React from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";
import { Icon } from "./kitBreadth";

const Icons = (Uiblox as unknown as { Icons: { Settings: string; Search: string; Close: string } }).Icons;

interface Args {
	name: "Settings" | "Search" | "Close";
	size: "xs" | "sm" | "md" | "lg";
}

export default {
	title: "Data Display/Icon",
	args: { name: "Settings", size: "md" },
	argTypes: {
		name: { type: "enum", options: ["Settings", "Search", "Close"] },
		size: { type: "enum", options: ["xs", "sm", "md", "lg"] },
	},
	render: (args: Args) => (
		<Icon
			icon={Icons[args.name]}
			size={args.size}
		/>
	),
};
