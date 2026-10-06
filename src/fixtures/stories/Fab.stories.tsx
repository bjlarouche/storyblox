import React from "@rbxts/react";
import { Icons } from "@rbxts/uiblox";
import { Fab } from "./kitBreadth";

interface Args {
	size: "small" | "medium" | "large";
	color: "primary" | "accent";
	label: string;
	loading: boolean;
	disabled: boolean;
	reducedMotion: boolean;
}

export default {
	title: "Components/Fab",
	args: { size: "medium", color: "accent", label: "Create", loading: false, disabled: false, reducedMotion: false },
	argTypes: {
		size: { type: "enum", options: ["small", "medium", "large"] },
		color: { type: "enum", options: ["primary", "accent"] },
		label: { type: "string" },
		loading: { type: "boolean" },
		disabled: { type: "boolean" },
		reducedMotion: { type: "boolean" },
	},
	render: (args: Args) => (
		<Fab
			icon={Icons.Save}
			label={args.label === "" ? undefined : args.label}
			size={args.size}
			color={args.color}
			loading={args.loading}
			disabled={args.disabled}
			reducedMotion={args.reducedMotion}
		/>
	),
};
