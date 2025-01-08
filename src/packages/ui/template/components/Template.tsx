import React, { useEffect, useState } from "@rbxts/react";
import { Story } from "../../../../interfaces";
import { Button, DEFAULT_THEME, Shadow, WriteableStyle } from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import useTemplateStyles from "./Template.styles";

export interface TemplateProps {
	story?: Story;
}

function Template({ story }: TemplateProps) {
	const { root, container, corner, navBar, canvas } = useTemplateStyles();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [, setRenderedStory] = useState<Story<any> | undefined>();
	const [template, setTemplate] = useState<React.Element | undefined>();
	const [, setTemplateCallback] = useState<() => void | undefined>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const renderStory = (story: Story<any>) => {
		let alreadyRendered = false;
		setRenderedStory((oldStory) => {
			alreadyRendered = oldStory?.title === story.title; // Story with same name is already rendered
			return alreadyRendered ? oldStory : story;
		});

		// Do not render more than once
		if (alreadyRendered) {
			return;
		}

		// Fetch template element or tuple (with element and maid)
		const [element, callback] = story.template(story?.props) as LuaTuple<[StoryElement, StoryCallback]>;

		if (callback !== undefined) {
			// Template is not a React element
			setTemplate(element);

			setTemplateCallback((oldCallback) => {
				if (oldCallback !== undefined) {
					oldCallback();
				}
				return callback;
			});
		} else {
			// Template is a React element
			const element = story.template(story?.props) as StoryElement;
			setTemplate(element);

			setTemplateCallback((oldCallback) => {
				if (oldCallback) {
					oldCallback();
				}
				return undefined;
			});
		}
	};

	useEffect((): void => {
		if (story !== undefined) {
			renderStory(story);
		}
	}, [story]);

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
								Size: new UDim2(0, DEFAULT_THEME.spacing.calc(5), 0, DEFAULT_THEME.spacing.calc(2)),
								Font: DEFAULT_THEME.typography.fontFamilies.semibold,
								TextColor3: DEFAULT_THEME.options.constants.extendedPalette.Gray[50],
							} as WriteableStyle<TextButton>
						}
					></Button>
				</frame>

				<Canvas className={canvas}>{template}</Canvas>
			</frame>
		</frame>
	);
}

export default Template;
