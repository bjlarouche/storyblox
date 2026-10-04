import React, { useEffect, useState } from "@rbxts/react";
import { Story } from "../../../../interfaces";
import { IconButton, Icons, Shadow, Theme, useTheme, WriteableStyle } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import { createCleanupGate, readTemplateResult } from "../cleanupGate";
import useTemplateStyles from "./Template.styles";

const REMOUNT_ICON = "rbxassetid://75431112013973" as Icons;
const CONTROLS_MIN = 120;

const SplitPane = (
	Uiblox as unknown as {
		SplitPane: (props: {
			vertical?: boolean;
			value: number;
			onChange: (value: number) => void;
			min?: number;
			first?: React.ReactNode;
			second?: React.ReactNode;
		}) => React.Element;
	}
).SplitPane;

export interface TemplateProps {
	story?: Story;
	primaryThemeEnabled?: boolean;
	onToggleTheme?: () => void;
}

function Template({ story, primaryThemeEnabled, onToggleTheme }: TemplateProps) {
	const { root, container, corner, navBar, title, preview, canvas } = useTemplateStyles();
	const { theme } = useTheme();
	const [gate] = useState(createCleanupGate);
	const [template, setTemplate] = useState<React.Element | undefined>();
	const [failure, setFailure] = useState<unknown>();
	const [epoch, setEpoch] = useState(0);
	const [split, setSplit] = useState(10000);

	useEffect(() => {
		return () => gate.dispose();
	}, [gate]);

	useEffect(() => {
		gate.replace(undefined);
		if (story === undefined) {
			setTemplate(undefined);
			return;
		}

		try {
			const render = story.template as (props: unknown, context: { theme: Theme }) => unknown;
			const [element, callback] = render(story.props, { theme }) as LuaTuple<
				[StoryElement, StoryCallback | undefined]
			>;
			const parsed = readTemplateResult(element, callback);
			const inset = theme.padding.calc(2);
			setTemplate(
				<frame key={`mount-${epoch}`} Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
					<uipadding
						key="Inset"
						PaddingTop={new UDim(0, inset)}
						PaddingBottom={new UDim(0, inset)}
						PaddingLeft={new UDim(0, inset)}
						PaddingRight={new UDim(0, inset)}
					/>
					{parsed.element as React.Element}
				</frame>,
			);
			gate.replace(parsed.cleanup);
		} catch (error) {
			setTemplate(undefined);
			gate.replace(undefined);
			setFailure(error);
		}
	}, [story, gate, theme, epoch]);

	if (failure !== undefined) {
		throw failure;
	}

	return (
		<frame key="Template" {...root}>
			<frame key="Container" {...container}>
				<uicorner key="Corner" {...corner} />
				<Shadow />

				<frame key="NavBar" {...navBar}>
					<textlabel key="Title" Text={story?.title ?? "Canvas"} {...title} />
					{onToggleTheme && (
						<>
							<IconButton
								id="Remount"
								icon={REMOUNT_ICON}
								tint={theme.options.constants.colors.textMuted}
								onClick={() => setEpoch((current) => current + 1)}
								className={
									{
										Size: new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5)),
										AnchorPoint: new Vector2(1, 0.5),
										Position: new UDim2(1, -theme.spacing.calc(2.5), 0.5, 0),
									} as WriteableStyle<ImageButton>
								}
							/>
							<IconButton
								id="Theme"
								icon={primaryThemeEnabled ? Icons.DarkTheme : Icons.LightTheme}
								tint={theme.options.constants.colors.textMuted}
								onClick={onToggleTheme}
								className={
									{
										Size: new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5)),
										AnchorPoint: new Vector2(1, 0.5),
										Position: new UDim2(1, -theme.spacing.calc(0.5), 0.5, 0),
									} as WriteableStyle<ImageButton>
								}
							/>
						</>
					)}
				</frame>

				<frame key="Preview" {...preview}>
					<SplitPane
						vertical
						value={split}
						min={CONTROLS_MIN}
						onChange={setSplit}
						first={<Canvas className={canvas}>{template}</Canvas>}
						second={
							<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
								<uipadding
									key="ControlsInset"
									PaddingTop={new UDim(0, theme.padding.calc(2))}
									PaddingLeft={new UDim(0, theme.padding.calc(2))}
									PaddingRight={new UDim(0, theme.padding.calc(2))}
								/>
								<textlabel
									key="ControlsTitle"
									Text="Controls"
									Size={new UDim2(1, 0, 0, theme.spacing.calc(1))}
									BackgroundTransparency={1}
									Font={theme.typography.fontFamilies.semibold}
									TextSize={theme.typography.fontSizes.caption}
									TextColor3={theme.options.constants.colors.textMuted}
									TextXAlignment={Enum.TextXAlignment.Left}
								/>
							</frame>
						}
					/>
				</frame>
			</frame>
		</frame>
	);
}

export default Template;
