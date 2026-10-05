import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";

const STEPS = [0.5, 1, 1.5, 2, 3, 4] as const;

function SpacingGallery() {
	const { theme } = useTheme();

	return (
		<scrollingframe
			key="SpacingGallery"
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
			<textlabel
				key="Density"
				Size={new UDim2(1, 0, 0, 20)}
				BackgroundTransparency={1}
				TextXAlignment={Enum.TextXAlignment.Left}
				Text={`density=${theme.density}  spacing.default=${theme.spacing.default}  radius=${theme.shape.borderRadius}`}
				TextColor3={theme.palette.text.secondary}
				TextSize={theme.typography.fontSizes.caption ?? 12}
				Font={theme.typography.fontFamilies.default}
				LayoutOrder={0}
			/>
			{STEPS.map((step, index) => {
				const px = theme.spacing.calc(step);
				return (
					<frame
						key={`step-${step}`}
						Size={new UDim2(1, 0, 0, math.max(px, 24))}
						BackgroundTransparency={1}
						LayoutOrder={index + 1}
					>
						<frame
							key="Bar"
							Size={new UDim2(0, px, 0, px)}
							BackgroundColor3={theme.palette.primary.main}
							BorderSizePixel={0}
						>
							<uicorner key="Corner" CornerRadius={new UDim(0, theme.shape.borderRadius)} />
						</frame>
						<textlabel
							key="Label"
							Size={new UDim2(1, -(px + theme.spacing.calc(1)), 1, 0)}
							Position={new UDim2(0, px + theme.spacing.calc(1), 0, 0)}
							BackgroundTransparency={1}
							TextXAlignment={Enum.TextXAlignment.Left}
							Text={`spacing.calc(${step}) = ${px}px`}
							TextColor3={theme.palette.text.primary}
							TextSize={theme.typography.fontSizes.body ?? 14}
							Font={theme.typography.fontFamilies.default}
						/>
					</frame>
				);
			})}
		</scrollingframe>
	);
}

export default {
	title: "Theme/Spacing",
	preview: { kind: "gui", width: 420, height: 360 },
	render: () => <SpacingGallery />,
};
