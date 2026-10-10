import React from "@rbxts/react";
import { Button, Paper, useTheme } from "@rbxts/uiblox";

const TYPE = ["display", "h1", "h3", "body", "bodySmall", "caption"] as const;
const STEPS = [1, 2, 3, 4] as const;
const SIZES = ["small", "medium", "large"] as const;
const ELEVATION = ["flat", "raised", "outlined"] as const;

function heading(order: number, text: string, color: Color3, font: Enum.Font) {
	return (
		<textlabel
			key={`h-${order}`}
			LayoutOrder={order}
			Size={new UDim2(1, 0, 0, 18)}
			BackgroundTransparency={1}
			Text={text}
			TextColor3={color}
			TextSize={14}
			Font={font}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	);
}

function DesignTokens() {
	const { theme } = useTheme();
	const ink = theme.palette.text.primary;
	const muted = theme.palette.text.secondary;
	const font = theme.typography.fontFamilies.default ?? Enum.Font.SourceSans;
	const motion = (theme as unknown as { motion?: { fast: number; default: number; slow: number } }).motion;
	const radius = (theme.shape as unknown as { radius?: { small: number; default: number; large: number } }).radius;
	const variants = theme.typography.variants as unknown as Record<string, { size?: number } | undefined>;
	const icons = theme.options.constants.iconSizes;
	const swatches = [
		{ name: "primary", color: theme.palette.primary.main },
		{ name: "paper", color: theme.palette.surface.paper },
		{ name: "success", color: theme.palette.status.success.main },
		{ name: "warning", color: theme.palette.status.warning.main },
		{ name: "error", color: theme.palette.status.error.main },
		{ name: "info", color: theme.palette.status.info.main },
	];

	return (
		<scrollingframe
			Size={new UDim2(0, 400, 0, 640)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			ScrollBarThickness={6}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
		>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.spacing.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding PaddingTop={new UDim(0, theme.padding.calc(2))} PaddingBottom={new UDim(0, theme.padding.calc(2))} PaddingLeft={new UDim(0, theme.padding.calc(2))} PaddingRight={new UDim(0, theme.padding.calc(2))} />
			{heading(0, "Type", muted, font)}
			<>
				{TYPE.map((name, index) => {
					const spec = variants[name];
					const size = spec?.size ?? theme.typography.fontSizes.body ?? 14;
					return (
						<textlabel
							key={name}
							LayoutOrder={index + 1}
							Size={new UDim2(1, 0, 0, 0)}
							AutomaticSize={Enum.AutomaticSize.Y}
							BackgroundTransparency={1}
							Text={`${name}  ${size}`}
							TextSize={size}
							Font={font}
							TextColor3={ink}
							TextXAlignment={Enum.TextXAlignment.Left}
						/>
					);
				})}
			</>
			{heading(20, "Spacing", muted, font)}
			<frame LayoutOrder={21} Size={new UDim2(1, 0, 0, theme.spacing.calc(4))} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, theme.padding.calc(1))} VerticalAlignment={Enum.VerticalAlignment.Bottom} />
				<>
					{STEPS.map((step) => {
						const px = theme.spacing.calc(step);
						return (
							<frame key={`s-${step}`} Size={new UDim2(0, px, 0, px)} BackgroundColor3={theme.palette.primary.main} BorderSizePixel={0} />
						);
					})}
				</>
			</frame>
			{heading(30, "Palette", muted, font)}
			<frame LayoutOrder={31} Size={new UDim2(1, 0, 0, 36)} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, theme.padding.calc(1))} />
				<>
					{swatches.map((swatch) => (
						<frame key={swatch.name} Size={new UDim2(0, 36, 0, 36)} BackgroundColor3={swatch.color} BorderSizePixel={0}>
							<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
						</frame>
					))}
				</>
			</frame>
			{heading(40, "Radii", muted, font)}
			<frame LayoutOrder={41} Size={new UDim2(1, 0, 0, 40)} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, theme.padding.calc(2))} VerticalAlignment={Enum.VerticalAlignment.Center} />
				<>
					{(
						[
							["small", radius?.small ?? theme.shape.borderRadius],
							["default", radius?.default ?? theme.shape.borderRadius],
							["large", radius?.large ?? theme.shape.borderRadius],
						] as const
					).map(([name, value]) => (
						<frame key={name} Size={new UDim2(0, 48, 0, 28)} BackgroundColor3={theme.palette.surface.paper} BorderSizePixel={0}>
							<uicorner CornerRadius={new UDim(0, value)} />
							<uistroke Color={theme.palette.border} Thickness={1} />
							<textlabel Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} Text={`${name} ${value}`} TextSize={10} Font={font} TextColor3={ink} />
						</frame>
					))}
				</>
			</frame>
			{heading(50, "Controls", muted, font)}
			<frame LayoutOrder={51} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, theme.padding.calc(2))} VerticalAlignment={Enum.VerticalAlignment.Center} />
				<>
					{SIZES.map((size) => (
						<Button key={size} text={size} size={size} />
					))}
				</>
			</frame>
			{heading(60, "Icons", muted, font)}
			<frame LayoutOrder={61} Size={new UDim2(1, 0, 0, icons.large)} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, theme.padding.calc(2))} VerticalAlignment={Enum.VerticalAlignment.Center} />
				<>
					{(
						[
							["small", icons.small],
							["medium", icons.medium],
							["large", icons.large],
						] as const
					).map(([name, px]) => (
						<frame key={name} Size={new UDim2(0, px, 0, px)} BackgroundColor3={theme.palette.text.primary} BorderSizePixel={0} />
					))}
				</>
			</frame>
			{heading(70, "Elevation", muted, font)}
			<frame LayoutOrder={71} Size={new UDim2(1, 0, 0, 48)} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, theme.padding.calc(2))} />
				<>
					{ELEVATION.map((elevation) => (
						<Paper key={elevation} elevation={elevation}>
							<textlabel
								Size={new UDim2(0, 88, 0, 36)}
								BackgroundTransparency={1}
								Text={elevation}
								TextSize={12}
								Font={font}
								TextColor3={ink}
							/>
						</Paper>
					))}
				</>
			</frame>
			{heading(80, "Motion", muted, font)}
			<textlabel
				LayoutOrder={81}
				Size={new UDim2(1, 0, 0, 18)}
				BackgroundTransparency={1}
				Text={
					motion
						? `fast ${motion.fast}   default ${motion.default}   slow ${motion.slow}`
						: "motion token missing"
				}
				TextSize={theme.typography.fontSizes.body ?? 14}
				Font={font}
				TextColor3={ink}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</scrollingframe>
	);
}

export default {
	title: "Theme/Design Tokens",
	preview: { kind: "gui", width: 420, height: 680 },
	render: () => <DesignTokens />,
};
