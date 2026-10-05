import React from "@rbxts/react";
import { contrastRatio, createDarkPalette, createLightPalette, useTheme } from "@rbxts/uiblox";

interface Swatch {
	name: string;
	color: Color3;
	on?: Color3;
}

type SemanticPalette = ReturnType<typeof createLightPalette>;

function hex(color: Color3): string {
	const r = math.floor(color.R * 255 + 0.5);
	const g = math.floor(color.G * 255 + 0.5);
	const b = math.floor(color.B * 255 + 0.5);
	return string.format("#%02X%02X%02X", r, g, b);
}

function rows(palette: SemanticPalette): Swatch[] {
	return [
		{ name: "surface.canvas", color: palette.surface.canvas, on: palette.text.primary },
		{ name: "surface.paper", color: palette.surface.paper, on: palette.text.primary },
		{ name: "surface.elevated", color: palette.surface.elevated, on: palette.text.primary },
		{ name: "surface.overlay", color: palette.surface.overlay, on: palette.text.primary },
		{ name: "surface.input", color: palette.surface.input, on: palette.text.primary },
		{ name: "primary.main", color: palette.primary.main, on: palette.primary.on },
		{ name: "accent.main", color: palette.accent.main, on: palette.accent.on },
		{ name: "text.primary", color: palette.text.primary, on: palette.surface.canvas },
		{ name: "text.secondary", color: palette.text.secondary, on: palette.surface.canvas },
		{ name: "text.disabled", color: palette.text.disabled, on: palette.surface.canvas },
		{ name: "text.link", color: palette.text.link, on: palette.surface.canvas },
		{ name: "border", color: palette.border, on: palette.surface.paper },
		{ name: "divider", color: palette.divider, on: palette.surface.paper },
		{ name: "focus", color: palette.focus, on: palette.surface.paper },
		{ name: "action.hover", color: palette.action.hover },
		{ name: "action.pressed", color: palette.action.pressed },
		{ name: "action.selected", color: palette.action.selected },
		{ name: "action.disabled", color: palette.action.disabled },
		{ name: "status.success", color: palette.status.success.main, on: palette.status.success.on },
		{ name: "status.warning", color: palette.status.warning.main, on: palette.status.warning.on },
		{ name: "status.error", color: palette.status.error.main, on: palette.status.error.on },
		{ name: "status.info", color: palette.status.info.main, on: palette.status.info.on },
		{ name: "backdrop", color: palette.backdrop },
		{ name: "shadow", color: palette.shadow },
	];
}

function PaletteGallery() {
	const { theme } = useTheme();
	const palette = theme.type === "Light" ? createLightPalette() : createDarkPalette();
	const swatches = rows(palette);

	return (
		<scrollingframe
			key="PaletteGallery"
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			ScrollBarThickness={6}
			CanvasSize={new UDim2(0, 0, 0, swatches.size() * 36)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
		>
			<uilistlayout
				key="Layout"
				SortOrder={Enum.SortOrder.LayoutOrder}
				Padding={new UDim(0, 4)}
				FillDirection={Enum.FillDirection.Vertical}
			/>
			{swatches.map((swatch, index) => {
				const pair = swatch.on;
				const ratio = pair !== undefined ? contrastRatio(swatch.color, pair) : undefined;
				const label =
					ratio !== undefined
						? `${swatch.name}  ${hex(swatch.color)}  vs ${hex(pair!)}  ${string.format("%.2f", ratio)}:1`
						: `${swatch.name}  ${hex(swatch.color)}`;
				return (
					<frame
						key={swatch.name}
						Size={new UDim2(1, 0, 0, 32)}
						BackgroundTransparency={1}
						LayoutOrder={index}
					>
						<frame
							key="Swatch"
							Size={new UDim2(0, 32, 0, 32)}
							BackgroundColor3={swatch.color}
							BorderSizePixel={0}
						>
							<uicorner key="Corner" CornerRadius={new UDim(0, 4)} />
						</frame>
						<textlabel
							key="Name"
							Size={new UDim2(1, -40, 1, 0)}
							Position={new UDim2(0, 40, 0, 0)}
							BackgroundTransparency={1}
							TextXAlignment={Enum.TextXAlignment.Left}
							Text={label}
							TextColor3={theme.palette.text.primary}
							Font={Enum.Font.Code}
							TextSize={14}
						/>
					</frame>
				);
			})}
		</scrollingframe>
	);
}

export default {
	title: "Theme/Palette",
	preview: { kind: "gui", width: 520, height: 640 },
	render: () => <PaletteGallery />,
};
