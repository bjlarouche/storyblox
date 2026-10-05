import Log from "@rbxts/log";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { HttpService, ReplicatedStorage, ServerStorage, Workspace } from "@rbxts/services";
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
import { Story } from "interfaces";
import { SplitPane, Template } from "../../template";
import { storyInspector, storyLanguage } from "../../template/storyLabel";
import { StoriesSidebar } from "../../storiesSidebar";
import { parseFavorites, toggleFavorite } from "../../storiesSidebar/storyTree";
import { useDragScroll } from "../../scroll";
import { mountNative } from "../nativeMount";
import { normalizeExport, NormalizedStory } from "../normalizeStory";
import { acceptGeneration, nextGeneration } from "../storyGeneration";
import { insideCanvas } from "../canvasReady";
import { createStorySession, keepSelection } from "../storyRegistry";
import { ClaimedId, claimStoryId, releaseStoryId } from "packages/defineStory";
import { checkRequest, PROTOCOL_VERSION } from "packages/bridgeProtocol";
import { narrowShell } from "../shellLayout";

const DEFAULT_EXTENSION = ".stories";
const SIDEBAR_WIDTH = 180;
const SIDEBAR_MIN = 140;
const SIDEBAR_MAX = 360;
const CASE_DEADLINE = 10;

function pluginStories(): Instance | undefined {
	return ServerStorage.FindFirstChild("StorybloxPlugin")?.FindFirstChild("stories");
}

function controlRoot(root?: Instance) {
	return pluginStories() ?? root;
}

function respond(marker: Instance, body: object) {
	marker.SetAttribute("storyblox-response", HttpService.JSONEncode({ protocolVersion: PROTOCOL_VERSION, ...body }));
}

function findMountFrame(host?: Frame) {
	if (!host) return undefined;
	for (const child of host.GetDescendants()) {
		if (child.IsA("Frame") && child.Name.sub(1, 6) === "mount-") return child;
	}
	return undefined;
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
		tools: normalized.tools,
		cases: normalized.cases,
		description: normalized.description,
		nativeSession: session,
		component: () => <frame />,
		template: (props: unknown, context?: unknown) => {
			const target = new Instance("Frame");
			target.Name = "NativeStory";
			target.Size = new UDim2(1, 0, 1, 0);
			target.BackgroundTransparency = 1;
			const theme = (context as { theme?: unknown } | undefined)?.theme;
			const kind = (normalized.preview as { kind?: unknown } | undefined)?.kind;
			let scene: { sceneRoot: Instance; camera: Camera } | undefined;
			let restore: (() => void) | undefined;
			if (kind === "workspace" && ((pluginStories()?.GetAttribute("storyblox-workspace") as number | undefined) ?? 0) <= 0) {
				target.Destroy();
				return [
					<textlabel
						key="WorkspaceNotice"
						Text={`Workspace preview is off. Run "Storyblox: Allow workspace preview" to mount this story into Workspace.`}
						Size={new UDim2(1, 0, 0, 48)}
						TextWrapped={true}
						BackgroundTransparency={1}
						TextColor3={new Color3(1, 0.7, 0.3)}
					/>,
					() => {},
				] as LuaTuple<[ReturnType<Story["template"]>, () => void]>;
			}
			if (kind === "workspace") {
				const sceneRoot = new Instance("Folder");
				sceneRoot.Name = "StorybloxPreview";
				sceneRoot.SetAttribute("storyblox-owned", true);
				sceneRoot.Parent = Workspace;
				const camera = Workspace.CurrentCamera!;
				const [cframe, focus, cameraType, fieldOfView] = [camera.CFrame, camera.Focus, camera.CameraType, camera.FieldOfView];
				scene = { sceneRoot, camera };
				restore = () => {
					pcall(() => sceneRoot.Destroy());
					camera.CameraType = cameraType;
					camera.CFrame = cframe;
					camera.Focus = focus;
					camera.FieldOfView = fieldOfView;
				};
			} else if (kind === "viewport") {
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
				restore?.();
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
					{restore !== undefined ? (
						<textlabel
							key="WorkspaceDirty"
							Text="StorybloxPreview is in Workspace and the camera is borrowed. The place shows as changed until you leave this story."
							Size={new UDim2(1, 0, 0, 32)}
							Position={new UDim2(0, 0, 1, -32)}
							TextWrapped={true}
							BackgroundTransparency={1}
							TextColor3={new Color3(1, 0.7, 0.3)}
						/>
					) : undefined}
				</frame>
			);
			return [
				element,
				() => {
					hosted.destroy();
					restore?.();
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
	favorites?: string;
	onFavoritesChange?: (favorites: string) => void;
	inspectorOpen?: boolean;
	onInspectorOpenChange?: (open: boolean) => void;
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
		favorites,
		onFavoritesChange,
		inspectorOpen = true,
		onInspectorOpenChange,
	} = props;

	const { errorContainer, errorMessage } = useStorybloxStyles();

	const [stories, setStories] = useState<Story[]>([]);
	const [selectedStory, setSelectedStory] = useState<Story | undefined>();
	const [previewKey, setPreviewKey] = useState(0);
	const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);
	const [shellWidth, setShellWidth] = useState(0);
	const [inspectorWidth, setInspectorWidth] = useState(10000);
	const [inspectorFrame, setInspectorFrame] = useState<ScrollingFrame>();
	const [inspectorShown, setInspectorShown] = useState(inspectorOpen !== false);
	const [pane, setPane] = useState("canvas");
	const [focusSearch, setFocusSearch] = useState(0);
	const [remount, setRemount] = useState(0);
	const [caseRequest, setCaseRequest] = useState<{ name: string; id: number } | undefined>();
	const [argsRequest, setArgsRequest] = useState<{ args?: { [key: string]: unknown }; id: number } | undefined>();
	const bridgeGeneration = useRef(0);
	const pendingCase = useRef<string>();
	const selectedRef = useRef<Story>();
	const generation = useRef(0);
	const failed = useRef(false);
	const storiesRef = useRef(stories);
	const hostRef = useRef<Frame>();
	const renderError = useRef<unknown>();
	const boundaryFailed = useRef(false);
	const [boundaryKey, setBoundaryKey] = useState(0);
	storiesRef.current = stories;
	selectedRef.current = selectedStory;
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
	const [favoriteList, setFavoriteList] = useState(parseFavorites(favorites));
	const favoritesRef = useRef(favoriteList);
	favoritesRef.current = favoriteList;
	useDragScroll(inspectorFrame);
	const toggleFavoriteStory = (title: string) => {
		const chosen = toggleFavorite(favoritesRef.current, title);
		favoritesRef.current = chosen;
		setFavoriteList(chosen);
		if (onFavoritesChange) onFavoritesChange(chosen.join(","));
	};
	const toggleRef = useRef(toggleFavoriteStory);
	toggleRef.current = toggleFavoriteStory;

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

							trackStory({ ...updatedStory, language: storyLanguage(root.Source), source: root.GetFullName() } as Story);
						});

						// Start tracking story
						trackStory({ ...story, language: storyLanguage(root.Source), source: root.GetFullName() } as Story);

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
	const toggleTheme = () => {
		const chosen = primaryThemeEnabled ? secondaryTheme : primaryTheme;
		const name = chosen === primaryTheme ? "dark" : "light";
		setTheme(chosen);
		if (onThemeChange) onThemeChange(name);
		controlRoot(root)?.SetAttribute("storyblox-theme", name);
	};
	const toggleInspector = () => {
		const open = !inspectorShown;
		setInspectorShown(open);
		if (!open) setPane((current) => (current === "inspector" ? "canvas" : current));
		if (onInspectorOpenChange) onInspectorOpenChange(open);
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
		const favoriteConn = marker.GetAttributeChangedSignal("storyblox-favorite").Connect(() => {
			const title = marker.GetAttribute("storyblox-favorite");
			if (typeOf(title) !== "string" || (title as string).size() === 0) return;
			marker.SetAttribute("storyblox-favorite", undefined);
			toggleRef.current(title as string);
		});
		const paneConn = marker.GetAttributeChangedSignal("storyblox-pane").Connect(() => {
			const name = marker.GetAttribute("storyblox-pane");
			if (name !== "stories" && name !== "canvas" && name !== "inspector") return;
			setPane(name);
		});
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
		const requestConn = marker.GetAttributeChangedSignal("storyblox-request").Connect(() => {
			const raw = marker.GetAttribute("storyblox-request");
			if (typeOf(raw) !== "string" || raw === "") return;
			const [decoded, value] = pcall(() => HttpService.JSONDecode(raw as string));
			const current = selectedRef.current?.title;
			const checked = checkRequest(decoded ? value : undefined, bridgeGeneration.current, current);
			if (!checked.ok) {
				respond(marker, { requestId: checked.requestId, ok: false, error: checked.error });
				return;
			}
			const { requestId, command } = checked.request;
			const payload = checked.request.payload ?? {};
			const build = (marker.GetAttribute("storyblox-build") as number | undefined) ?? 0;
			const status = {
				requestId,
				ok: true,
				actualStoryId: current,
				generation: bridgeGeneration.current,
				buildId: build,
				ready: marker.GetAttribute("storyblox-ready") === `${current}@${build}`,
			};
			if (command === "listStories") {
				respond(marker, { ...status, stories: storiesRef.current.map((story) => story.title) });
			} else if (command === "selectStory") {
				const storyId = payload.storyId as string;
				if (!storiesRef.current.some((story) => story.title === storyId)) {
					respond(marker, { requestId, ok: false, error: "unknown story" });
					return;
				}
				marker.SetAttribute("storyblox-select", storyId);
				respond(marker, { ...status, pending: storyId !== current });
			} else if (command === "setArgs" || command === "resetArgs") {
				const args = command === "setArgs" ? (payload.args as { [key: string]: unknown }) : undefined;
				setArgsRequest((previous) => ({ args, id: (previous?.id ?? 0) + 1 }));
				respond(marker, status);
			} else if (command === "runCase") {
				pendingCase.current = requestId;
				setCaseRequest((previous) => ({ name: payload.name as string, id: (previous?.id ?? 0) + 1 }));
				task.delay(CASE_DEADLINE, () => {
					if (pendingCase.current !== requestId) return;
					pendingCase.current = undefined;
					respond(marker, { requestId, ok: false, error: "timeout" });
				});
			} else if (command === "getCaptureBounds") {
				const mount = findMountFrame(hostRef.current);
				if (!mount) {
					respond(marker, { requestId, ok: false, error: "not mounted" });
					return;
				}
				respond(marker, {
					...status,
					surface: "dock",
					bounds: {
						x: mount.AbsolutePosition.X,
						y: mount.AbsolutePosition.Y,
						width: mount.AbsoluteSize.X,
						height: mount.AbsoluteSize.Y,
					},
				});
			} else {
				respond(marker, status);
			}
		});
		onSelect();
		return () => {
			requestConn.Disconnect();
			selectConn.Disconnect();
			themeConn.Disconnect();
			favoriteConn.Disconnect();
			paneConn.Disconnect();
			focusConn.Disconnect();
			remountConn.Disconnect();
			caseConn.Disconnect();
		};
	}, [root, primaryTheme, secondaryTheme, onThemeChange]);

	useEffect(() => {
		if (!boundaryFailed.current) return;
		boundaryFailed.current = false;
		setBoundaryKey((current) => current + 1);
	}, [selectedStory]);

	useEffect(() => {
		bridgeGeneration.current += 1;
		const requestId = pendingCase.current;
		const marker = controlRoot(root);
		if (requestId === undefined || marker === undefined) return;
		pendingCase.current = undefined;
		respond(marker, { requestId, ok: false, error: "cancelled" });
	}, [selectedStory, previewKey, remount]);

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

	const rememberWidth = (rbx: Frame) => {
		const x = rbx.AbsoluteSize.X;
		setShellWidth((current) => (current === x ? current : x));
	};
	const sidebar = (
		<StoriesSidebar
			stories={stories}
			logoSrc={logoSrc}
			version={version}
			selected={selectedStory?.title}
			focusSearch={focusSearch}
			favorites={favoriteList}
			onClick={(story: Story) => {
				controlRoot(root)?.SetAttribute("storyblox-select", story.title);
				setSelectedStory(story);
				setPane("canvas");
			}}
		/>
	);
	const canvas = (
						<ErrorBoundary
							key={`preview-${previewKey}-${boundaryKey}`}
							fallback={(e) => {
								renderError.current = e;
								boundaryFailed.current = true;
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
										inspectorOpen={inspectorShown}
										onToggleInspector={toggleInspector}
										starred={selectedStory !== undefined && favoriteList.includes(selectedStory.title)}
										onToggleFavorite={
											selectedStory !== undefined ? () => toggleFavoriteStory(selectedStory.title) : undefined
										}
									/>
								);
							}}
						>
							<Template
								story={selectedStory}
								remount={remount}
								caseRequest={caseRequest}
								argsRequest={argsRequest}
								onCaseResult={(result) => {
									const marker = controlRoot(root);
									marker?.SetAttribute("storyblox-case-result", HttpService.JSONEncode(result));
									const requestId = pendingCase.current;
									if (marker === undefined || requestId === undefined) return;
									pendingCase.current = undefined;
									respond(marker, { requestId, ok: result.passed, generation: bridgeGeneration.current, result });
								}}
								primaryThemeEnabled={primaryThemeEnabled}
								onToggleTheme={toggleTheme}
								inspectorOpen={inspectorShown}
								onToggleInspector={toggleInspector}
								starred={selectedStory !== undefined && favoriteList.includes(selectedStory.title)}
								onToggleFavorite={
									selectedStory !== undefined ? () => toggleFavoriteStory(selectedStory.title) : undefined
								}
							/>
						</ErrorBoundary>
	);
	const inspector = (
		<scrollingframe
			key="Inspector"
			ref={setInspectorFrame}
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={theme.options.constants.colors.backgroundUIMuted}
			BorderSizePixel={0}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollingDirection={Enum.ScrollingDirection.Y}
			ScrollBarThickness={theme.spacing.calc(0.5)}
			ScrollBarImageTransparency={0.75}
			ClipsDescendants={true}
		>
			<uipadding
				key="InspectorInset"
				PaddingTop={new UDim(0, theme.padding.calc(2))}
				PaddingBottom={new UDim(0, theme.padding.calc(2))}
				PaddingLeft={new UDim(0, theme.padding.calc(2))}
				PaddingRight={new UDim(0, theme.padding.calc(2))}
			/>
			<uilistlayout
				key="InspectorLayout"
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, theme.padding.calc(1))}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<textlabel
				key="InspectorTitle"
				Text="Inspector"
				LayoutOrder={1}
				Size={new UDim2(1, 0, 0, theme.spacing.calc(1.5))}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.options.constants.colors.textMuted}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
			<textlabel
				key="InspectorBody"
				Text={storyInspector(selectedStory as never)}
				LayoutOrder={2}
				Size={new UDim2(1, 0, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				TextWrapped={true}
				TextYAlignment={Enum.TextYAlignment.Top}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</scrollingframe>
	);
	const tab = (id: string, label: string, order: number) => (
		<textbutton
			key={`${label}Tab`}
			Text={label}
			LayoutOrder={order}
			AutomaticSize={Enum.AutomaticSize.X}
			Size={new UDim2(0, 0, 1, 0)}
			BackgroundTransparency={1}
			Font={theme.typography.fontFamilies.semibold}
			TextSize={theme.typography.fontSizes.caption}
			TextColor3={theme.palette.secondary.main}
			TextTransparency={pane === id ? 0 : 0.45}
			Event={{ MouseButton1Click: () => setPane(id) }}
		/>
	);
	const narrow = narrowShell(shellWidth);

	return (
		<ThemeProvider theme={theme}>
			<frame
				key="Storyblox"
				ref={(frame: Frame | undefined) => {
					hostRef.current = frame;
					if (frame) rememberWidth(frame);
				}}
				Size={new UDim2(1, 0, 1, 0)}
				BackgroundTransparency={1}
				Change={{ AbsoluteSize: rememberWidth }}
			>
				{narrow ? (
					<frame key="Narrow" Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
						<uilistlayout key="NarrowLayout" FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
						<frame
							key="PaneTabs"
							LayoutOrder={1}
							Size={new UDim2(1, 0, 0, theme.spacing.calc(2))}
							BackgroundTransparency={1}
						>
							<uilistlayout
								key="TabLayout"
								FillDirection={Enum.FillDirection.Horizontal}
								VerticalAlignment={Enum.VerticalAlignment.Center}
								Padding={new UDim(0, theme.spacing.calc(1))}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>
							<uipadding key="TabInset" PaddingLeft={new UDim(0, theme.padding.calc(1))} />
							{tab("stories", "Stories", 1)}
							{tab("canvas", "Canvas", 2)}
							{inspectorShown && tab("inspector", "Inspector", 3)}
						</frame>
						<frame key="Pane" LayoutOrder={2} Size={new UDim2(1, 0, 1, -theme.spacing.calc(2))} BackgroundTransparency={1}>
							{pane === "stories" ? sidebar : pane === "inspector" && inspectorShown ? inspector : canvas}
						</frame>
					</frame>
				) : (
					<SplitPane
						value={sidebarWidth}
						min={SIDEBAR_MIN}
						max={SIDEBAR_MAX}
						onChange={setSidebarWidth}
						first={sidebar}
						second={
							inspectorShown ? (
								<SplitPane value={inspectorWidth} min={160} onChange={setInspectorWidth} first={canvas} second={inspector} />
							) : (
								canvas
							)
						}
					/>
				)}
			</frame>
		</ThemeProvider>
	);
}

export default Storyblox;
