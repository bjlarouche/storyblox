import Log from "@rbxts/log";
import React, { useCallback, useEffect, useState } from "@rbxts/react";
import { ReplicatedStorage } from "@rbxts/services";
import { DarkTheme, LightTheme, Theme, ThemeProvider } from "@rbxts/uiblox";
import { RELEASE, STORYBLOX_LOGO, VERSION } from "constants/AppConstants";
import { Story, StoryExport } from "../../../../interfaces";
import { Template } from "../../template";
import { StoriesSidebar } from "../../storiesSidebar";

const DEFAULT_EXTENSION = ".stories";
const VALID_ROOT_TYPES = [
	"Folder",
	"Script",
	"ModuleScript",
	"LocalScript",
	"Model",
	"ReplicatedStorage",
	"Workspace",
	"ServerStorage",
	"ServerScriptService",
	"Player",
];

export interface StorybloxProps {
	root?: Instance;
	extension?: `.${string}`;
	primaryTheme?: Theme;
	secondaryTheme?: Theme;
	logoSrc?: string;
	version?: string;
	release?: string;
	debugEnabled?: boolean;
}

function Storyblox(props: StorybloxProps) {
	const {
		root,
		extension = DEFAULT_EXTENSION,
		primaryTheme = DarkTheme,
		secondaryTheme = LightTheme,
		logoSrc = STORYBLOX_LOGO,
		version = VERSION,
		release = RELEASE,
		debugEnabled,
	} = props;

	const [stories, setStories] = useState<Story[]>([]);
	const [selectedStory, setSelectedStory] = useState<Story | undefined>();

	const [theme, setTheme] = useState<Theme>(primaryTheme);

	const logDebug = useCallback(
		(message: string) => {
			if (debugEnabled) {
				Log.Debug(message);
			}
		},
		[debugEnabled],
	);

	const trackStory = (story: Story) => {
		try {
			const { title } = story;

			setStories((oldStories) => {
				const filteredStories = oldStories.filter((s) => s.title !== title);

				// We are effectively replacing the story if it already exists with the same title, this is to prevent duplicates, but ensure the latest version of the story is used
				filteredStories.push(story);
				return filteredStories;
			});

			logDebug(`Tracking story: ${title}`);
		} catch (error) {
			logDebug(`Issue tracking story ${story.title}: ${error}`);
		}
	};

	const findStories = (root: Instance): void => {
		if (root.IsA("ModuleScript") && root.Name.sub(-extension.size()) === extension) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const storyExport = require(root) as StoryExport<any>;
				const { default: story } = storyExport;

				// If the modulescript source code changes, refresh the story
				const geChangedConnection = (root.Changed as RBXScriptSignal).Connect(() => {
					logDebug(`Story source updated: ${root.GetFullName()}`);

					const updatedStoryExport = require(root) as StoryExport<any>;
					const { default: updatedStory } = updatedStoryExport;

					if (updatedStory.title !== story.title) {
						logDebug(`Story title changed from ${story.title} to ${updatedStory.title}`);

						// Remove old story, if title changed, to prevent stale story from being displayed
						setStories((oldStories) => {
							const filteredStories = oldStories.filter((s) => s.title !== story.title);
							return filteredStories;
						});
					}

					// Add updated story
					trackStory(updatedStory);
				});

				// Start tracking story
				trackStory(story);

				// Remove story if root is being removed
				root.Destroying.Connect(() => {
					setStories((oldStories) => oldStories.filter((s) => s.title !== story.title));

					// Disconnect signal
					geChangedConnection.Disconnect();

					logDebug(`Story removed: ${story.title} because ${root.GetFullName()} was destroyed`);
				});
			} catch (error) {
				logDebug(`Issue loading story from ${root.GetFullName()}: ${error}`);
			}
		} else if (VALID_ROOT_TYPES.includes(root.ClassName)) {
			for (const child of root.GetDescendants()) {
				findStories(child);
			}
		} else {
			logDebug(`${root.GetFullName()} has invalid root type: ${root.ClassName}`);
		}
	};

	// Did mount
	useEffect(() => {
		const stories = root || ReplicatedStorage;

		// Listen for descendants to be added
		root?.DescendantAdded.Connect((descendant) => {
			findStories(descendant);
			logDebug(`Descendant added: ${descendant.GetFullName()} checking for stories`);
		});

		// Find existing stories
		findStories(stories);
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<frame key={`Storyblox-${theme}`} Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
				<StoriesSidebar
					stories={stories}
					logoSrc={logoSrc}
					version={version}
					release={release}
					onClick={(story: Story) => {
						setSelectedStory(story);
					}}
					primaryThemeEnabled={theme === primaryTheme}
					onToggleTheme={() => {
						setTheme(theme === primaryTheme ? secondaryTheme : primaryTheme);
					}}
				/>
				<Template story={selectedStory} />
			</frame>
		</ThemeProvider>
	);
}

export default Storyblox;
