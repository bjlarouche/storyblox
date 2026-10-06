import React, { useState } from "@rbxts/react";
import { Theme } from "@rbxts/uiblox";
import { CaseResult } from "packages/storyCases";
import { useDragScroll } from "../../scroll";

export interface InteractionsPanelProps {
	theme: Theme;
	cases: string[];
	results: CaseResult[];
	running?: string;
	onRun: (name: string) => void;
	onRerun: () => void;
}

function resultFor(results: CaseResult[], name: string): CaseResult | undefined {
	for (let index = results.size() - 1; index >= 0; index--) {
		if (results[index].name === name) return results[index];
	}
	return undefined;
}

function InteractionsPanel({ theme, cases, results, running, onRun, onRerun }: InteractionsPanelProps) {
	const [listFrame, setListFrame] = useState<ScrollingFrame>();
	const [selected, setSelected] = useState<string | undefined>();
	const drag = useDragScroll(listFrame);
	const gap = new UDim(0, theme.padding.calc(1));
	const muted = theme.palette.text.secondary;
	const last = results.size() > 0 ? results[results.size() - 1] : undefined;
	const focus = selected ?? last?.name;
	const focused = focus !== undefined ? resultFor(results, focus) : undefined;
	const rows = new Array<React.Element>();
	for (let index = 0; index < cases.size(); index++) {
		const name = cases[index];
		const result = resultFor(results, name);
		const status =
			running === name ? "running" : result === undefined ? "idle" : result.passed ? "pass" : `fail (${result.failures.size()})`;
		rows.push(
			<frame key={`case-${name}`} LayoutOrder={index + 1} Size={new UDim2(1, 0, 0, theme.spacing.calc(1.5))} BackgroundTransparency={1}>
				<textbutton
					key="Run"
					Text={name}
					Size={new UDim2(1, -theme.spacing.calc(6), 1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={name === focus ? theme.palette.text.primary : theme.palette.primary.main}
					TextXAlignment={Enum.TextXAlignment.Left}
					Event={{
						MouseButton1Click: () => {
							if (drag.suppressClick()) return;
							setSelected(name);
							onRun(name);
						},
					}}
				/>
				<textbutton
					key="Status"
					Text={status}
					Size={new UDim2(0, theme.spacing.calc(5.5), 1, 0)}
					Position={new UDim2(1, 0, 0, 0)}
					AnchorPoint={new Vector2(1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={result?.passed === false ? theme.palette.status.error.main : muted}
					TextXAlignment={Enum.TextXAlignment.Right}
					Event={{
						MouseButton1Click: () => {
							if (drag.suppressClick()) return;
							setSelected(name);
						},
					}}
				/>
			</frame>,
		);
	}

	const detail = new Array<React.Element>();
	if (focus !== undefined) {
		const state = running === focus ? "running" : focused === undefined ? "idle" : focused.passed ? "pass" : "fail";
		const elapsed =
			focused?.elapsed !== undefined ? ` · ${string.format("%.0f", focused.elapsed * 1000)}ms` : "";
		detail.push(
			<textlabel
				key="InspectTitle"
				Text={`${focus}: ${state}${elapsed}`}
				LayoutOrder={1000}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				TextWrapped={true}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>,
		);
		const failures = focused?.failures ?? [];
		if (failures.size() === 0) {
			detail.push(
				<textlabel
					key="InspectEmpty"
					Text={focused === undefined ? "Not run yet" : "No errors"}
					LayoutOrder={1001}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					TextWrapped={true}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.default}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={muted}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>,
			);
		} else {
			for (let failIndex = 0; failIndex < failures.size(); failIndex++) {
				detail.push(
					<textlabel
						key={`inspect-fail-${failIndex}`}
						Text={failures[failIndex]}
						LayoutOrder={1001 + failIndex}
						Size={new UDim2(1, 0, 0, 0)}
						AutomaticSize={Enum.AutomaticSize.Y}
						TextWrapped={true}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.default}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.status.error.main}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>,
				);
			}
		}
	}
	for (const line of detail) rows.push(line);

	return (
		<scrollingframe
			key="InteractionsList"
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
			<uilistlayout Padding={new UDim(0, theme.spacing.calc(0.5))} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame key="Header" LayoutOrder={-3} Size={new UDim2(1, 0, 0, theme.spacing.calc(1.5))} BackgroundTransparency={1}>
				<textlabel
					key="Title"
					Text="Steps"
					Size={new UDim2(1, -theme.spacing.calc(4), 1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.primary}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Center}
				/>
				{last !== undefined && (
					<textbutton
						key="Rerun"
						Text="Rerun"
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
								onRerun();
							},
						}}
					/>
				)}
			</frame>
			{cases.size() === 0 ? (
				<textlabel
					key="Empty"
					Text="No steps"
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

export default InteractionsPanel;
