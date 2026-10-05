import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";

const VARIANTS = ["h1", "h2", "h3", "body", "button", "caption", "overline"] as const;

function TypographyGallery() {
	const { theme } = useTheme();

	return (
		<scrollingframe
			key="TypographyGallery"
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			ScrollBarThickness={6}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
		>
			<uilistlayout
				key="Layout"
				SortOrder={Enum.SortOrder.LayoutOrder}
				Padding={new UDim(0, theme.spacing.calc(1))}
				FillDirection={Enum.FillDirection.Vertical}
			/>
			{VARIANTS.map((variant, index) => {
				const size = theme.typography.fontSizes[variant] ?? theme.typography.fontSizes.body ?? 14;
				const font = theme.typography.fontFamilies.default ?? Enum.Font.SourceSans;
				return (
					<frame
						key={variant}
						Size={new UDim2(1, 0, 0, size + theme.spacing.calc(1))}
						BackgroundTransparency={1}
						LayoutOrder={index}
					>
						<textlabel
							key="Sample"
							Size={new UDim2(1, 0, 1, 0)}
							BackgroundTransparency={1}
							TextXAlignment={Enum.TextXAlignment.Left}
							Text={`${variant}  ${size}px`}
							TextColor3={theme.palette.text.primary}
							TextSize={size}
							Font={font}
						/>
					</frame>
				);
			})}
		</scrollingframe>
	);
}

export default {
	title: "Theme/Typography",
	preview: { kind: "gui", width: 420, height: 360 },
	render: () => <TypographyGallery />,
};
