import React from "@rbxts/react";
import { Stack } from "./kitBreadth";

interface Args {
	direction: "row" | "column";
	gap: number;
	wrap: boolean;
	alignItems: "start" | "center" | "end" | "stretch";
	justifyContent: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
	width: number;
}

function Swatch(props: { text: string; order: number; w?: number; h?: number; color: Color3 }) {
	return (
		<textlabel
			Size={new UDim2(0, props.w ?? 64, 0, props.h ?? 28)}
			BackgroundColor3={props.color}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={Color3.fromRGB(240, 240, 240)}
			TextSize={14}
			LayoutOrder={props.order}
		/>
	);
}

const COLORS = [
	Color3.fromRGB(70, 110, 180),
	Color3.fromRGB(60, 140, 120),
	Color3.fromRGB(150, 90, 70),
	Color3.fromRGB(120, 80, 150),
	Color3.fromRGB(90, 120, 70),
	Color3.fromRGB(160, 120, 50),
];

export default {
	title: "Layout/Flex",
	args: {
		direction: "row",
		gap: 1,
		wrap: true,
		alignItems: "center",
		justifyContent: "start",
		width: 220,
	},
	argTypes: {
		direction: { type: "enum", options: ["row", "column"] },
		gap: { type: "number", min: 0, max: 4, step: 0.5 },
		wrap: { type: "boolean" },
		alignItems: { type: "enum", options: ["start", "center", "end", "stretch"] },
		justifyContent: {
			type: "enum",
			options: ["start", "center", "end", "space-between", "space-around", "space-evenly"],
		},
		width: { type: "number", min: 120, max: 400, step: 20 },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(0, args.width, 0, 160)} BackgroundColor3={Color3.fromRGB(35, 35, 40)} BorderSizePixel={0}>
			<uipadding
				PaddingTop={new UDim(0, 8)}
				PaddingBottom={new UDim(0, 8)}
				PaddingLeft={new UDim(0, 8)}
				PaddingRight={new UDim(0, 8)}
			/>
			<Stack
				direction={args.direction}
				gap={args.gap}
				wrap={args.wrap}
				alignItems={args.alignItems}
				justifyContent={args.justifyContent}
				sx={{ Size: new UDim2(1, 0, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}
			>
				<Swatch text="A" order={0} color={COLORS[0]} w={56} h={24} />
				<Swatch text="B" order={1} color={COLORS[1]} w={72} h={32} />
				<Swatch text="C" order={2} color={COLORS[2]} w={48} h={28} />
				<Swatch text="D" order={3} color={COLORS[3]} w={80} h={24} />
				<Swatch text="E" order={4} color={COLORS[4]} w={60} h={36} />
				<Swatch text="F" order={5} color={COLORS[5]} w={52} h={28} />
			</Stack>
		</frame>
	),
};
