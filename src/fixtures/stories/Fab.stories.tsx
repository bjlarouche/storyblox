import React from "@rbxts/react";
import { Icons } from "@rbxts/uiblox";
import { Fab } from "./kitBreadth";

interface Args {
	size: "small" | "medium" | "large";
	loading: boolean;
	disabled: boolean;
	reducedMotion: boolean;
}

export default {
	title: "Components/Fab",
	args: { size: "medium", loading: false, disabled: false, reducedMotion: false },
	argTypes: {
		size: { type: "enum", options: ["small", "medium", "large"] },
		loading: { type: "boolean" },
		disabled: { type: "boolean" },
		reducedMotion: { type: "boolean" },
	},
	render: (args: Args) => (
		<Fab
			icon={Icons.Save}
			size={args.size}
			loading={args.loading}
			disabled={args.disabled}
			reducedMotion={args.reducedMotion}
		/>
	),
};
