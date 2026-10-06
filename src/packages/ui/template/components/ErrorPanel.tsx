import React, { useRef } from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";

export interface ErrorPanelProps {
	message: string;
	title?: string;
	compact?: boolean;
	onRetry?: () => void;
}

function ErrorPanel({ message, title = "Error", compact = false, onRetry }: ErrorPanelProps) {
	const { theme } = useTheme();
	const box = useRef<TextBox>();
	const bar = theme.spacing.calc(compact ? 1.5 : 2);
	const action = (key: string, text: string, order: number, onClick: () => void) => (
		<textbutton
			key={key}
			Text={text}
			LayoutOrder={order}
			AutomaticSize={Enum.AutomaticSize.X}
			Size={new UDim2(0, 0, 1, 0)}
			BackgroundTransparency={1}
			Font={theme.typography.fontFamilies.semibold}
			TextSize={theme.typography.fontSizes.caption}
			TextColor3={theme.palette.primary.main}
			Event={{ MouseButton1Click: onClick }}
		/>
	);

	return (
		<frame
			key="ErrorPanel"
			Size={new UDim2(1, 0, compact ? 0 : 1, compact ? theme.spacing.calc(8) : 0)}
			BackgroundTransparency={1}
			ZIndex={10}
		>
			<frame key="Bar" Size={new UDim2(1, 0, 0, bar)} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={new UDim(0, theme.spacing.calc(1))}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				<textlabel
					key="Title"
					Text={title}
					LayoutOrder={1}
					AutomaticSize={Enum.AutomaticSize.X}
					Size={new UDim2(0, 0, 1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.status.error.main}
				/>
				{action("SelectAll", "Select all", 2, () => {
					const rbx = box.current;
					if (rbx === undefined) return;
					rbx.CaptureFocus();
					rbx.SelectionStart = 1;
					rbx.CursorPosition = rbx.Text.size() + 1;
				})}
				{onRetry !== undefined && action("Retry", "Retry", 3, onRetry)}
			</frame>
			<scrollingframe
				key="Stack"
				Position={new UDim2(0, 0, 0, bar)}
				Size={new UDim2(1, 0, 1, -bar)}
				CanvasSize={new UDim2(0, 0, 0, 0)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
				ScrollingDirection={Enum.ScrollingDirection.Y}
				ScrollBarThickness={theme.spacing.calc(0.5)}
				ScrollBarImageTransparency={0.5}
				BackgroundColor3={theme.palette.surface.paper}
				BorderSizePixel={0}
			>
				<uipadding
					PaddingTop={new UDim(0, theme.padding.calc(1))}
					PaddingBottom={new UDim(0, theme.padding.calc(1))}
					PaddingLeft={new UDim(0, theme.padding.calc(1))}
					PaddingRight={new UDim(0, theme.padding.calc(1))}
				/>
				<textbox
					key="Message"
					ref={box}
					Text={message}
					TextEditable={false}
					ClearTextOnFocus={false}
					MultiLine={true}
					TextWrapped={true}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.status.error.main}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Top}
				/>
			</scrollingframe>
		</frame>
	);
}

export default ErrorPanel;
