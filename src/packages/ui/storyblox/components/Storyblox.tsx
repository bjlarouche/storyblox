import Log from "@rbxts/log";
import React, { useCallback, useEffect, useMemo, useState } from "@rbxts/react";
import { ReplicatedStorage } from "@rbxts/services";
import {
	createStyles,
	DarkTheme,
	ErrorBoundary,
	LightTheme,
	makeStyles,
	Theme,
	ThemeProvider,
	useTheme,
	WriteableStyle,
} from "@rbxts/uiblox";
import { RELEASE, STORYBLOX_LOGO, VERSION } from "constants/AppConstants";
import { Story } from "../../../../interfaces";
import { Template } from "../../template";
import { StoriesSidebar } from "../../storiesSidebar";
import { normalizeExport, NormalizedStory } from "../normalizeStory";
import { createStorySession } from "../storyRegistry";

const DEFAULT_EXTENSION = ".stories";

function storyFromExport(normalized: NormalizedStory): Story | undefined {
	if (normalized.kind === "reject") return undefined;
	if (normalized.kind === "react") return normalized.story as Story;
	const mount = normalized.mount;
	return {
		title: normalized.title as Story["title"],
		component: () => <frame />,
		template: () => {
			const target = new Instance("Frame");
			target.Name = "NativeStory";
			target.Size = new UDim2(1, 0, 1, 0);
			target.BackgroundTransparency = 1;
			const cleanup = mount(target);
			const element = (
				<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
					<frame
						Size={new UDim2(1, 0, 1, 0)}
						BackgroundTransparency={1}
						ref={(parent: Frame | undefined) => {
							if (parent) target.Parent = parent;
						}}
					/>
				</frame>
			);
			return [
				element,
				() => {
					if (typeOf(cleanup) === "function") (cleanup as () => void)();
					pcall(() => target.Destroy());
				},
			] as LuaTuple<[ReturnType<Story["template"]>, () => void]>;
		},
	} as Story;
}
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

const useStorybloxStyles = makeStyles((theme: Theme) =>
	createStyles({
		errorContainer: {
			Size: new UDim2(1, 0, 1, 0),
			BackgroundTransparency: 1,
		} as WriteableStyle<Frame>,
		errorMessage: {
			AnchorPoint: new Vector2(0.5, 0.5),
			Position: UDim2.fromScale(0.5, 0.5),
			Size: new UDim2(1, -theme.spacing.calc(2), 1, -theme.spacing.calc(2)),
			BackgroundTransparency: 1,
			TextColor3: theme.palette.error.main,
			TextScaled: true,
			TextYAlignment: Enum.TextYAlignment.Top,
			TextXAlignment: Enum.TextXAlignment.Left,
			RichText: true,
			Font: theme.typography.fontFamilies.semibold,
		} as WriteableStyle<TextLabel>,
	}),
);

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

	const { errorContainer, errorMessage } = useStorybloxStyles();

	const [stories, setStories] = useState<Story[]>([]);
	const [selectedStory, setSelectedStory] = useState<Story | undefined>();
	const session = useMemo(() => createStorySession<Story>(setStories), []);

	const { theme, setTheme } = useTheme();

	const logDebug = useCallback(
		(message: string) => {
			if (debugEnabled) {
				Log.Debug(message);
			}
		},
		[debugEnabled],
	);

	const trackStory = useCallback(
		(story: Story) => {
			try {
				const { title } = story;

				session.upsert(story);

				logDebug(`Tracking story: ${title}`);
			} catch (error) {
				logDebug(`Issue tracking story ${story.title}: ${error}`);
			}
		},
		[session, logDebug],
	);

	const findStories = useCallback(
		(root: Instance): void => {
			task.spawn(() => {
				if (root.IsA("ModuleScript") && root.Name.sub(-extension.size()) === extension) {
					try {
						const story = storyFromExport(normalizeExport(require(root), root.Name, extension));
						if (story === undefined) {
							logDebug(`Rejected story export ${root.GetFullName()}`);
							return;
						}

						// If the modulescript source code changes, refresh the story
						const geChangedConnection = (root.Changed as RBXScriptSignal).Connect(() => {
							logDebug(`Story source updated: ${root.GetFullName()}`);

							const updatedStory = storyFromExport(normalizeExport(require(root), root.Name, extension));
							if (updatedStory === undefined) {
								session.remove(story.title);
								return;
							}

							if (updatedStory.title !== story.title) {
								logDebug(`Story title changed from ${story.title} to ${updatedStory.title}`);
								session.remove(story.title);
							}

							trackStory(updatedStory);
						});

						// Start tracking story
						trackStory(story);

						// Remove story if root is being removed
						root.Destroying.Connect(() => {
							session.remove(story.title);

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
			});
		},
		[trackStory, logDebug],
	);

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
		logDebug(`Finding stories in ${stories.GetFullName()}`);
	}, [root, findStories, logDebug]);

	return (
		<ThemeProvider theme={primaryTheme}>
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
						if (!setTheme) {
							throw error("Unable to set theme, set state action");
						}

						setTheme(theme === primaryTheme ? secondaryTheme : primaryTheme);
					}}
				/>
				<ErrorBoundary
					fallback={(e) => {
						const errorComponnt = (
							<frame key="Error" {...errorContainer}>
								<textlabel
									key="Message"
									{...errorMessage}
									Text={`<u>Unable to render <b>${selectedStory?.title}</b>...</u>\n\n${e}`}
								></textlabel>
							</frame>
						);

						return (
							<Template
								story={{
									title: selectedStory?.title ?? "Error/Rendering",
									component: () => errorComponnt,
									template: () => errorComponnt,
								}}
							/>
						);
					}}
				>
					<Template story={selectedStory} />
				</ErrorBoundary>
			</frame>
		</ThemeProvider>
	);
}

export default Storyblox;
