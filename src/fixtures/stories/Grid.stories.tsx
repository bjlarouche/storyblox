import React from "@rbxts/react";
import { Grid } from "./kitBreadth";

interface Args {
	columns: number;
	cell: number;
	gap: number;
	startCorner: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	fillDirection: "Horizontal" | "Vertical";
}

function Cell(props: { order: number; text: string }) {
	return (
		<textlabel
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={Color3.fromRGB(55 + props.order * 12, 70, 95)}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={Color3.fromRGB(240, 240, 240)}
			TextSize={14}
			LayoutOrder={props.order}
		/>
	);
}

export default {
	title: "Layout/Grid",
	args: { columns: 3, cell: 64, gap: 1, startCorner: "top-left", fillDirection: "Horizontal" },
	argTypes: {
		columns: { type: "number", min: 1, max: 6, step: 1 },
		cell: { type: "number", min: 32, max: 120, step: 8 },
		gap: { type: "number", min: 0, max: 3, step: 0.5 },
		startCorner: {
			type: "enum",
			options: ["top-left", "top-right", "bottom-left", "bottom-right"],
		},
		fillDirection: { type: "enum", options: ["Horizontal", "Vertical"] },
	},
	render: (args: Args) => (
		<Grid
			cellSize={UDim2.fromOffset(args.cell, args.cell)}
			gap={args.gap}
			columns={args.columns}
			startCorner={args.startCorner}
			fillDirection={
				args.fillDirection === "Vertical" ? Enum.FillDirection.Vertical : Enum.FillDirection.Horizontal
			}
		>
			<Cell order={0} text="1" />
			<Cell order={1} text="2" />
			<Cell order={2} text="3" />
			<Cell order={3} text="4" />
			<Cell order={4} text="5" />
			<Cell order={5} text="6" />
		</Grid>
	),
};
