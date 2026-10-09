import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";

function FontsStory() {
	const { theme } = useTheme();
	const ink = theme.palette.text.primary;
	const fonts = new Array<Enum.Font>();
	for (const item of Enum.Font.GetEnumItems()) {
		if (item !== Enum.Font.Unknown) fonts.push(item);
	}
	const base = Font.fromEnum(Enum.Font.SourceSans);
	const weights = Enum.FontWeight.GetEnumItems();
	const faces = Enum.FontStyle.GetEnumItems();
	const line = (order: number, text: string, face: Font) => (
		<textlabel
			key={`${order}-${text}`}
			LayoutOrder={order}
			Size={new UDim2(1, 0, 0, 22)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			Text={text}
			TextColor3={ink}
			TextSize={theme.typography.fontSizes.body}
			FontFace={face}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextTruncate={Enum.TextTruncate.AtEnd}
		/>
	);
	let order = 0;
	return (
		<scrollingframe
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollBarThickness={theme.spacing.calc(0.5)}
			ScrollBarImageColor3={theme.palette.text.secondary}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, theme.padding.calc(1))}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<uipadding
				PaddingTop={new UDim(0, theme.padding.calc(2))}
				PaddingBottom={new UDim(0, theme.padding.calc(2))}
				PaddingLeft={new UDim(0, theme.padding.calc(2))}
				PaddingRight={new UDim(0, theme.padding.calc(2))}
			/>
			{fonts.map((item) => {
				order += 1;
				return line(order, item.Name, Font.fromEnum(item));
			})}
			{weights.map((weight) => {
				order += 1;
				return line(order, `SourceSans ${weight.Name}`, new Font(base.Family, weight, base.Style));
			})}
			{faces.map((face) => {
				order += 1;
				return line(order, `SourceSans ${face.Name}`, new Font(base.Family, base.Weight, face));
			})}
			<textlabel
				key="Rich"
				LayoutOrder={order + 1}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				RichText={true}
				Text={
					'<b>Bold</b>  <i>italic</i>  <u>under</u>  <s>strike</s><br/><font face="RobotoMono" color="#66CCFF">mono</font>'
				}
				TextColor3={ink}
				TextSize={theme.typography.fontSizes.body}
				Font={theme.typography.fontFamilies.default}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</scrollingframe>
	);
}

export default {
	title: "Theme/Fonts",
	preview: { kind: "gui", width: 360, height: 520 },
	render: () => <FontsStory />,
};
