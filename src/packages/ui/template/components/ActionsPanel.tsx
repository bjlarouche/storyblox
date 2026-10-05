import React, { useState } from "@rbxts/react";
import { Theme } from "@rbxts/uiblox";
import { formatActionLine } from "packages/formatAction";
import { StoryAction } from "packages/storyActions";
import { useDragScroll } from "../../scroll";

export interface ActionsPanelProps {
	theme: Theme;
	events: StoryAction[];
	disabled?: boolean;
	onReset: () => void;
}

function ActionsPanel({ theme, events, disabled, onReset }: ActionsPanelProps) {
	const [listFrame, setListFrame] = useState<ScrollingFrame>();
	const drag = useDragScroll(listFrame);
	const gap = new UDim(0, theme.padding.calc(1));
	const muted = theme.palette.text.secondary;
	const rows = new Array<React.Element>();
	for (let index = events.size() - 1; index >= 0; index--) {
		const event = events[index];
		rows.push(
			<textlabel
				key={`action-${index}`}
				Text={formatActionLine(event)}
				LayoutOrder={events.size() - index}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				TextWrapped={true}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>,
		);
	}

	return (
		<scrollingframe
			key="ActionsList"
			ref={setListFrame}
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={theme.palette.surface.paper}
			BorderSizePixel={0}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollingDirection={Enum.ScrollingDirection.Y}
			ScrollBarThickness={theme.spacing.calc(0.5)}
			ScrollBarImageTransparency={0.75}
			ClipsDescendants={true}
		>
			<uipadding PaddingTop={gap} PaddingBottom={gap} PaddingLeft={gap} PaddingRight={gap} />
			<uilistlayout Padding={new UDim(0, theme.spacing.calc(1))} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame key="Header" LayoutOrder={-3} Size={new UDim2(1, 0, 0, theme.spacing.calc(1.5))} BackgroundTransparency={1}>
				<textlabel
					key="ActionsTitle"
					Text={disabled === true ? "Actions (off)" : "Actions"}
					Size={new UDim2(1, -theme.spacing.calc(4), 1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.primary}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Center}
				/>
				{events.size() > 0 && disabled !== true && (
					<textbutton
						key="Clear"
						Text="Clear"
						Size={new UDim2(0, theme.spacing.calc(4), 1, 0)}
						Position={new UDim2(1, 0, 0, 0)}
						AnchorPoint={new Vector2(1, 0)}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Right}
						Event={{
							MouseButton1Click: () => {
								if (drag.suppressClick()) return;
								onReset();
							},
						}}
					/>
				)}
			</frame>
			{disabled === true ? (
				<textlabel
					key="Disabled"
					Text="Actions are disabled for this story"
					LayoutOrder={0}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					TextWrapped={true}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={muted}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			) : events.size() === 0 ? (
				<textlabel
					key="Empty"
					Text="No actions yet"
					LayoutOrder={0}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					TextWrapped={true}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={muted}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			) : (
				rows
			)}
		</scrollingframe>
	);
}

export default ActionsPanel;
