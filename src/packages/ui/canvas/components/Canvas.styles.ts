import { createStyles, makeStyles, Theme, WriteableStyle } from "@rbxts/uiblox";

const useCanvasStyles = makeStyles((theme: Theme) => {
	return createStyles({
		root: {
			Size: new UDim2(1, -theme.padding.calc(2), 1, -theme.padding.calc(2)),
			Position: new UDim2(0.5, 0, 0.5, 0),
			AnchorPoint: new Vector2(0.5, 0.5),
			BackgroundTransparency: 1,
			ClipsDescendants: true,
			ZIndex: 200,
		} as WriteableStyle<Frame>,
		scrollable: {
			Size: new UDim2(1, 0, 1, 0),
			Position: new UDim2(0, 0, 0, 0),
			AutomaticCanvasSize: Enum.AutomaticSize.XY,
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ClipsDescendants: true,
			ScrollBarThickness: theme.spacing.calc(0.5),
			ScrollBarImageTransparency: 0.75,
			ZIndex: 300,
		} as WriteableStyle<ScrollingFrame>,
		pageLayout: {
			VerticalAlignment: Enum.VerticalAlignment.Top,
			HorizontalAlignment: Enum.HorizontalAlignment.Left,
		} as WriteableStyle<UIPageLayout>,
		padding: {
			PaddingBottom: new UDim(0, theme.padding.calc(2)),
			PaddingLeft: new UDim(0, theme.padding.calc(2)),
			PaddingRight: new UDim(0, theme.padding.calc(2)),
			PaddingTop: new UDim(0, theme.padding.calc(2)),
		} as WriteableStyle<UIPadding>,
	});
});

export default useCanvasStyles;
