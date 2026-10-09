import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Stack } from "./kitBreadth";

interface Args {
	direction: "row" | "column";
	spacing: number;
	alignItems: "start" | "center" | "end";
	justifyContent: "start" | "center" | "end" | "space-between";
}

function Swatch(props: { text: string; order: number }) {
	return (
		<textlabel
			Size={new UDim2(0, 72, 0, 28)}
			BackgroundColor3={Color3.fromRGB(60, 60, 70)}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={Color3.fromRGB(240, 240, 240)}
			LayoutOrder={props.order}
		/>
	);
}

function Band(props: { text: string; order: number; color: Color3; ink: Color3 }) {
	return (
		<textlabel
			LayoutOrder={props.order}
			Size={new UDim2(1, 0, 0, 28)}
			BackgroundColor3={props.color}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={props.ink}
			TextSize={14}
			Font={Enum.Font.SourceSans}
		/>
	);
}

function StackStory(args: Args) {
	const { theme } = useTheme();
	return (
			<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Vertical}
					Padding={new UDim(0, 16)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				<frame LayoutOrder={1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<Stack
						direction={args.direction}
						spacing={args.spacing}
						alignItems={args.alignItems}
						justifyContent={args.justifyContent}
					>
						<Swatch text="One" order={0} />
						<Swatch text="Two" order={1} />
						<Swatch text="Three" order={2} />
					</Stack>
				</frame>
				<frame LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<Stack
						direction="column"
						gap={1}
						sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y, p: 2 }}
					>
						<Band text="Inside the padding" order={0} color={theme.palette.surface.input} ink={theme.palette.text.primary} />
						<Band text="Gap below" order={1} color={theme.palette.surface.elevated} ink={theme.palette.text.primary} />
					</Stack>
				</frame>
			</frame>
	);
}

export default {
	title: "Layout/Stack",
	preview: { kind: "gui", width: 300, height: 220 },
	args: { direction: "row", spacing: 1, alignItems: "center", justifyContent: "start" },
	argTypes: {
		direction: { type: "enum", options: ["row", "column"] },
		spacing: { type: "number", min: 0, max: 4, step: 0.5 },
		alignItems: { type: "enum", options: ["start", "center", "end"] },
		justifyContent: { type: "enum", options: ["start", "center", "end", "space-between"] },
	},
	render: (args: Args) => <StackStory {...args} />,
};
