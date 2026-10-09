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
	preview: { kind: "gui", width: 280, height: 160 },
	render: (args: Args) => (
		<frame AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 12)} VerticalAlignment={Enum.VerticalAlignment.Center} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={1} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Fab
					icon={Icons.Save}
					label={args.label === "" ? undefined : args.label}
					size={args.size}
					color={args.color}
					loading={args.loading}
					disabled={args.disabled}
					reducedMotion={args.reducedMotion}
				/>
			</frame>
			<frame LayoutOrder={2} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Fab icon={Icons.Save} color="primary" />
			</frame>
			<frame LayoutOrder={3} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Fab icon={Icons.Save} color="accent" label="Accent" />
			</frame>
			<frame LayoutOrder={4} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Fab icon={Icons.Save} disabled={true} />
			</frame>
		</frame>
	),
};
