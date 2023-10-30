import Log from "@rbxts/log";
import Roact from "@rbxts/roact";
import { markPureComponent, useEffect, useState } from "@rbxts/roact-hooked";
import { ReplicatedStorage } from "@rbxts/services";
import { DarkTheme, LightTheme, Theme, ThemeProvider } from "@rbxts/uiblox";
import { STORYBLOX_LOGO } from "constants/AppConstants";
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
];

export interface StorybloxProps {
	root?: Instance;
	extension?: `.${string}`;
	primaryTheme?: Theme;
	secondaryTheme?: Theme;
	logoSrc?: string;
}

function Storyblox(props: StorybloxProps) {
	const {
		root,
		extension = DEFAULT_EXTENSION,
		primaryTheme = DarkTheme,
		secondaryTheme = LightTheme,
		logoSrc = STORYBLOX_LOGO,
	} = props;

	const [stories, setStories] = useState<Story[]>([]);
	const [selectedStory, setSelectedStory] = useState<Story | undefined>();

	const [theme, setTheme] = useState<Theme>(primaryTheme);

	const addStory = (story: Story) => {
		try {
			const { title } = story;

			if (stories.find((s) => s.title === title)) {
				Log.Error(`Story ${title} already exists`);
				error(`Story ${title} already exists`);
			}

			setStories((oldStories) => [...oldStories, story]);
		} catch {
			// Component is unmounting. Do nothing.
		}
	};

	const findStories = (root: Instance): void => {
		if (root.IsA("ModuleScript") && root.Name.sub(-extension.size()) === extension) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const storyExport = require(root) as StoryExport<any>;
				const { default: story } = storyExport;
				addStory(story);

				// Remove story if root is being removed
				root.Destroying.Connect(() => {
					setStories((oldStories) => oldStories.filter((s) => s.title !== story.title));
				});
			} catch (error) {
				Log.Warn(`Issue adding story ${root.Name}...\n ${error}`);
			}
		} else if (VALID_ROOT_TYPES.includes(root.ClassName)) {
			for (const child of root.GetChildren()) {
				findStories(child);
			}
		}
	};

	// Did mount
	useEffect(() => {
		const stories = root || ReplicatedStorage;

		// Listen for descendants to be added
		root?.DescendantAdded.Connect((descendant) => {
			findStories(descendant);
		});

		// Find existing stories
		findStories(stories);
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<frame Key={`Storyblox-${theme}`} Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
				<StoriesSidebar
					stories={stories}
					logoSrc={logoSrc}
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

export default markPureComponent(Storyblox);
