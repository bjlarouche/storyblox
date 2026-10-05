import React, { useState } from "@rbxts/react";
import { Theme } from "@rbxts/uiblox";
import { StoryAction } from "packages/storyActions";
import { ArgValues } from "../storyArgs";
import ActionsPanel from "./ActionsPanel";
import Controls from "./Controls";

export type InspectorTab = "controls" | "actions";

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
}

function InspectorPane(props: InspectorPaneProps) {
	const { theme, actions } = props;
	const tabs: InspectorTab[] = actions !== undefined ? ["controls", "actions"] : ["controls"];
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
							Text={name === "controls" ? "Controls" : "Actions"}
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
				{current === "actions" && actions !== undefined && (
					<ActionsPanel
						theme={theme}
						events={actions.events}
						disabled={actions.disabled}
						onReset={actions.onReset}
					/>
				)}
			</frame>
		</frame>
	);
}

export default InspectorPane;
