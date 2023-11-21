import { createStyles, makeStyles, ROBLOX_UI_OFFSET, Theme, WriteableStyle } from "@rbxts/uiblox";

const useStoriesSidebarStyles = makeStyles((theme: Theme) => {
	const logoOffset = theme.spacing.calc(2);
	const filterOffset = logoOffset + theme.spacing.calc(3) + theme.padding.calc(2);
	const storiesOffset = filterOffset + theme.spacing.calc(2) + theme.padding.calc(2);
	const moreOffset = theme.spacing.calc(4) + theme.padding.calc(2);

	return createStyles({
		themeButton: {
			Size: new UDim2(
				0,
				theme.options.constants.iconSizes.medium + theme.padding.calc(2),
				0,
				theme.options.constants.iconSizes.medium + theme.padding.calc(2),
			),
			Position: new UDim2(
				0,
				theme.spacing.calc(9) + theme.padding.calc(2.5),
				0,
				theme.padding.calc(1) - ROBLOX_UI_OFFSET,
			),
			AnchorPoint: new Vector2(0, 0),
			BackgroundColor3: Color3.fromRGB(0, 0, 0),
			BackgroundTransparency: 0.3,
			BorderSizePixel: 0,
			Text: "",
			ClipsDescendants: true,
			ZIndex: 5100,
		} as WriteableStyle<TextButton>,
		menuIcon: {
			Position: new UDim2(0.5, 0, 0.5, 0),
			AnchorPoint: new Vector2(0.5, 0.5),
			ImageColor3: theme.options.constants.extendedPalette.Common.White,
			ZIndex: 5100,
		} as WriteableStyle<ImageLabel>,
		corner: {
			CornerRadius: new UDim(theme.options.constants.iconSizes.medium + theme.padding.calc(2)),
		} as WriteableStyle<UICorner>,
		logo: {
			Size: new UDim2(1, -theme.padding.calc(4), 0, theme.spacing.calc(2)),
			Position: new UDim2(0.5, 0, 0, logoOffset),
			AnchorPoint: new Vector2(0.5, 0),
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ScaleType: Enum.ScaleType.Fit,
			ClipsDescendants: true,
			ZIndex: 5100,
		} as WriteableStyle<ImageLabel>,
		filterInput: {
			Position: new UDim2(0.5, 0, 0, filterOffset),
			AnchorPoint: new Vector2(0.5, 0),
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
		divider: {
			Position: new UDim2(0.5, 0, 1, -(moreOffset + theme.padding.calc(1))),
			AnchorPoint: new Vector2(0.5, 0),
			ZIndex: 5001,
		} as WriteableStyle<Frame>,
		versionLabel: {
			Size: new UDim2(1, -theme.padding.calc(4), 0, theme.spacing.calc(1)),
			Position: new UDim2(0, theme.padding.calc(2), 1, -(theme.spacing.calc(1) + theme.padding.calc(4))),
			AnchorPoint: new Vector2(0, 1),
			FontSize: theme.typography.fontSizes.caption,
			Font: theme.typography.fontFamilies.light,
			TextColor3: theme.options.constants.colors.textMuted,
			TextScaled: true,
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ZIndex: 5100,
		} as WriteableStyle<TextLabel>,
		releaseLabel: {
			Size: new UDim2(1, -theme.padding.calc(4), 0, theme.spacing.calc(1)),
			Position: new UDim2(0, theme.padding.calc(2), 1, -theme.padding.calc(2)),
			AnchorPoint: new Vector2(0, 1),
			FontSize: theme.typography.fontSizes.caption,
			Font: theme.typography.fontFamilies.italics,
			TextColor3: theme.options.constants.extendedPalette.Orange[50],
			TextScaled: true,
			BackgroundTransparency: 1,
			BorderSizePixel: 0,
			ZIndex: 5100,
		} as WriteableStyle<TextLabel>,
	});
});

export default useStoriesSidebarStyles;
