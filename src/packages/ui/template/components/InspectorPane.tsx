import React, { useState } from "@rbxts/react";
import { Theme } from "@rbxts/uiblox";
import { A11yFinding } from "packages/a11yHeuristics";
import { CaseResult } from "packages/storyCases";
import { StoryAction } from "packages/storyActions";
import { ArgValues } from "../storyArgs";
import A11yPanel from "./A11yPanel";
import ActionsPanel from "./ActionsPanel";
import Controls from "./Controls";
import DocsPanel from "./DocsPanel";
import InteractionsPanel from "./InteractionsPanel";

export type InspectorTab = "controls" | "actions" | "interactions" | "docs" | "a11y";

export interface InspectorPaneProps {
	theme: Theme;
	args: ArgValues;
	argTypes?: unknown;
	defaults?: unknown;
	description?: unknown;
	onChange: (key: string, value: unknown) => void;
	onReset: () => void;
	actions?: {
		events: StoryAction[];
		disabled?: boolean;
		onReset: () => void;
	};
	interactions?: {
		cases: string[];
		results: CaseResult[];
		running?: string;
		onRun: (name: string) => void;
		onRerun: () => void;
	};
	docs?: {
		title?: string;
		description?: unknown;
		argTypes?: unknown;
		source?: string;
	};
	a11y?: {
		findings: A11yFinding[];
		onRescan: () => void;
	};
}

function tabLabel(tab: InspectorTab) {
	if (tab === "controls") return "Controls";
	if (tab === "actions") return "Actions";
	if (tab === "interactions") return "Interact";
	if (tab === "docs") return "Docs";
	return "A11y";
}

function availableTabs(props: InspectorPaneProps): InspectorTab[] {
	const tabs: InspectorTab[] = ["controls"];
	if (props.actions !== undefined) tabs.push("actions");
	if (props.interactions !== undefined) tabs.push("interactions");
	if (props.docs !== undefined) tabs.push("docs");
	if (props.a11y !== undefined) tabs.push("a11y");
	return tabs;
}

function InspectorPane(props: InspectorPaneProps) {
	const { theme } = props;
	const tabs = availableTabs(props);
	const [tab, setTab] = useState<InspectorTab>("controls");
	const current = tabs.includes(tab) ? tab : "controls";
	const barHeight = theme.spacing.calc(1.5);

	return (
		<frame key="InspectorPane" Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
			{tabs.size() > 1 && (
				<frame
					key="Tabs"
					Size={new UDim2(1, 0, 0, barHeight)}
					BackgroundColor3={theme.palette.surface.paper}
					BorderSizePixel={0}
				>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						Padding={new UDim(0, theme.spacing.calc(1))}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
					<uipadding
						PaddingLeft={new UDim(0, theme.padding.calc(1))}
						PaddingRight={new UDim(0, theme.padding.calc(1))}
					/>
					{tabs.map((name, index) => (
						<textbutton
							key={name}
							Text={tabLabel(name)}
							LayoutOrder={index}
							AutomaticSize={Enum.AutomaticSize.X}
							Size={new UDim2(0, 0, 1, 0)}
							BackgroundTransparency={1}
							Font={theme.typography.fontFamilies.semibold}
							TextSize={theme.typography.fontSizes.caption}
							TextColor3={name === current ? theme.palette.text.primary : theme.palette.text.secondary}
							Event={{ MouseButton1Click: () => setTab(name) }}
						/>
					))}
				</frame>
			)}
			<frame
				key="Body"
				Size={new UDim2(1, 0, 1, tabs.size() > 1 ? -barHeight : 0)}
				Position={new UDim2(0, 0, 0, tabs.size() > 1 ? barHeight : 0)}
				BackgroundTransparency={1}
			>
				{current === "controls" && (
					<Controls
						theme={theme}
						args={props.args}
						argTypes={props.argTypes}
						defaults={props.defaults}
						description={props.description}
						onChange={props.onChange}
						onReset={props.onReset}
					/>
				)}
				{current === "actions" && props.actions !== undefined && (
					<ActionsPanel
						theme={theme}
						events={props.actions.events}
						disabled={props.actions.disabled}
						onReset={props.actions.onReset}
					/>
				)}
				{current === "interactions" && props.interactions !== undefined && (
					<InteractionsPanel
						theme={theme}
						cases={props.interactions.cases}
						results={props.interactions.results}
						running={props.interactions.running}
						onRun={props.interactions.onRun}
						onRerun={props.interactions.onRerun}
					/>
				)}
				{current === "docs" && props.docs !== undefined && (
					<DocsPanel
						theme={theme}
						title={props.docs.title}
						description={props.docs.description}
						argTypes={props.docs.argTypes}
						source={props.docs.source}
					/>
				)}
				{current === "a11y" && props.a11y !== undefined && (
					<A11yPanel theme={theme} findings={props.a11y.findings} onRescan={props.a11y.onRescan} />
				)}
			</frame>
		</frame>
	);
}

export default InspectorPane;
