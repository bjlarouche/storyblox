import React, { FunctionComponent, useEffect, useState } from "@rbxts/react";
import { Story } from "../../../../interfaces";
import { Button, DEFAULT_THEME, Shadow, WriteableStyle } from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import { createCleanupGate, readTemplateResult } from "../cleanupGate";
import useTemplateStyles from "./Template.styles";

export interface TemplateProps {
	story?: Story;
}

function Template({ story }: TemplateProps) {
	const { root, container, corner, navBar, canvas } = useTemplateStyles();
	const [gate] = useState(createCleanupGate);
	const [template, setTemplate] = useState<React.Element | undefined>();
	const [failure, setFailure] = useState<unknown>();

	const Wrap: FunctionComponent<React.PropsWithChildren<unknown>> = ({ children }) => (
		<React.Fragment>{children}</React.Fragment>
	);

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
			const [element, callback] = story.template(story.props as never) as LuaTuple<
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
	}, [story, gate]);

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
								Size: new UDim2(0, DEFAULT_THEME.spacing.calc(5), 0, DEFAULT_THEME.spacing.calc(2)),
								Font: DEFAULT_THEME.typography.fontFamilies.semibold,
								TextColor3: DEFAULT_THEME.options.constants.extendedPalette.Gray[50],
							} as WriteableStyle<TextButton>
						}
					></Button>
				</frame>

				<Canvas className={canvas}>
					<Wrap>{template}</Wrap>
				</Canvas>
			</frame>
		</frame>
	);
}

export default Template;
