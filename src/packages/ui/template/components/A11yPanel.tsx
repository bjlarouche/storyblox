import React, { useState } from "@rbxts/react";
import { Theme } from "@rbxts/uiblox";
import { A11yFinding } from "packages/a11yHeuristics";
import { useDragScroll } from "../../scroll";

export interface A11yPanelProps {
	theme: Theme;
	findings: A11yFinding[];
	onRescan: () => void;
}

function A11yPanel({ theme, findings, onRescan }: A11yPanelProps) {
	const [listFrame, setListFrame] = useState<ScrollingFrame>();
	const drag = useDragScroll(listFrame);
	const gap = new UDim(0, theme.padding.calc(1));
	const muted = theme.palette.text.secondary;
	const rows = new Array<React.Element>();
	for (let index = 0; index < findings.size(); index++) {
		const finding = findings[index];
		rows.push(
			<frame
				key={`finding-${index}`}
				LayoutOrder={index + 1}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
			>
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} Padding={new UDim(0, 2)} />
				<textlabel
					key="Msg"
					Text={`${finding.severity}: ${finding.message}`}
					LayoutOrder={1}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					TextWrapped={true}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={finding.severity === "error" ? theme.palette.status.error.main : muted}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
				<textlabel
					key="Target"
					Text={finding.target}
					LayoutOrder={2}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					TextWrapped={true}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={muted}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			</frame>,
		);
	}

	return (
		<scrollingframe
			key="A11yList"
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
					key="Title"
					Text="A11y"
					Size={new UDim2(1, -theme.spacing.calc(4), 1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.primary}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Center}
				/>
				<textbutton
					key="Rescan"
					Text="Rescan"
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
							onRescan();
						},
					}}
				/>
			</frame>
			{findings.size() === 0 ? (
				<textlabel
					key="Empty"
					Text="No a11y findings"
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
				<>
					{rows}
				</>
			)}
		</scrollingframe>
	);
}

export default A11yPanel;
