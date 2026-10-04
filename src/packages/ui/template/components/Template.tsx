import React, { useEffect, useState } from "@rbxts/react";
import { Story } from "../../../../interfaces";
import { IconButton, Icons, Shadow, Theme, useTheme, WriteableStyle } from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import { createCleanupGate, readTemplateResult } from "../cleanupGate";
import useTemplateStyles from "./Template.styles";

export interface TemplateProps {
	story?: Story;
	primaryThemeEnabled?: boolean;
	onToggleTheme?: () => void;
}

function Template({ story, primaryThemeEnabled, onToggleTheme }: TemplateProps) {
	const { root, container, corner, navBar, title, canvas } = useTemplateStyles();
	const { theme } = useTheme();
	const [gate] = useState(createCleanupGate);
	const [template, setTemplate] = useState<React.Element | undefined>();
	const [failure, setFailure] = useState<unknown>();

	useEffect(() => {
		return () => gate.dispose();
	}, [gate]);

	useEffect(() => {
		if (story === undefined) {
			gate.replace(undefined);
			setTemplate(undefined);
			return;
		}

		try {
			const render = story.template as (props: unknown, context: { theme: Theme }) => unknown;
			const [element, callback] = render(story.props, { theme }) as LuaTuple<
				[StoryElement, StoryCallback | undefined]
			>;
			const parsed = readTemplateResult(element, callback);
			setTemplate(parsed.element as React.Element);
			gate.replace(parsed.cleanup);
		} catch (error) {
			setTemplate(undefined);
			gate.replace(undefined);
			setFailure(error);
		}
	}, [story, gate, theme]);

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
						<IconButton
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
					)}
				</frame>

				<Canvas className={canvas}>{template}</Canvas>
			</frame>
		</frame>
	);
}

export default Template;
