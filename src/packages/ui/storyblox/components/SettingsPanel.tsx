import React, { useState } from "@rbxts/react";
import { Button, Chip, Input, Typography, useTheme, WriteableStyle } from "@rbxts/uiblox";
import { DEFAULT_STORY_ROOTS, encodeRootList, parseRootList } from "packages/storyRoots";

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
			<Typography key="Title" text="Story folders" variant="h6" className={{ LayoutOrder: 1 } as WriteableStyle<TextLabel>} />
			<Typography
				key="DefaultsLabel"
				text="Always scanned"
				variant="caption"
				color="secondary"
				className={{ LayoutOrder: 2 } as WriteableStyle<TextLabel>}
			/>
			<>
				{DEFAULT_STORY_ROOTS.map((path, index) => (
					<Typography
						key={`default-${path}`}
						text={path}
						variant="body"
						className={{ LayoutOrder: 3 + index } as WriteableStyle<TextLabel>}
					/>
				))}
			</>
			<Typography
				key="ExtraLabel"
				text="Extra folders"
				variant="caption"
				color="secondary"
				className={{ LayoutOrder: 20 } as WriteableStyle<TextLabel>}
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
					className={{ LayoutOrder: 21 } as WriteableStyle<TextLabel>}
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
		</scrollingframe>
	);
}

export default SettingsPanel;
