import { createStyles, makeStyles, Theme, WriteableStyle } from "@rbxts/uiblox";

const useTemplateStyles = makeStyles((theme: Theme) => {
	return createStyles({
		root: {
			Size: new UDim2(1, 0, 1, 0),
			BackgroundColor3: theme.options.constants.colors.backgroundUIMuted,
			BorderSizePixel: 0,
			ClipsDescendants: true,
			ZIndex: 100,
		} as WriteableStyle<Frame>,
		container: {
			Size: new UDim2(1, -theme.padding.calc(2), 1, -theme.padding.calc(2)),
			Position: new UDim2(0.5, 0, 0.5, 0),
			AnchorPoint: new Vector2(0.5, 0.5),
			BackgroundColor3: theme.options.constants.colors.backgroundUIDefault,
			BorderSizePixel: 0,
			ClipsDescendants: true,
			ZIndex: 200,
		} as WriteableStyle<Frame>,
		corner: {
			CornerRadius: new UDim(0, theme.shape.borderRadius),
		} as WriteableStyle<UICorner>,
		navBar: {
			Size: new UDim2(1, 0, 0, theme.spacing.calc(2)),
			Position: new UDim2(0.5, 0, 0, 0),
			AnchorPoint: new Vector2(0.5, 0),
			BackgroundColor3: theme.options.constants.colors.navigationBar,
			BorderSizePixel: 0,
			ClipsDescendants: true,
			ZIndex: 300,
		} as WriteableStyle<Frame>,
		title: {
			Size: new UDim2(1, -theme.spacing.calc(5), 1, 0),
			Position: new UDim2(0, theme.spacing.calc(0.5), 0, 0),
			BackgroundTransparency: 1,
			TextXAlignment: Enum.TextXAlignment.Left,
			TextTruncate: Enum.TextTruncate.AtEnd,
			Font: theme.typography.fontFamilies.semibold,
			TextSize: theme.typography.fontSizes.caption,
			TextColor3: theme.options.constants.colors.textMuted,
			ZIndex: 300,
		} as WriteableStyle<TextLabel>,
		preview: {
			Size: new UDim2(1, 0, 1, -theme.spacing.calc(2)),
			Position: new UDim2(0, 0, 0, theme.spacing.calc(2)),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ZIndex: 300,
		} as WriteableStyle<Frame>,
		canvas: {
			Size: new UDim2(1, 0, 1, 0),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ZIndex: 300,
		} as WriteableStyle<ScrollingFrame>,
	});
});

export default useTemplateStyles;
