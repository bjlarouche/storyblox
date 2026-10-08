import React, { useState } from "@rbxts/react";
import { Theme } from "@rbxts/uiblox";
import { useDragScroll } from "../../scroll";

export interface DocsPanelProps {
	theme: Theme;
	title?: string;
	description?: unknown;
	argTypes?: unknown;
	source?: string;
}

interface Spec {
	type?: string;
	control?: string;
	description?: string;
	optional?: boolean;
}

function propRows(argTypes: unknown): Array<{ name: string; type: string; note: string }> {
	const rows = new Array<{ name: string; type: string; note: string }>();
	if (typeOf(argTypes) !== "table") return rows;
	for (const [key, value] of pairs(argTypes as object)) {
		const spec = value as Spec;
		const typeName = typeOf(spec?.type) === "string" ? (spec.type as string) : "unknown";
		const control = typeOf(spec?.control) === "string" ? ` · ${spec.control}` : "";
		const optional = spec?.optional === true ? " optional" : "";
		const note =
			typeOf(spec?.description) === "string" ? (spec.description as string) : `${typeName}${control}${optional}`;
		rows.push({ name: key as string, type: typeName, note });
	}
	return rows;
}

function DocsPanel({ theme, title, description, argTypes, source }: DocsPanelProps) {
	const [listFrame, setListFrame] = useState<ScrollingFrame>();
	useDragScroll(listFrame);
	const gap = new UDim(0, theme.padding.calc(1));
	const muted = theme.palette.text.secondary;
	const props = propRows(argTypes);
	const rows = new Array<React.Element>();
	let order = 1;

	if (typeOf(title) === "string" && (title as string).size() > 0) {
		rows.push(
			<textlabel
				key="Title"
				Text={title as string}
				LayoutOrder={order}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				TextWrapped={true}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.body}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>,
		);
		order += 1;
	}

	if (typeOf(description) === "string" && (description as string).size() > 0) {
		rows.push(
			<textlabel
				key="Description"
				Text={description as string}
				LayoutOrder={order}
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
		order += 1;
	}

	if (props.size() > 0) {
		rows.push(
			<textlabel
				key="PropsHeader"
				Text="Props"
				LayoutOrder={order}
				Size={new UDim2(1, 0, 0, theme.spacing.calc(1.25))}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>,
		);
		order += 1;
		for (const prop of props) {
			rows.push(
				<frame
					key={`prop-${prop.name}`}
					LayoutOrder={order}
					Size={new UDim2(1, 0, 0, 0)}
					AutomaticSize={Enum.AutomaticSize.Y}
					BackgroundTransparency={1}
				>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} Padding={new UDim(0, 2)} />
					<textlabel
						key="Name"
						Text={`${prop.name}: ${prop.type}`}
						LayoutOrder={1}
						Size={new UDim2(1, 0, 0, 0)}
						AutomaticSize={Enum.AutomaticSize.Y}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
					<textlabel
						key="Note"
						Text={prop.note}
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
			order += 1;
		}
	}

	if (typeOf(source) === "string" && (source as string).size() > 0) {
		rows.push(
			<textlabel
				key="SourceHeader"
				Text="Source"
				LayoutOrder={order}
				Size={new UDim2(1, 0, 0, theme.spacing.calc(1.25))}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>,
		);
		order += 1;
		rows.push(
			<textbox
				key="Source"
				Text={source as string}
				ClearTextOnFocus={false}
				TextEditable={false}
				LayoutOrder={order}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				TextWrapped={true}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={muted}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
			/>,
		);
	}

	return (
		<scrollingframe
			key="DocsList"
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
					key="DocsTitle"
					Text="Docs"
					Size={new UDim2(1, 0, 1, 0)}
					BackgroundTransparency={1}
					Font={theme.typography.fontFamilies.semibold}
					TextSize={theme.typography.fontSizes.caption}
					TextColor3={theme.palette.text.primary}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Center}
				/>
			</frame>
			{rows.size() === 0 ? (
				<textlabel
					key="Empty"
					Text="No docs for this story"
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

export default DocsPanel;
