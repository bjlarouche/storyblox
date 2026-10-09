import React from "@rbxts/react";
import { Typography, TypographyColor, useTheme } from "@rbxts/uiblox";

const VARIANTS = ["h1", "h2", "h3", "h4", "subtitle1", "body", "button", "caption", "overline"] as const;
const COLORS: TypographyColor[] = ["textPrimary", "textSecondary", "primary", "error"];

const ROW: Record<(typeof VARIANTS)[number], number> = {
	h1: 40,
	h2: 32,
	h3: 28,
	h4: 26,
	subtitle1: 26,
	body: 24,
	button: 22,
	caption: 20,
	overline: 18,
};

function TypographyMatrix() {
	const { theme } = useTheme();
	const gap = theme.padding.calc(2);
	return (
		<scrollingframe
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollBarThickness={theme.spacing.calc(0.5)}
			ScrollBarImageColor3={theme.palette.text.secondary}
		>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, gap)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding PaddingTop={new UDim(0, gap)} PaddingBottom={new UDim(0, gap)} PaddingLeft={new UDim(0, gap)} PaddingRight={new UDim(0, gap)} />
			{VARIANTS.map((variant, index) => (
				<frame
					key={variant}
					LayoutOrder={index}
					Size={new UDim2(1, 0, 0, ROW[variant])}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					<Typography text={`${variant}  The quick brown fox`} variant={variant} color="textPrimary" noWrap />
				</frame>
			))}
			<frame key="wrap" LayoutOrder={20} Size={new UDim2(1, 0, 0, 56)} BackgroundTransparency={1} BorderSizePixel={0}>
				<Typography
					text="Wrapped body stays at the top of its box and keeps reading when the line is longer than the frame."
					variant="body"
					color="textSecondary"
				/>
			</frame>
			<frame key="clamp" LayoutOrder={21} Size={new UDim2(1, 0, 0, 20)} BackgroundTransparency={1} BorderSizePixel={0}>
				<Typography text="This single line truncates instead of spilling into the next row of the matrix" variant="body" noWrap />
			</frame>
			<frame key="colors" LayoutOrder={22} Size={new UDim2(1, 0, 0, 20)} BackgroundTransparency={1} BorderSizePixel={0}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, gap)}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				{COLORS.map((color, index) => (
					<frame key={color} LayoutOrder={index} Size={new UDim2(0, 88, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
						<Typography text={color} variant="caption" color={color} noWrap />
					</frame>
				))}
			</frame>
		</scrollingframe>
	);
}

export default {
	title: "Components/Typography",
	preview: { kind: "gui", width: 360, height: 480 },
	render: () => <TypographyMatrix />,
};
