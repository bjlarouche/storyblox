import Log from "@rbxts/log";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { HttpService, ReplicatedStorage, ServerStorage } from "@rbxts/services";
import {
	createStyles,
	DarkTheme,
	ErrorBoundary,
	LightTheme,
	makeStyles,
	Theme,
	ThemeProvider,
	WriteableStyle,
} from "@rbxts/uiblox";
import { STORYBLOX_LOGO, VERSION } from "constants/AppConstants";
import { Story } from "../../../../interfaces";
import { SplitPane, Template } from "../../template";
import { storyLanguage } from "../../template/storyLabel";
import { StoriesSidebar } from "../../storiesSidebar";
import { mountNative } from "../nativeMount";
import { normalizeExport, NormalizedStory } from "../normalizeStory";
import { acceptGeneration, nextGeneration } from "../storyGeneration";
import { insideCanvas } from "../canvasReady";
import { createStorySession, keepSelection } from "../storyRegistry";
import { ClaimedId, claimStoryId, releaseStoryId } from "../../../defineStory";

const DEFAULT_EXTENSION = ".stories";
const SIDEBAR_WIDTH = 180;
const SIDEBAR_MIN = 140;
const SIDEBAR_MAX = 360;

function pluginStories(): Instance | undefined {
	return ServerStorage.FindFirstChild("StorybloxPlugin")?.FindFirstChild("stories");
}

function controlRoot(root?: Instance) {
	return pluginStories() ?? root;
}

function findCanvasScroll(host?: Frame) {
	if (!host) return undefined;
	for (const child of host.GetDescendants()) {
		if (child.Name === "Scrollable" && child.IsA("ScrollingFrame")) return child;
	}
	return undefined;
}

function storyInsideCanvas(scroll: ScrollingFrame) {
	const origin = scroll.AbsolutePosition;
	const bounds = scroll.AbsoluteSize;
	for (const child of scroll.GetDescendants()) {
		if (!child.IsA("GuiObject")) continue;
		if (
			insideCanvas(
				origin.X,
				origin.Y,
				bounds.X,
				bounds.Y,
				child.AbsolutePosition.X,
				child.AbsolutePosition.Y,
				child.AbsoluteSize.X,
				child.AbsoluteSize.Y,
			)
		) {
			return true;
		}
	}
	return false;
}

function loadStoryModule(moduleScript: ModuleScript): unknown {
	const runtime = (_G as never as Record<string, { import: (context: Instance, module: ModuleScript) => unknown }>)[
		script as never as string
	];
	return runtime.import(script, moduleScript);
}

function storyFromExport(normalized: NormalizedStory): Story | undefined {
	if (normalized.kind === "reject") return undefined;
	if (normalized.kind === "react") return normalized.story as Story;
	const mount = normalized.mount;
	const session: { update?: (args: unknown) => void } = {};
	return {
		title: normalized.title as Story["title"],
		renderer: "native",
		args: normalized.args,
		argTypes: normalized.argTypes,
		props: normalized.args,
		preview: normalized.preview,
		cases: normalized.cases,
		nativeSession: session,
		component: () => <frame />,
		template: (props: unknown, context?: unknown) => {
			const target = new Instance("Frame");
			target.Name = "NativeStory";
			target.Size = new UDim2(1, 0, 1, 0);
			target.BackgroundTransparency = 1;
			const theme = (context as { theme?: unknown } | undefined)?.theme;
			let scene: { sceneRoot: WorldModel; camera: Camera } | undefined;
			if ((normalized.preview as { kind?: unknown } | undefined)?.kind === "viewport") {
				const viewport = new Instance("ViewportFrame");
				viewport.Name = "NativeViewport";
				viewport.Size = new UDim2(1, 0, 1, 0);
				viewport.BackgroundTransparency = 1;
				const camera = new Instance("Camera");
				camera.CFrame = CFrame.lookAt(new Vector3(0, 5, 10), Vector3.zero);
				camera.Parent = viewport;
				viewport.CurrentCamera = camera;
				const sceneRoot = new Instance("WorldModel");
				sceneRoot.Name = "NativeScene";
				sceneRoot.Parent = viewport;
				viewport.Parent = target;
				scene = { sceneRoot, camera };
			}
			let hosted: ReturnType<typeof mountNative>;
			try {
				hosted = mountNative(mount, target, props, theme, scene);
			} catch (error) {
				pcall(() => target.Destroy());
				throw error;
			}
			session.update = hosted.update;
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
					hosted.destroy();
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
	debugEnabled?: boolean;
	themeName?: "dark" | "light";
	onThemeChange?: (themeName: "dark" | "light") => void;
}

function Storyblox(props: StorybloxProps) {
	const {
		root,
		extension = DEFAULT_EXTENSION,
		primaryTheme = DarkTheme,
		secondaryTheme = LightTheme,
		logoSrc = STORYBLOX_LOGO,
		version = VERSION,
		debugEnabled,
		themeName,
		onThemeChange,
	} = props;

	const { errorContainer, errorMessage } = useStorybloxStyles();

	const [stories, setStories] = useState<Story[]>([]);
	const [selectedStory, setSelectedStory] = useState<Story | undefined>();
	const [previewKey, setPreviewKey] = useState(0);
	const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);
	const [focusSearch, setFocusSearch] = useState(0);
	const [remount, setRemount] = useState(0);
	const [caseRequest, setCaseRequest] = useState<{ name: string; id: number } | undefined>();
	const generation = useRef(0);
	const failed = useRef(false);
	const storiesRef = useRef(stories);
	const hostRef = useRef<Frame>();
	const renderError = useRef<unknown>();
	storiesRef.current = stories;
	renderError.current = undefined;
	const storyIds = useRef<ClaimedId[]>([]);
	const session = useMemo(() => {
		const stories = createStorySession<Story>(setStories);
		return {
			upsert(story: Story) {
				const id = (story as { id?: string }).id;
				if (!claimStoryId(storyIds.current, id, story.title)) return;
				stories.upsert(story);
			},
			remove(title: string) {
				storyIds.current = releaseStoryId(storyIds.current, title);
				stories.remove(title);
			},
		};
	}, []);

	const [theme, setTheme] = useState(themeName === "light" ? secondaryTheme : primaryTheme);

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
				const preferred = pluginStories()?.GetAttribute("storyblox-select") as string | undefined;
				setSelectedStory((current) => keepSelection(current, story, preferred));

				logDebug(`Tracking story: ${title}`);
			} catch (error) {
				logDebug(`Issue tracking story ${story.title}: ${error}`);
			}
		},
		[session, logDebug],
	);

	const findStories = useCallback(
		(root: Instance): void => {
			const token = generation.current;
			task.spawn(() => {
				if (generation.current !== token) return;
				if (root.IsA("ModuleScript") && root.Name.sub(-extension.size()) === extension) {
					try {
						const story = storyFromExport(normalizeExport(loadStoryModule(root), root.Name, extension));
						if (story === undefined) {
							logDebug(`Rejected story export ${root.GetFullName()}`);
							return;
						}

						// If the modulescript source code changes, refresh the story
						const geChangedConnection = (root.Changed as RBXScriptSignal).Connect(() => {
							logDebug(`Story source updated: ${root.GetFullName()}`);

							const updatedStory = storyFromExport(normalizeExport(loadStoryModule(root), root.Name, extension));
							if (updatedStory === undefined) {
								session.remove(story.title);
								return;
							}

							if (updatedStory.title !== story.title) {
								logDebug(`Story title changed from ${story.title} to ${updatedStory.title}`);
								session.remove(story.title);
							}

							trackStory({ ...updatedStory, language: storyLanguage(root.Source) } as Story);
						});

						// Start tracking story
						trackStory({ ...story, language: storyLanguage(root.Source) } as Story);

						// Remove story if root is being removed
						root.Destroying.Connect(() => {
							session.remove(story.title);

							// Disconnect signal
							geChangedConnection.Disconnect();

							logDebug(`Story removed: ${story.title} because ${root.GetFullName()} was destroyed`);
						});
					} catch (error) {
						if (generation.current === token) {
							failed.current = true;
							setSelectedStory(undefined);
						}
						warn(`Storyblox could not load ${root.GetFullName()}: ${error}`);
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
		const token = nextGeneration(generation.current);
		generation.current = token;
		failed.current = false;
		const storiesRoot = root || ReplicatedStorage;
		const added = root?.DescendantAdded.Connect((descendant) => {
			findStories(descendant);
			logDebug(`Descendant added: ${descendant.GetFullName()} checking for stories`);
		});

		findStories(storiesRoot);
		logDebug(`Finding stories in ${storiesRoot.GetFullName()}`);
		const pending = task.delay(0.3, () => {
			if (!acceptGeneration(token, generation.current, failed.current)) return;
			const markerRoot = pluginStories() ?? storiesRoot;
			const previous = (markerRoot.GetAttribute("storyblox-build") as number | undefined) ?? 0;
			markerRoot.SetAttribute("storyblox-build", previous + 1);
			setPreviewKey((key) => key + 1);
		});

		return () => {
			task.cancel(pending);
			added?.Disconnect();
		};
	}, [root, findStories, logDebug]);

	const primaryThemeEnabled = theme === primaryTheme;
	const [storyOnPrimary, setStoryOnPrimary] = useState(true);
	const storyTheme = storyOnPrimary ? primaryTheme : secondaryTheme;
	const toggleStoryTheme = () => setStoryOnPrimary((current) => !current);
	const toggleTheme = () => {
		const chosen = primaryThemeEnabled ? secondaryTheme : primaryTheme;
		const name = chosen === primaryTheme ? "dark" : "light";
		setTheme(chosen);
		if (onThemeChange) onThemeChange(name);
		controlRoot(root)?.SetAttribute("storyblox-theme", name);
	};

	useEffect(() => {
		const marker = controlRoot(root);
		if (!marker) return;
		const onSelect = () => {
			const title = marker.GetAttribute("storyblox-select");
			if (typeOf(title) !== "string" || title === "") return;
			let match: Story | undefined;
			for (const story of storiesRef.current) {
				if (story.title === title) match = story;
			}
			if (!match) return;
			marker.SetAttribute("storyblox-ready", undefined);
			marker.SetAttribute("storyblox-error", undefined);
			setSelectedStory(match);
		};
		const onTheme = () => {
			const name = marker.GetAttribute("storyblox-theme");
			if (name !== "light" && name !== "dark") return;
			setTheme(name === "light" ? secondaryTheme : primaryTheme);
			if (onThemeChange) onThemeChange(name);
		};
		const selectConn = marker.GetAttributeChangedSignal("storyblox-select").Connect(onSelect);
		const themeConn = marker.GetAttributeChangedSignal("storyblox-theme").Connect(onTheme);
		const focusConn = marker
			.GetAttributeChangedSignal("storyblox-focus-search")
			.Connect(() => setFocusSearch((current) => current + 1));
		const remountConn = marker
			.GetAttributeChangedSignal("storyblox-remount")
			.Connect(() => setRemount((current) => current + 1));
		const caseConn = marker.GetAttributeChangedSignal("storyblox-case").Connect(() => {
			const name = marker.GetAttribute("storyblox-case");
			if (typeOf(name) !== "string" || name === "") return;
			marker.SetAttribute("storyblox-case-result", undefined);
			setCaseRequest((current) => ({ name: name as string, id: (current?.id ?? 0) + 1 }));
		});
		onSelect();
		return () => {
			selectConn.Disconnect();
			themeConn.Disconnect();
			focusConn.Disconnect();
			remountConn.Disconnect();
			caseConn.Disconnect();
		};
	}, [root, primaryTheme, secondaryTheme, onThemeChange]);

	// ponytail: poll until a sized descendant sits in the canvas; a layout signal if this shows up in profiles
	useEffect(() => {
		const marker = controlRoot(root);
		if (!marker) return;
		if (renderError.current === undefined) marker.SetAttribute("storyblox-error", undefined);
		marker.SetAttribute("storyblox-ready", undefined);
		if (!selectedStory) return;
		let alive = true;
		const title = selectedStory.title;
		const tick = () => {
			if (!alive) return;
			const scroll = findCanvasScroll(hostRef.current);
			if (scroll && storyInsideCanvas(scroll)) {
				const build = (marker.GetAttribute("storyblox-build") as number | undefined) ?? 0;
				marker.SetAttribute("storyblox-ready", `${title}@${build}`);
				return;
			}
			task.delay(0.05, tick);
		};
		task.defer(tick);
		return () => {
			alive = false;
		};
	}, [selectedStory, previewKey, root]);

	return (
		<ThemeProvider theme={theme}>
			<frame
				key="Storyblox"
				ref={(frame: Frame | undefined) => {
					hostRef.current = frame;
				}}
				Size={new UDim2(1, 0, 1, 0)}
				BackgroundTransparency={1}
			>
				<SplitPane
					value={sidebarWidth}
					min={SIDEBAR_MIN}
					max={SIDEBAR_MAX}
					onChange={setSidebarWidth}
					first={
						<StoriesSidebar
							stories={stories}
							logoSrc={logoSrc}
							version={version}
							selected={selectedStory?.title}
							focusSearch={focusSearch}
							onClick={(story: Story) => {
								controlRoot(root)?.SetAttribute("storyblox-select", story.title);
								setSelectedStory(story);
							}}
						/>
					}
					second={
						<ErrorBoundary
							key={`preview-${previewKey}`}
							fallback={(e) => {
								renderError.current = e;
								controlRoot(root)?.SetAttribute("storyblox-error", `${e}`);
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
										primaryThemeEnabled={primaryThemeEnabled}
										onToggleTheme={toggleTheme}
										storyTheme={storyTheme}
										storyOnPrimary={storyOnPrimary}
										onToggleStoryTheme={toggleStoryTheme}
									/>
								);
							}}
						>
							<Template
								story={selectedStory}
								remount={remount}
								caseRequest={caseRequest}
								onCaseResult={(result) =>
									controlRoot(root)?.SetAttribute("storyblox-case-result", HttpService.JSONEncode(result))
								}
								primaryThemeEnabled={primaryThemeEnabled}
								onToggleTheme={toggleTheme}
								storyTheme={storyTheme}
								storyOnPrimary={storyOnPrimary}
								onToggleStoryTheme={toggleStoryTheme}
							/>
						</ErrorBoundary>
					}
				/>
			</frame>
		</ThemeProvider>
	);
}

export default Storyblox;
