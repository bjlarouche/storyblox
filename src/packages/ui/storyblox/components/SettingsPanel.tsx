import React, { useState } from "@rbxts/react";
import { Button, Card, Container, Icon, IconButton, Icons, Input, ListItem, Typography, useTheme, WriteableStyle } from "@rbxts/uiblox";
import { DEFAULT_STORY_ROOTS, encodeRootList, lookupRootPath, parseRootList, rootPathIssue } from "packages/storyRoots";

const SHORTCUTS = [
	["Storyblox: Focus search", "Focus the story filter"],
	["Storyblox: Remount story", "Remount the selected story"],
	["Storyblox: Zoom in", "Zoom the canvas preview in"],
	["Storyblox: Zoom out", "Zoom the canvas preview out"],
	["Storyblox: Toggle grid", "Toggle the canvas grid"],
	["Storyblox: Toggle fit", "Toggle fit vs 100% canvas scale"],
	["Storyblox: Reload stories", "Reload story modules"],
	["Storyblox: Flip orientation", "Flip a sized preview between portrait and landscape"],
	["Storyblox: Cycle background", "Cycle the canvas background"],
	["Storyblox: Allow workspace preview", "Let workspace stories mount into Workspace this session"],
];

const fill = (order: number) => ({ LayoutOrder: order, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y });

export interface SettingsPanelProps {
	extraRoots?: string;
	onExtraRootsChange?: (value: string) => void;
	onClose?: () => void;
}

function SettingsPanel({ extraRoots = "", onExtraRootsChange, onClose }: SettingsPanelProps) {
	const { theme } = useTheme();
	const extras = parseRootList(extraRoots);
	const [draft, setDraft] = useState("");
	const issue = rootPathIssue(draft, extras);
	const gap = theme.spacing.calc(2);
	const rowGap = theme.padding.calc(1);
	const addWidth = theme.spacing.calc(9);
	const add = (text = draft) => {
		if (rootPathIssue(text, extras) !== undefined) return;
		onExtraRootsChange?.(encodeRootList([...extras, ...parseRootList(text)]));
		setDraft("");
	};
	const folder = (tint: Color3) => (
		<frame key="Glyph" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} VerticalAlignment={Enum.VerticalAlignment.Center} />
			<Icon icon={Icons.OpenBox} size="sm" tint={tint} />
		</frame>
	);

	return (
		<scrollingframe
			key="Settings"
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollingDirection={Enum.ScrollingDirection.Y}
			ScrollBarThickness={theme.spacing.calc(0.5)}
		>
			<uipadding PaddingTop={new UDim(0, gap)} PaddingBottom={new UDim(0, gap)} />
			<Container maxWidth="sm">
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, gap)} SortOrder={Enum.SortOrder.LayoutOrder} />
				<frame key="Header" {...fill(1)} BackgroundTransparency={1}>
					<Typography key="Title" text="Settings" variant="h5" />
					{onClose !== undefined && (
						<IconButton
							icon={Icons.Close}
							size="sm"
							tint={theme.palette.text.secondary}
							onClick={onClose}
							className={{ Position: UDim2.fromScale(1, 0.5), AnchorPoint: new Vector2(1, 0.5) } as WriteableStyle<ImageButton>}
						/>
					)}
				</frame>
				<Card key="Folders" title="Story folders" subtitle="Where Storyblox looks for story modules." fullWidth className={fill(2) as WriteableStyle<Frame>}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, rowGap)} SortOrder={Enum.SortOrder.LayoutOrder} />
					<>
						{DEFAULT_STORY_ROOTS.map((path, index) => (
							<ListItem
								key={`default-${path}`}
								text={path}
								secondary="Built-in"
								dense
								wrap
								leading={folder(theme.palette.text.secondary)}
								className={fill(index) as WriteableStyle<TextButton>}
							/>
						))}
					</>
					<>
						{extras.map((path, index) => {
							const found = lookupRootPath(path) !== undefined;
							return (
								<ListItem
									key={`extra-${path}`}
									text={path}
									secondary={found ? "Found" : "Not found"}
									dense
									wrap
									leading={folder(found ? theme.palette.primary.main : theme.palette.status.warning.main)}
									trailing={
										<IconButton
											icon={Icons.Close}
											size="xs"
											tint={theme.palette.text.secondary}
											onClick={() => onExtraRootsChange?.(encodeRootList(extras.filter((item) => item !== path)))}
											className={{ Position: UDim2.fromScale(1, 0.5), AnchorPoint: new Vector2(1, 0.5) } as WriteableStyle<ImageButton>}
										/>
									}
									className={fill(10 + index) as WriteableStyle<TextButton>}
								/>
							);
						})}
					</>
					<frame key="AddRow" {...fill(100)} BackgroundTransparency={1}>
						<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, rowGap)} SortOrder={Enum.SortOrder.LayoutOrder} />
						<Input
							key="Path"
							text={draft}
							placeholder="ReplicatedStorage.Stories"
							width={new UDim(1, -(addWidth + rowGap))}
							size="small"
							variant="outlined"
							hasError={issue !== undefined && issue !== ""}
							helperText={issue !== undefined && issue !== "" ? issue : undefined}
							className={{ LayoutOrder: 1 } as WriteableStyle<Frame>}
							onInput={setDraft}
							onEnterPressed={add}
						/>
						<Button
							key="Add"
							text="Add"
							size="small"
							disabled={issue !== undefined}
							className={{ LayoutOrder: 2, Size: UDim2.fromOffset(addWidth, 0) } as WriteableStyle<TextButton>}
							onLeftClick={() => add()}
						/>
					</frame>
				</Card>
				<Card key="Shortcuts" title="Shortcuts" subtitle="Assign keys in Studio's Customize Shortcuts." fullWidth className={fill(3) as WriteableStyle<Frame>}>
					<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
					<>
						{SHORTCUTS.map(([label, description], index) => (
							<ListItem
								key={label}
								text={label.gsub("^Storyblox: ", "")[0]}
								secondary={description}
								dense
								wrap
								divider={index < SHORTCUTS.size() - 1}
								className={fill(index) as WriteableStyle<TextButton>}
							/>
						))}
					</>
				</Card>
			</Container>
		</scrollingframe>
	);
}

export default SettingsPanel;
