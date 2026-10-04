import { classNames, createStyles, makeStyles, Theme } from "@rbxts/uiblox";

export interface LabelStyleProps {
	variant: "primary" | "secondary" | "error";
	emphasis: boolean;
}

export const useLabelStyles = makeStyles<LabelStyleProps>((theme: Theme, { variant, emphasis }: LabelStyleProps) => {
	const colors = theme.options.constants.colors;
	const text = {
		primary: theme.palette.text.primary,
		secondary: theme.palette.text.secondary,
		error: theme.palette.error.main,
	};
	return createStyles({
		label: classNames<TextLabel>(
			{
				Size: new UDim2(1, 0, 0, theme.spacing.calc(4)),
				BackgroundColor3: colors.backgroundUIDefault,
				BorderSizePixel: 0,
				TextColor3: text[variant],
				Font: theme.typography.fontFamilies.light,
				TextScaled: true,
			},
			emphasis
				? { BackgroundColor3: colors.backgroundUIContrast, Font: theme.typography.fontFamilies.bold }
				: undefined,
		),
	});
});
