import { createStyles, makeStyles, Theme, WriteableStyle } from "@rbxts/uiblox";

const useStoriesSidebarStyles = makeStyles((theme: Theme) => {
	const filterOffset = theme.spacing.calc(4) + theme.padding.calc(2);
	const filterHeight = theme.spacing.calc(3) + theme.padding.calc(1);
	const storiesOffset = filterOffset + filterHeight + theme.padding.calc(2);
	const moreOffset = theme.spacing.calc(5) + theme.padding.calc(2);
	const light = theme.type === "Light";
	const rowHeight = theme.spacing.calc(3);

	return createStyles({
		logo: {
			Size: new UDim2(1, -theme.padding.calc(4), 0, theme.spacing.calc(3)),
			Position: new UDim2(0.5, 0, 0, 0),
			AnchorPoint: new Vector2(0.5, 0),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ImageColor3: theme.palette.text.primary,
			ScaleType: Enum.ScaleType.Fit,
			ClipsDescendants: true,
			ZIndex: 5100,
		} as WriteableStyle<ImageLabel>,
		filterInput: {
			Position: new UDim2(0.5, 0, 0, filterOffset),
			AnchorPoint: new Vector2(0.5, 0),
			Size: new UDim2(1, -theme.padding.calc(4), 0, filterHeight),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
		} as WriteableStyle<Frame>,
		storiesTree: {
			Size: new UDim2(1, 0, 1, -(storiesOffset + moreOffset + theme.padding.calc(2))),
			Position: new UDim2(0, 0, 0, storiesOffset),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ClipsDescendants: true,
			ZIndex: 5100,
		} as WriteableStyle<Frame>,
		resultsList: {
			Size: new UDim2(1, 0, 1, 0),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ScrollBarThickness: theme.spacing.calc(0.5),
			ScrollBarImageTransparency: 0.75,
			ClipsDescendants: true,
			ZIndex: 5100,
		} as WriteableStyle<ScrollingFrame>,
		resultRow: {
			Size: new UDim2(1, -theme.padding.calc(2), 0, rowHeight),
			Position: UDim2.fromScale(0.5, 0),
			AnchorPoint: new Vector2(0.5, 0),
			BackgroundColor3: theme.palette.primary.main,
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			AutoButtonColor: false,
			Text: "",
			ZIndex: 5200,
		} as WriteableStyle<TextButton>,
		resultRowActive: {
			BackgroundTransparency: light ? 0.92 : 0.85,
		} as WriteableStyle<TextButton>,
		resultIcon: {
			Position: new UDim2(0, theme.padding.calc(2), 0.5, 0),
			AnchorPoint: new Vector2(0, 0.5),
			ZIndex: 5210,
		} as WriteableStyle<ImageLabel>,
		resultLeaf: {
			Size: new UDim2(1, -(theme.spacing.calc(2) + theme.padding.calc(4)), 0, theme.spacing.calc(1)),
			Position: new UDim2(0, theme.spacing.calc(1.5) + theme.padding.calc(3), 0, theme.padding.calc(1)),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			TextXAlignment: Enum.TextXAlignment.Left,
			TextTruncate: Enum.TextTruncate.AtEnd,
			ZIndex: 5210,
		} as WriteableStyle<TextLabel>,
		resultPath: {
			Size: new UDim2(1, -(theme.spacing.calc(2) + theme.padding.calc(4)), 0, theme.spacing.calc(1)),
			Position: new UDim2(
				0,
				theme.spacing.calc(1.5) + theme.padding.calc(3),
				0,
				theme.padding.calc(1) + theme.spacing.calc(1),
			),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			TextXAlignment: Enum.TextXAlignment.Left,
			TextTruncate: Enum.TextTruncate.AtEnd,
			ZIndex: 5210,
		} as WriteableStyle<TextLabel>,
		emptyLabel: {
			Size: new UDim2(1, -theme.padding.calc(4), 0, theme.spacing.calc(1)),
			Position: new UDim2(0, theme.padding.calc(2), 0, theme.padding.calc(2)),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			TextXAlignment: Enum.TextXAlignment.Left,
			ZIndex: 5100,
		} as WriteableStyle<TextLabel>,
		divider: {
			Position: new UDim2(0.5, 0, 1, -(moreOffset + theme.padding.calc(1))),
			AnchorPoint: new Vector2(0.5, 0),
			ZIndex: 5001,
		} as WriteableStyle<Frame>,
		versionLabel: {
			Size: new UDim2(1, -theme.padding.calc(4), 0, theme.spacing.calc(1)),
			Position: new UDim2(0, theme.padding.calc(2), 1, -theme.padding.calc(2)),
			AnchorPoint: new Vector2(0, 1),
			FontSize: theme.typography.fontSizes.caption,
			Font: theme.typography.fontFamilies.light,
			TextColor3: theme.palette.text.secondary,
			TextScaled: true,
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ZIndex: 5100,
		} as WriteableStyle<TextLabel>,
		statusLabel: {
			Position: new UDim2(0, theme.padding.calc(2), 1, -(theme.padding.calc(3) + theme.spacing.calc(1))),
		} as WriteableStyle<TextLabel>,
	});
});

export default useStoriesSidebarStyles;
