import { createStyles, makeStyles, Theme, WriteableStyle } from "@rbxts/uiblox";

function searchRowMetrics(theme: Theme) {
	const inset = theme.padding.calc(1);
	const title = theme.typography.variants.body;
	const path = theme.typography.variants.caption;
	const titleHeight = math.ceil(title.size * (title.leading ?? 1));
	const pathHeight = math.ceil(path.size * (path.leading ?? 1));
	const pathTop = inset + titleHeight + theme.spacing.calc(1);
	return {
		inset,
		titleHeight,
		pathHeight,
		pathTop,
		slot: pathTop + pathHeight + inset + theme.padding.calc(1),
	};
}

export function searchRowSlot(theme: Theme) {
	return searchRowMetrics(theme).slot;
}

const useStoriesSidebarStyles = makeStyles((theme: Theme) => {
	const filterOffset = theme.spacing.calc(4) + theme.padding.calc(2);
	const filterHeight = theme.spacing.calc(3) + theme.padding.calc(1);
	const tagOffset = filterOffset + filterHeight + theme.padding.calc(1);
	const storiesOffset = tagOffset + filterHeight + theme.padding.calc(2);
	const moreOffset = theme.spacing.calc(5) + theme.padding.calc(2);
	const light = theme.type === "Light";
	const row = searchRowMetrics(theme);

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
		tagFilters: {
			Position: new UDim2(0.5, 0, 0, tagOffset),
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
			Size: new UDim2(1, -theme.padding.calc(2), 1, -theme.padding.calc(1)),
			Position: UDim2.fromScale(0.5, 0.5),
			AnchorPoint: new Vector2(0.5, 0.5),
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
			Size: new UDim2(1, -(theme.spacing.calc(2) + theme.padding.calc(4)), 0, row.titleHeight),
			Position: new UDim2(0, theme.spacing.calc(1.5) + theme.padding.calc(3), 0, row.inset),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			TextXAlignment: Enum.TextXAlignment.Left,
			TextYAlignment: Enum.TextYAlignment.Bottom,
			TextTruncate: Enum.TextTruncate.AtEnd,
			ZIndex: 5210,
		} as WriteableStyle<TextLabel>,
		resultPath: {
			Size: new UDim2(1, -(theme.spacing.calc(2) + theme.padding.calc(4)), 0, row.pathHeight),
			Position: new UDim2(0, theme.spacing.calc(1.5) + theme.padding.calc(3), 0, row.pathTop),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			TextXAlignment: Enum.TextXAlignment.Left,
			TextYAlignment: Enum.TextYAlignment.Top,
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
			Size: new UDim2(1, -theme.padding.calc(4), 0, theme.spacing.calc(2)),
			Position: new UDim2(0, theme.padding.calc(2), 1, -theme.padding.calc(2)),
			AnchorPoint: new Vector2(0, 1),
			TextSize: theme.typography.fontSizes.caption,
			Font: theme.typography.fontFamilies.default,
			TextColor3: theme.palette.text.secondary,
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ZIndex: 5100,
		} as WriteableStyle<TextLabel>,
		statusLabel: {
			Position: new UDim2(0, theme.padding.calc(2), 1, -(theme.padding.calc(3) + theme.spacing.calc(2))),
		} as WriteableStyle<TextLabel>,
	});
});

export default useStoriesSidebarStyles;
