import React, { useEffect, useState } from "@rbxts/react";
import { Story } from "../../../../interfaces";
import { Button, Shadow, Theme, useTheme, WriteableStyle } from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import { createCleanupGate, readTemplateResult } from "../cleanupGate";
import useTemplateStyles from "./Template.styles";

export interface TemplateProps {
	story?: Story;
}

function Template({ story }: TemplateProps) {
	const { root, container, corner, navBar, canvas } = useTemplateStyles();
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
			const template = story.template as (props: unknown, context: { theme: Theme }) => unknown;
			const [element, callback] = template(story.props, { theme }) as LuaTuple<
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
					<Button
						variant="text"
						text="Canvas"
						size="small"
						color="secondary"
						className={
							{
								Size: new UDim2(0, theme.spacing.calc(5), 0, theme.spacing.calc(2)),
								Font: theme.typography.fontFamilies.semibold,
								TextColor3: theme.options.constants.colors.textMuted,
							} as WriteableStyle<TextButton>
						}
					></Button>
				</frame>

				<Canvas className={canvas}>
					{template}
				</Canvas>
			</frame>
		</frame>
	);
}

export default Template;
