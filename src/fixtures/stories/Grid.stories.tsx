import React from "@rbxts/react";
import { Grid } from "./kitBreadth";

interface Args {
	cols: number;
	cell: number;
	gap: number;
}

function Cell(props: { order: number; text: string }) {
	return (
		<textlabel
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={Color3.fromRGB(55 + props.order * 12, 70, 95)}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={Color3.fromRGB(240, 240, 240)}
			LayoutOrder={props.order}
		/>
	);
}

export default {
	title: "Layout/Grid",
	args: { cols: 3, cell: 64, gap: 8 },
	argTypes: {
		cols: { type: "number", min: 1, max: 6, step: 1 },
		cell: { type: "number", min: 32, max: 120, step: 8 },
		gap: { type: "number", min: 0, max: 24, step: 2 },
	},
	render: (args: Args) => (
		<Grid
			cellSize={UDim2.fromOffset(args.cell, args.cell)}
			cellPadding={UDim2.fromOffset(args.gap, args.gap)}
			fillDirectionMaxCells={args.cols}
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
