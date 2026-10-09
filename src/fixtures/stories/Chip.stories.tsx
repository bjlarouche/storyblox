import React from "@rbxts/react";
import { Chip, useArg } from "./kitBreadth";

interface Args {
	label: string;
	selected: boolean;
	disabled: boolean;
	deletable: boolean;
	size: "small" | "medium" | "large";
	variant: "filled" | "outlined";
	color: "default" | "primary";
}

const COLORS = ["default", "primary", "success", "error"] as const;
const LINE = "A longer label that wraps inside the padding";

function row(order: number, child: React.ReactNode) {
	return (
		<frame
			key={`chip-${order}`}
			LayoutOrder={order}
			AutomaticSize={Enum.AutomaticSize.XY}
			Size={UDim2.fromScale(0, 0)}
			BackgroundTransparency={1}
		>
			{child}
		</frame>
	);
}

function ChipStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	const [visible, setVisible] = useArg(true);
	const first = visible ? (
		<Chip
			label={args.label}
			selected={selected}
			disabled={args.disabled}
			size={args.size}
			variant={args.variant}
			color={args.color}
			onActivated={() => setSelected(!selected)}
			onDelete={args.deletable ? () => setVisible(false) : undefined}
		/>
	) : (
		<textbutton Size={new UDim2(0, 100, 0, 28)} Text="Show chip" Event={{ Activated: () => setVisible(true) }} />
	);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 280, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{row(1, first)}
			{row(
				2,
				<frame AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0, 8)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
					{COLORS.map((color, index) => (
						<frame
							key={color}
							LayoutOrder={index}
							AutomaticSize={Enum.AutomaticSize.XY}
							Size={UDim2.fromScale(0, 0)}
							BackgroundTransparency={1}
						>
							<Chip label={color} color={color} variant="filled" />
						</frame>
					))}
				</frame>,
			)}
			{row(
				3,
				<frame AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0, 8)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
					{COLORS.map((color, index) => (
						<frame
							key={`out-${color}`}
							LayoutOrder={index}
							AutomaticSize={Enum.AutomaticSize.XY}
							Size={UDim2.fromScale(0, 0)}
							BackgroundTransparency={1}
						>
							<Chip label={color} color={color} variant="outlined" />
						</frame>
					))}
				</frame>,
			)}
			{row(
				4,
				<Chip
					label={LINE}
					sx={{ Size: new UDim2(0, 140, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
				/>,
			)}
		</frame>
	);
}

export default {
	title: "Components/Chip",
	preview: { kind: "gui", width: 300, height: 220 },
	args: { label: "Chip", selected: true, disabled: false, deletable: true, size: "medium", variant: "filled", color: "default" },
	argTypes: {
		label: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		deletable: { type: "boolean" },
		size: { type: "enum", options: ["small", "medium", "large"] },
		variant: { type: "enum", options: ["filled", "outlined"] },
		color: { type: "enum", options: ["default", "primary"] },
	},
	render: (args: Args) => <ChipStory {...args} />,
};
