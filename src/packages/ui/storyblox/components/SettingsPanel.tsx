import React, { useState } from "@rbxts/react";
import { Button, Chip, Input, Typography, useTheme, WriteableStyle } from "@rbxts/uiblox";
import { DEFAULT_STORY_ROOTS, encodeRootList, parseRootList } from "packages/storyRoots";

const row = (order: number) =>
	({ LayoutOrder: order, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }) as WriteableStyle<TextLabel>;

const SHORTCUTS = [
	"Storyblox: Focus search",
	"Storyblox: Remount story",
	"Storyblox: Zoom in",
	"Storyblox: Zoom out",
	"Storyblox: Toggle grid",
	"Storyblox: Toggle fit",
	"Storyblox: Reload stories",
	"Storyblox: Flip orientation",
	"Storyblox: Cycle background",
	"Storyblox: Allow workspace preview",
];

export interface SettingsPanelProps {
	extraRoots?: string;
	onExtraRootsChange?: (value: string) => void;
}

function SettingsPanel({ extraRoots = "", onExtraRootsChange }: SettingsPanelProps) {
	const { theme } = useTheme();
	const extras = parseRootList(extraRoots);
	const [draft, setDraft] = useState("");
	const gap = theme.padding.calc(1);
	const add = () => {
		const paths = parseRootList(`${extraRoots},${draft}`);
		onExtraRootsChange?.(encodeRootList(paths));
		setDraft("");
	};

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
			<uipadding PaddingTop={new UDim(0, gap)} PaddingBottom={new UDim(0, gap)} PaddingLeft={new UDim(0, gap)} PaddingRight={new UDim(0, gap)} />
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, gap)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Typography key="Title" text="Story folders" variant="h6" className={row(1)} />
			<Typography
				key="DefaultsLabel"
				text="Always scanned"
				variant="caption"
				color="secondary"
				className={row(2)}
			/>
			<>
				{DEFAULT_STORY_ROOTS.map((path, index) => (
					<Typography
						key={`default-${path}`}
						text={path}
						variant="body"
						className={row(3 + index)}
					/>
				))}
			</>
			<Typography
				key="ExtraLabel"
				text="Extra folders"
				variant="caption"
				color="secondary"
				className={row(20)}
			/>
			{extras.size() > 0 ? (
				<>
					{extras.map((path, index) => (
						<Chip
							key={`extra-${path}`}
							label={path}
							size="small"
							variant="outlined"
							className={{ LayoutOrder: 21 + index } as WriteableStyle<TextButton>}
							onDelete={() => {
								onExtraRootsChange?.(encodeRootList(extras.filter((item) => item !== path)));
							}}
						/>
					))}
				</>
			) : (
				<Typography
					key="NoExtra"
					text="None"
					variant="body"
					color="secondary"
					className={row(21)}
				/>
			)}
			<Input
				key="Path"
				text={draft}
				placeholder="ReplicatedStorage.Stories"
				width={new UDim(1, 0)}
				size="small"
				className={{ LayoutOrder: 40 } as WriteableStyle<Frame>}
				onTextChanged={setDraft}
				onEnterPressed={add}
			/>
			<Button
				key="Add"
				text="Add"
				size="small"
				className={{ LayoutOrder: 41 } as WriteableStyle<TextButton>}
				onLeftClick={add}
			/>
			<Typography key="Shortcuts" text="Shortcuts" variant="h6" className={row(50)} />
			<Typography
				key="ShortcutsHint"
				text="Bind these in Studio"
				variant="caption"
				color="secondary"
				className={row(51)}
			/>
			<>
				{SHORTCUTS.map((label, index) => (
					<Typography key={label} text={label} variant="body" className={row(52 + index)} />
				))}
			</>
		</scrollingframe>
	);
}

export default SettingsPanel;
