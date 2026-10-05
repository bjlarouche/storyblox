import { classNames, createStyles, makeStyles, Theme } from "@rbxts/uiblox";

export interface LabelStyleProps {
	variant: "primary" | "secondary" | "error";
	emphasis: boolean;
}

export const useLabelStyles = makeStyles<LabelStyleProps>((theme: Theme, { variant, emphasis }: LabelStyleProps) => {
	const text = {
		primary: theme.palette.text.primary,
		secondary: theme.palette.text.secondary,
		error: theme.palette.status.error.main,
	};
	return createStyles({
		label: classNames<TextLabel>(
			{
				Size: new UDim2(1, 0, 0, theme.spacing.calc(4)),
				BackgroundColor3: theme.palette.surface.canvas,
				BorderSizePixel: 0,
				TextColor3: text[variant],
				Font: theme.typography.fontFamilies.light,
				TextScaled: true,
			},
			emphasis
				? { BackgroundColor3: theme.palette.surface.elevated, Font: theme.typography.fontFamilies.bold }
				: undefined,
		),
	});
});
