import React from "@rbxts/react";
import { FlexItem, Stack } from "./kitBreadth";

interface Args {
	growA: number;
	growB: number;
	shrinkC: number;
	fillD: boolean;
}

function Swatch(props: { text: string; order: number; color: Color3 }) {
	return (
		<textlabel
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={props.color}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={Color3.fromRGB(240, 240, 240)}
			TextSize={14}
			LayoutOrder={props.order}
		/>
	);
}

export default {
	title: "Layout/Flex Items",
	args: { growA: 1, growB: 2, shrinkC: 1, fillD: false },
	argTypes: {
		growA: { type: "number", min: 0, max: 4, step: 1 },
		growB: { type: "number", min: 0, max: 4, step: 1 },
		shrinkC: { type: "number", min: 0, max: 4, step: 1 },
		fillD: { type: "boolean" },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(0, 320, 0, 56)} BackgroundColor3={Color3.fromRGB(35, 35, 40)} BorderSizePixel={0}>
			<uipadding
				PaddingTop={new UDim(0, 8)}
				PaddingBottom={new UDim(0, 8)}
				PaddingLeft={new UDim(0, 8)}
				PaddingRight={new UDim(0, 8)}
			/>
			<Stack
				direction="row"
				gap={1}
				sx={{ Size: new UDim2(1, 0, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}
			>
				<FlexItem grow={args.growA} sx={{ Size: new UDim2(0, 48, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}>
					<Swatch text={`grow ${args.growA}`} order={0} color={Color3.fromRGB(70, 110, 180)} />
				</FlexItem>
				<FlexItem grow={args.growB} sx={{ Size: new UDim2(0, 48, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}>
					<Swatch text={`grow ${args.growB}`} order={1} color={Color3.fromRGB(60, 140, 120)} />
				</FlexItem>
				<FlexItem
					shrink={args.shrinkC}
					sx={{ Size: new UDim2(0, 96, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}
				>
					<Swatch text={`shrink ${args.shrinkC}`} order={2} color={Color3.fromRGB(150, 90, 70)} />
				</FlexItem>
				<FlexItem
					fill={args.fillD}
					sx={{ Size: new UDim2(0, 64, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}
				>
					<Swatch text={args.fillD ? "fill" : "fixed"} order={3} color={Color3.fromRGB(120, 80, 150)} />
				</FlexItem>
			</Stack>
		</frame>
	),
};
