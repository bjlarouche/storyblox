import Roact from "@rbxts/roact";
import { withHooks, useEffect, useState } from "@rbxts/roact-hooked";
import { Story } from "../../../../interfaces";
import { DefaultTheme, Shadow } from "@rbxts/uiblox";
import { Button } from "@rbxts/uiblox/out/ui/packages/button";
import { WriteableStyle } from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import useTemplateStyles from "./Template.styles";

export interface TemplateProps {
	story?: Story;
}

const Template = withHooks<TemplateProps>(({ story }) => {
	const { root, container, corner, navBar, canvas } = useTemplateStyles();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [, setRenderedStory] = useState<Story<any> | undefined>();
	const [template, setTemplate] = useState<Roact.Element | undefined>();
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
			// Template is not a Roact element
			setTemplate(element);

			setTemplateCallback((oldCallback) => {
				if (oldCallback !== undefined) {
					oldCallback();
				}
				return callback;
			});
		} else {
			// Template is a Roact element
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
		<frame Key="Template" {...root}>
			<frame Key="Container" {...container}>
				<uicorner Key="Corner" {...corner} />
				<Shadow />

				<frame Key="NavBar" {...navBar}>
					<Button
						variant="text"
						text="Canvas"
						size="small"
						color="secondary"
						className={
							{
								Size: new UDim2(0, DefaultTheme.spacing.calc(5), 0, DefaultTheme.spacing.calc(2)),
								Font: DefaultTheme.typography.fontFamilies.semibold,
								TextColor3: DefaultTheme.options.constants.extendedPalette.Gray[50],
							} as WriteableStyle<TextButton>
						}
					></Button>
				</frame>

				<Canvas className={canvas}>{template}</Canvas>
			</frame>
		</frame>
	);
});

export default Template;
