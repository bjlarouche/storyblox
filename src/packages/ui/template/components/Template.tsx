import React, { useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { Story } from "interfaces";
import Log from "@rbxts/log";
import { CircularProgress, ErrorBoundary, IconButton, Icons, Shadow, Theme, ThemeProvider, useTheme, WriteableStyle } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import { createCleanupGate, readTemplateResult } from "../cleanupGate";
import { resolveStoryTools, StoryTools } from "packages/defineStory";
import { CAMERA_DISTANCE, CAMERA_PITCH, dragYaw, ORBIT_STEP, orbitOffset } from "packages/previewCamera";
import {
	activePreview,
	flipOrientation,
	GRID_CELL,
	gridLineCount,
	previewScale,
	previewSize,
	sizeChoice,
	sizeChoiceActive,
	sizeChoiceLabel,
	stepZoom,
	storySizeLabel,
} from "packages/previewScale";
import { extraGlobalEntries, mergeGlobals } from "packages/storyGlobals";
import { collectLoaders, settleLoaders } from "packages/storyLoaders";
import { acceptStoryLoad, revealStoryLoad, STORY_LOAD_REVEAL } from "packages/storyLoad";
import { bindActionArgs, createActionLog } from "packages/storyActions";
import { actionFilter, allowAction, canvasLayout, docsPage } from "packages/storyParameters";
import { scanA11y, A11yFinding } from "packages/a11yHeuristics";
import { BoxRect, collectGuiBoxes, guiBox } from "packages/layoutTools";
import { applyArg, ArgValues, copyArgs } from "../storyArgs";
import { hasStoryControls, storyArgs } from "../storyControls";
import { storyLabel } from "../storyLabel";
import { CaseResult, createCaseClock, createSeed, runCase } from "packages/storyCases";
import { ActionLogContext } from "../actionLogContext";
import InspectorPane from "./InspectorPane";
import CanvasToolbar from "./CanvasToolbar";
import OutlineOverlay from "./OutlineOverlay";
import ErrorPanel from "./ErrorPanel";
import SafeBoundary from "./SafeBoundary";
import useTemplateStyles from "./Template.styles";

const CONTROLS_MIN = 120;

function caseNames(story: Story | undefined): string[] {
	const cases = (story as { cases?: { [key: string]: unknown } } | undefined)?.cases;
	const names = new Array<string>();
	if (typeOf(cases) !== "table") return names;
	for (const [name, body] of pairs(cases as object)) {
		if (typeOf(body) === "function") names.push(name as string);
	}
	return names;
}

function HostScene(props: { yaw: number; onOrbit: (dx: number) => void; children?: React.ReactNode }) {
	const frame = useRef<ViewportFrame>();
	const camera = useRef<Camera>();
	const drag = useRef<number | undefined>(undefined);
	const { theme } = useTheme();
	const offset = orbitOffset(props.yaw, CAMERA_PITCH, CAMERA_DISTANCE);
	useEffect(() => {
		const current = frame.current;
		const cam = camera.current;
		if (current && cam) current.CurrentCamera = cam;
	}, [props.yaw]);
	return (
		<viewportframe
			key="HostViewport"
			ref={frame}
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={theme.palette.surface.canvas}
			Event={{
				InputBegan: (_, input) => {
					if (input.UserInputType === Enum.UserInputType.MouseButton1) drag.current = input.Position.X;
				},
				InputChanged: (_, input) => {
					if (drag.current === undefined || input.UserInputType !== Enum.UserInputType.MouseMovement) return;
					const dx = input.Position.X - drag.current;
					drag.current = input.Position.X;
					if (dx !== 0) props.onOrbit(dx);
				},
				InputEnded: (_, input) => {
					if (input.UserInputType === Enum.UserInputType.MouseButton1) drag.current = undefined;
				},
				MouseLeave: () => {
					drag.current = undefined;
				},
			}}
		>
			<camera
				key="HostCamera"
				ref={camera}
				CFrame={CFrame.lookAt(new Vector3(offset.x, offset.y, offset.z), Vector3.zero)}
			/>
			<worldmodel key="HostScene">{props.children}</worldmodel>
		</viewportframe>
	);
}

function gridLines(width: number, height: number, color: Color3) {
	const lines = new Array<React.Element>();
	const vertical = gridLineCount(width, GRID_CELL);
	for (let i = 1; i <= vertical; i++) {
		const at = i * GRID_CELL;
		lines.push(
			<frame
				key={`gx-${at}`}
				BackgroundColor3={color}
				BackgroundTransparency={0.9}
				BorderSizePixel={0}
				Size={new UDim2(0, 1, 1, 0)}
				Position={new UDim2(0, at, 0, 0)}
				ZIndex={1}
			/>,
		);
	}
	const horizontal = gridLineCount(height, GRID_CELL);
	for (let i = 1; i <= horizontal; i++) {
		const at = i * GRID_CELL;
		lines.push(
			<frame
				key={`gy-${at}`}
				BackgroundColor3={color}
				BackgroundTransparency={0.9}
				BorderSizePixel={0}
				Size={new UDim2(1, 0, 0, 1)}
				Position={new UDim2(0, 0, 0, at)}
				ZIndex={1}
			/>,
		);
	}
	return (
		<frame key="Grid" Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} ZIndex={0}>
			{lines}
		</frame>
	);
}

export const SplitPane = (
	Uiblox as unknown as {
		SplitPane: (props: {
			vertical?: boolean;
			value: number;
			onChange: (value: number) => void;
			min?: number;
			max?: number;
			first?: React.ReactNode;
			second?: React.ReactNode;
		}) => React.Element;
	}
).SplitPane;

const stars = Uiblox as unknown as {
	Tooltip: (props: { text: string; className?: WriteableStyle<Frame>; children?: React.ReactNode }) => React.Element;
	Icons: { Star: Icons; StarFilled: Icons };
};

export interface TemplateProps {
	story?: Story;
	primaryThemeEnabled?: boolean;
	onToggleTheme?: () => void;
	density?: "compact" | "comfortable";
	onToggleDensity?: () => void;
	inspectorOpen?: boolean;
	onToggleInspector?: () => void;
	settingsOpen?: boolean;
	onToggleSettings?: () => void;
	starred?: boolean;
	onToggleFavorite?: () => void;
	remount?: number;
	chromeCommand?: { kind: string; id: number };
	caseRequest?: { name: string; id: number };
	argsRequest?: { args?: { [key: string]: unknown }; id: number };
	onCaseResult?: (result: CaseResult) => void;
	onRenderError?: (failure: unknown | undefined) => void;
	onLoading?: (label: string | undefined) => void;
	debug?: boolean;
}

function loaderStatus(theme: Theme) {
	return (
		<textlabel
			key="Loading"
			Text="Loading"
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={new UDim2(1, 0, 0, theme.spacing.calc(2))}
			BackgroundTransparency={1}
			TextColor3={theme.palette.text.secondary}
			Font={theme.typography.fontFamilies.semibold}
			TextSize={theme.typography.fontSizes.body}
		/>
	);
}

function storyError(title: string, failure: unknown) {
	return <ErrorPanel key="Error" title={`Unable to render ${title}`} message={`${failure}`} />;
}

function Template({
	story,
	primaryThemeEnabled,
	onToggleTheme,
	density = "compact",
	onToggleDensity,
	inspectorOpen = true,
	onToggleInspector,
	settingsOpen,
	onToggleSettings,
	starred,
	onToggleFavorite,
	remount = 0,
	chromeCommand,
	caseRequest,
	argsRequest,
	onCaseResult,
	onRenderError,
	onLoading,
	debug,
}: TemplateProps) {
	const { root, container, corner, navBar, storyBar, title, preview, canvas } = useTemplateStyles();
	const { theme } = useTheme();
	const [gate] = useState(createCleanupGate);
	const [template, setTemplate] = useState<React.Element | undefined>();
	const [failure, setFailure] = useState<unknown>();
	const [epoch, setEpoch] = useState(0);
	const [canvasKey, setCanvasKey] = useState(0);
	const [split, setSplit] = useState(10000);
	const [fit, setFit] = useState(true);
	const [grid, setGrid] = useState(false);
	const [outline, setOutline] = useState(false);
	const [measure, setMeasure] = useState(false);
	const [outlineBoxes, setOutlineBoxes] = useState<BoxRect[]>([]);
	const [outlineOrigin, setOutlineOrigin] = useState<BoxRect>();
	const [zoom, setZoom] = useState(1);
	const [yaw, setYaw] = useState(0);
	const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
	const [sizePick, setSizePick] = useState<string | undefined>();
	const [bgStep, setBgStep] = useState(0);
	const [globalPatch, setGlobalPatch] = useState<{ [key: string]: unknown }>({});
	const [loaderPhase, setLoaderPhase] = useState<"loading" | "error" | "ready">("ready");
	const [loaderMessage, setLoaderMessage] = useState("");
	const [preloaded, setPreloaded] = useState<{ [key: string]: unknown } | undefined>();
	const [loaderWatch, setLoaderWatch] = useState({
		storyKey: "",
		args: {} as ArgValues,
		patch: {} as { [key: string]: unknown },
		density,
		theme: primaryThemeEnabled,
		epoch: 0,
	});
	const [dock, setDock] = useState({ x: 0, y: 0 });
	const [toolsWidth, setToolsWidth] = useState(0);
	const storyKey = story?.title ?? "";
	const [argsStory, setArgsStory] = useState("");
	const [args, setArgs] = useState<ArgValues>({});
	const [actionVersion, setActionVersion] = useState(0);
	const [caseResults, setCaseResults] = useState<CaseResult[]>([]);
	const [caseRunning, setCaseRunning] = useState<string | undefined>();
	const [lastCase, setLastCase] = useState<string | undefined>();
	const [a11yFindings, setA11yFindings] = useState<A11yFinding[]>([]);
	const [panelCaseRequest, setPanelCaseRequest] = useState<{ name: string; id: number } | undefined>();
	const activeCaseRequest = caseRequest ?? panelCaseRequest;
	const actionLog = useMemo(() => createActionLog(), [storyKey]);
	const features = (
		story as {
			features?: { actions?: boolean; interactions?: boolean; docs?: boolean };
		} | undefined
	)?.features;
	const storyParameters = (story as { parameters?: unknown } | undefined)?.parameters;
	const layout = canvasLayout(storyParameters);
	const page = docsPage(storyParameters);
	const filter = actionFilter(storyParameters);
	const actionsLogged = filter !== "off" && (features?.actions === true || filter !== "all");
	const interactionsEnabled = features?.interactions === true;
	const docsEnabled = page !== false && (features?.docs === true || typeOf(page) === "string");
	const actionApi = useMemo(
		() => ({
			disabled: !actionsLogged,
			record: (name: string, ...values: unknown[]) => {
				if (!actionsLogged) return;
				actionLog.record(name, ...values);
				setActionVersion((current) => current + 1);
			},
		}),
		[actionLog, actionsLogged],
	);
	if (storyKey !== argsStory) {
		setArgsStory(storyKey);
		setArgs(copyArgs(storyArgs(story as never)));
		setYaw(0);
		setOutline(false);
		setMeasure(false);
		setOutlineBoxes([]);
		setOutlineOrigin(undefined);
		setCaseResults([]);
		setCaseRunning(undefined);
		setLastCase(undefined);
		setA11yFindings([]);
		setBgStep(0);
		setGlobalPatch({});
		const previewOrientation = (story as { preview?: { orientation?: unknown } } | undefined)?.preview?.orientation;
		setOrientation(previewOrientation === "landscape" ? "landscape" : "portrait");
		setSizePick(undefined);
	}
	const loaderFns = (
		story as {
			loaderFns?: Array<(context: { args: unknown; globals?: unknown; parameters?: unknown }) => unknown>;
		} | undefined
	)?.loaderFns;
	const hasLoaders = loaderFns !== undefined && loaderFns.size() > 0;
	if (
		loaderWatch.storyKey !== storyKey ||
		loaderWatch.args !== args ||
		loaderWatch.patch !== globalPatch ||
		loaderWatch.density !== density ||
		loaderWatch.theme !== primaryThemeEnabled ||
		loaderWatch.epoch !== epoch
	) {
		setLoaderWatch({
			storyKey,
			args,
			patch: globalPatch,
			density,
			theme: primaryThemeEnabled,
			epoch,
		});
		setLoaderPhase(hasLoaders ? "loading" : "ready");
		setPreloaded(undefined);
		setLoaderMessage("");
		setFailure(undefined);
	}
	const previewTheme = theme;
	const argTypes = (story as { argTypes?: unknown } | undefined)?.argTypes;
	const controlled = hasStoryControls(story as never);
	const native = (story as { renderer?: string } | undefined)?.renderer === "native";
	const chromeHeight = theme.spacing.calc(3.5);
	const storyBarHeight = theme.spacing.calc(3);
	const storyTools = resolveStoryTools((story as { tools?: StoryTools } | undefined)?.tools, {
		orbit: () => setYaw((current) => current + ORBIT_STEP),
		resetCamera: () => setYaw(0),
	});
	const hasStoryTools = storyTools.size() > 0;
	const topBars = chromeHeight + (hasStoryTools ? storyBarHeight : 0);
	const mountKey = `${storyKey}@${epoch}@${sizePick ?? ""}`;
	const mounted = useRef("");
	const themeMounted = useRef<Theme | undefined>(undefined);
	const mountFrame = useRef<Frame>();
	const loadGen = useRef(0);
	const committedPaint = useRef("");
	const onLoadingRef = useRef(onLoading);
	onLoadingRef.current = onLoading;
	const debugRef = useRef(debug);
	debugRef.current = debug;
	const [storyHold, setStoryHold] = useState(false);
	const [loadShown, setLoadShown] = useState(false);
	const argsRef = useRef(args);
	argsRef.current = args;

	useEffect(() => {
		return () => gate.dispose();
	}, [gate]);

	useEffect(() => {
		if (remount > 0) setEpoch((current) => current + 1);
	}, [remount]);

	useEffect(() => {
		if (chromeCommand === undefined) return;
		const kind = chromeCommand.kind;
		if (kind === "zoomIn") setZoom((current) => stepZoom(current, 1));
		else if (kind === "zoomOut") setZoom((current) => stepZoom(current, -1));
		else if (kind === "grid") setGrid((current) => !current);
		else if (kind === "fit") setFit((current) => !current);
		else if (kind === "orientation") setOrientation((current) => flipOrientation(current));
		else if (kind === "background") setBgStep((current) => (current + 1) % 3);
	}, [chromeCommand]);

	useEffect(() => {
		if (!outline && !measure) {
			setOutlineBoxes([]);
			setOutlineOrigin(undefined);
			return;
		}
		let alive = true;
		task.defer(() => {
			if (!alive) return;
			const root = mountFrame.current;
			if (root === undefined) return;
			const boxes = collectGuiBoxes(root);
			if (boxes.size() > 0) boxes.shift();
			if (!alive) return;
			setOutlineOrigin(guiBox(root));
			setOutlineBoxes(boxes);
		});
		return () => {
			alive = false;
		};
	}, [outline, measure, storyKey, epoch, args]);

	useEffect(() => {
		if (activeCaseRequest === undefined || story === undefined) return;
		const name = activeCaseRequest.name;
		const cases = (story as { cases?: { [key: string]: unknown } }).cases;
		const body = cases?.[name];
		if (typeOf(body) !== "function") {
			const missing = { name, passed: false, failures: ["missing case"] };
			setCaseRunning(undefined);
			setCaseResults((current) => {
				const updated = new Array<CaseResult>();
				for (const item of current) updated.push(item);
				updated.push(missing);
				return updated;
			});
			onCaseResult?.(missing);
			return;
		}
		setArgs(copyArgs(storyArgs(story as never)));
		setCaseRunning(name);
		setLastCase(name);
		const key = mounted.current;
		const clock = createCaseClock();
		task.spawn(() => {
			task.wait();
			const started = os.clock();
			const result = runCase(
				name,
				body as Parameters<typeof runCase>[1],
				{
					find: (target: string) => mountFrame.current?.FindFirstChild(target, true),
					args: () => argsRef.current,
					setArg: (arg: string, value: unknown) => setArgs((current) => applyArg(current, arg, value)),
					wait: (seconds?: number) => task.wait(seconds),
					clock,
					random: createSeed(1),
				},
				() => mounted.current !== key,
			);
			const finished = { ...result, elapsed: os.clock() - started };
			clock.cancel();
			setCaseRunning(undefined);
			setCaseResults((current) => {
				const updated = new Array<CaseResult>();
				for (const item of current) updated.push(item);
				updated.push(finished);
				return updated;
			});
			onCaseResult?.(finished);
		});
	}, [activeCaseRequest]);

	useEffect(() => {
		if (argsRequest === undefined || story === undefined) return;
		const incoming = argsRequest.args;
		if (incoming === undefined) {
			setArgs(copyArgs(storyArgs(story as never)));
			return;
		}
		setArgs((current) => {
			let updated = current;
			for (const [key, value] of pairs(incoming)) updated = applyArg(updated, key as string, value);
			return updated;
		});
	}, [argsRequest]);

	useEffect(() => {
		if (story === undefined || !hasLoaders || loaderFns === undefined) return;
		let alive = true;
		const themeName = primaryThemeEnabled ? "dark" : "light";
		const globals = mergeGlobals(story.globals, globalPatch, themeName, density);
		const batch = collectLoaders(loaderFns, args, globals, story.parameters);
		if (batch.error !== undefined) {
			setLoaderPhase("error");
			setLoaderMessage(batch.error);
			setPreloaded(undefined);
			return;
		}
		if (batch.pending.size() === 0) {
			setLoaderPhase("ready");
			setLoaderMessage("");
			setPreloaded(batch.loaded);
			return;
		}
		setLoaderPhase("loading");
		settleLoaders(
			batch,
			() => alive,
			(loaded) => {
				setLoaderPhase("ready");
				setLoaderMessage("");
				setPreloaded(loaded);
			},
			(message) => {
				setLoaderPhase("error");
				setLoaderMessage(message);
				setPreloaded(undefined);
			},
		);
		return () => {
			alive = false;
		};
	}, [story, args, globalPatch, density, primaryThemeEnabled, hasLoaders, loaderFns, epoch]);

	useEffect(() => {
		const token = loadGen.current + 1;
		loadGen.current = token;
		const paintKey = `${storyKey}@${epoch}`;
		const switching = story !== undefined && committedPaint.current !== paintKey;
		let reveal: thread | undefined;
		const release = () => {
			if (reveal !== undefined) pcall(() => task.cancel(reveal as thread));
			if (!acceptStoryLoad(token, loadGen.current)) return;
			setStoryHold(false);
			setLoadShown(false);
			onLoadingRef.current?.(undefined);
		};
		const work = () => {
		if (!acceptStoryLoad(token, loadGen.current)) return;
		if (story === undefined) {
			setTemplate(undefined);
			setFailure(undefined);
			onRenderError?.(undefined);
			gate.replace(undefined);
			mounted.current = "";
			themeMounted.current = undefined;
			committedPaint.current = "";
			release();
			return;
		}
		if (hasLoaders && (loaderPhase !== "ready" || preloaded === undefined)) {
			setTemplate(undefined);
			gate.replace(undefined);
			mounted.current = "";
			release();
			return;
		}

		const renderArgs = actionsLogged ? bindActionArgs(args, actionApi.record, (path) => allowAction(filter, path)) : args;
		const session = (story as { nativeSession?: { update?: (args: unknown) => void } }).nativeSession;
		if (native && mounted.current === mountKey && themeMounted.current === previewTheme && session?.update !== undefined) {
			try {
				session.update(renderArgs);
				setFailure(undefined);
				onRenderError?.(undefined);
			} catch (error) {
				setFailure(error);
				onRenderError?.(error);
			}
			return;
		}

		try {
			const render = story.template as (
				props: unknown,
				context: {
					theme: Theme;
					globals?: { [key: string]: unknown };
					parameters?: { [key: string]: unknown };
					preloaded?: { [key: string]: unknown };
				},
			) => unknown;
			const props = renderArgs;
			const themeName = primaryThemeEnabled ? "dark" : "light";
			const globals = mergeGlobals(story.globals, globalPatch, themeName, density);
			const renderStarted = os.clock();
			const [element, callback] = render(props, {
				theme: previewTheme,
				globals,
				parameters: story.parameters,
				preloaded: hasLoaders ? preloaded : undefined,
			}			) as LuaTuple<[StoryElement, StoryCallback | undefined]>;
			if (debugRef.current === true) {
				Log.Debug(`story render ${math.floor((os.clock() - renderStarted) * 1000)}ms`);
			}
			if (!acceptStoryLoad(token, loadGen.current)) return;
			const parsed = readTemplateResult(element, callback);
			const inset = layout === "fullscreen" ? 0 : theme.padding.calc(2);
			const logical = (
				story as {
					preview?: { kind?: unknown; width?: unknown; height?: unknown; background?: unknown; orientation?: unknown };
				}
			).preview;
			const viewport = logical?.kind === "viewport" && !native;
			const size = previewSize(activePreview(logical, sizePick), orientation);
			const declared = size !== undefined;
			const logicalWidth = size?.width ?? dock.x;
			const logicalHeight = size?.height ?? dock.y;
			const storyBackground =
				typeOf(logical?.background) === "Color3" ? (logical?.background as Color3) : undefined;
			const chromeBackground =
				bgStep === 1 ? theme.palette.surface.paper : bgStep === 2 ? theme.palette.surface.canvas : undefined;
			const background = chromeBackground ?? storyBackground;
			const fitScale = declared
				? previewScale(fit ? "fit" : "actual", logicalWidth, logicalHeight, dock.x, dock.y)
				: 1;
			const scale = fitScale * zoom;
			const gridColor = theme.palette.text.secondary;
			const storyElement = viewport ? (
				<HostScene yaw={yaw} onOrbit={(dx) => setYaw((current) => dragYaw(current, dx))}>
					{parsed.element as React.Element}
				</HostScene>
			) : (
				(parsed.element as React.Element)
			);
			setFailure(undefined);
			onRenderError?.(undefined);
			setTemplate(
				<frame
					key={`mount-${epoch}`}
					ref={mountFrame}
					Size={declared ? new UDim2(0, logicalWidth, 0, logicalHeight) : new UDim2(1, 0, 1, 0)}
					BackgroundColor3={background ?? theme.palette.surface.canvas}
					BackgroundTransparency={background !== undefined ? 0 : 1}
					BorderSizePixel={0}
					ClipsDescendants={declared}
				>
					<uiscale key="Scale" Scale={scale} />
					<frame key="Inset" ZIndex={1} Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
						<uipadding
							key="Pad"
							PaddingTop={new UDim(0, inset)}
							PaddingBottom={new UDim(0, inset)}
							PaddingLeft={new UDim(0, inset)}
							PaddingRight={new UDim(0, inset)}
						/>
						{layout === "centered" ? (
							<frame key="Story" Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
								<uilistlayout
									key="Center"
									FillDirection={Enum.FillDirection.Vertical}
									HorizontalAlignment={Enum.HorizontalAlignment.Center}
									VerticalAlignment={Enum.VerticalAlignment.Center}
								/>
								{storyElement}
							</frame>
						) : (
							storyElement
						)}
					</frame>
					{/* Sibling above the story. Grid draws over content. */}
					<frame key="Overlay" ZIndex={2} Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
						{declared && grid ? <uistroke key="Bounds" Thickness={1} Color={gridColor} Transparency={0.45} /> : undefined}
						{grid ? gridLines(logicalWidth, logicalHeight, gridColor) : undefined}
						{(outline || measure) && outlineOrigin !== undefined ? (
							<OutlineOverlay theme={theme} boxes={outlineBoxes} measure={measure} origin={outlineOrigin} scale={scale} />
						) : undefined}
					</frame>
				</frame>,
			);
			themeMounted.current = previewTheme;
			if (native || mounted.current !== mountKey) {
				mounted.current = mountKey;
				gate.replace(parsed.cleanup);
			}
			committedPaint.current = paintKey;
			release();
		} catch (error) {
			if (!acceptStoryLoad(token, loadGen.current)) return;
			setTemplate(undefined);
			gate.replace(undefined);
			mounted.current = "";
			themeMounted.current = undefined;
			setFailure(error);
			onRenderError?.(error);
			committedPaint.current = paintKey;
			release();
		}
		};
		if (!switching) {
			work();
			return;
		}
		setStoryHold(true);
		setLoadShown(false);
		onLoadingRef.current?.("Loading story…");
		const started = os.clock();
		reveal = task.delay(STORY_LOAD_REVEAL, () => {
			if (!acceptStoryLoad(token, loadGen.current)) return;
			setLoadShown(true);
		});
		task.defer(() => {
			if (!acceptStoryLoad(token, loadGen.current)) return;
			if (revealStoryLoad(os.clock() - started, true)) {
				task.defer(work);
				return;
			}
			work();
		});
		return () => {
			loadGen.current += 1;
			pcall(() => task.cancel(reveal));
		};
	}, [
		story,
		gate,
		theme,
		epoch,
		args,
		native,
		mountKey,
		fit,
		dock,
		grid,
		outline,
		measure,
		outlineBoxes,
		outlineOrigin,
		zoom,
		previewTheme,
		yaw,
		orientation,
		bgStep,
		globalPatch,
		density,
		primaryThemeEnabled,
		hasLoaders,
		loaderPhase,
		preloaded,
		layout,
		actionsLogged,
		filter,
		actionApi,
	]);

	useEffect(() => {
		setCanvasKey((current) => current + 1);
	}, [args, storyKey, epoch]);

	const favoriteShown = onToggleFavorite !== undefined && story !== undefined;
	const favoriteSlot = favoriteShown ? theme.spacing.calc(2) : 0;

	return (
		<frame key="Template" {...root}>
			<frame key="Container" {...container}>
				<uicorner key="Corner" {...corner} />
				<Shadow />

				<SafeBoundary resetKey={`toolbar:${storyKey}`} compact>
				<frame key="NavBar" {...navBar}>
					{favoriteShown && (
						<stars.Tooltip
							text={starred ? "Remove from starred" : "Add to starred"}
							className={
								{
									Size: new UDim2(0, theme.spacing.calc(2), 0, theme.spacing.calc(2)),
									Position: new UDim2(0, theme.spacing.calc(0.75), 0.5, 0),
									AnchorPoint: new Vector2(0, 0.5),
									AutomaticSize: Enum.AutomaticSize.None,
									ZIndex: 300,
								} as WriteableStyle<Frame>
							}
						>
							<IconButton
								id="Favorite"
								icon={starred ? stars.Icons.StarFilled : stars.Icons.Star}
								tint={theme.palette.text.secondary}
								onClick={onToggleFavorite}
								className={
									{
										Size: new UDim2(0, theme.spacing.calc(1.75), 0, theme.spacing.calc(1.75)),
										Position: new UDim2(0.5, 0, 0.5, 0),
										AnchorPoint: new Vector2(0.5, 0.5),
									} as WriteableStyle<ImageButton>
								}
							/>
						</stars.Tooltip>
					)}
					<textlabel
						key="Title"
						Text={
							story
								? storyLabel(
										story.title,
										(story as { renderer?: string }).renderer,
										(story as { language?: string }).language,
									)
								: "Canvas"
						}
						{...title}
						Position={new UDim2(0, theme.spacing.calc(0.75) + favoriteSlot, 0, 0)}
						Size={new UDim2(1, -(toolsWidth + theme.spacing.calc(1.5) + favoriteSlot), 1, 0)}
					/>
					{onToggleTheme && (
						<frame
							key="Tools"
							Size={new UDim2(0, 0, 1, 0)}
							AutomaticSize={Enum.AutomaticSize.X}
							AnchorPoint={new Vector2(1, 0.5)}
							Position={new UDim2(1, -theme.spacing.calc(0.75), 0.5, 0)}
							BackgroundTransparency={1}
							Change={{
								AbsoluteSize: (rbx) => {
									const width = math.floor(rbx.AbsoluteSize.X);
									setToolsWidth((current) => (current === width ? current : width));
								},
							}}
						>
							<uilistlayout
								key="ToolsLayout"
								FillDirection={Enum.FillDirection.Horizontal}
								VerticalAlignment={Enum.VerticalAlignment.Center}
								HorizontalAlignment={Enum.HorizontalAlignment.Right}
								Padding={new UDim(0, theme.spacing.calc(0.5))}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>
							<CanvasToolbar
								zoom={zoom}
								fit={fit}
								sizeLabel={sizeChoiceLabel(sizeChoice(sizePick, (story as { preview?: unknown } | undefined)?.preview))}
								sizeActive={sizeChoiceActive(sizePick, (story as { preview?: unknown } | undefined)?.preview)}
								sizeSelected={sizeChoice(sizePick, (story as { preview?: unknown } | undefined)?.preview)}
								storyOption={storySizeLabel((story as { preview?: unknown } | undefined)?.preview)}
								orientation={orientation}
								canOrient={
									previewSize(activePreview((story as { preview?: unknown } | undefined)?.preview, sizePick)) !==
									undefined
								}
								grid={grid}
								outline={outline}
								measure={measure}
								bgStep={bgStep}
								density={density}
								dark={primaryThemeEnabled === true}
								inspectorOpen={inspectorOpen}
								settingsOpen={settingsOpen}
								showInspector={onToggleInspector !== undefined}
								showSettings={onToggleSettings !== undefined}
								onZoom={(direction) => setZoom((current) => stepZoom(current, direction))}
								onZoomValue={(value) => {
									setZoom(value);
									setFit(false);
								}}
								onFit={() => setFit((current) => !current)}
								onSizePick={setSizePick}
								onOrient={() => setOrientation((current) => flipOrientation(current))}
								onGrid={() => setGrid((current) => !current)}
								onOutline={() =>
									setOutline((current) => {
										if (current) setMeasure(false);
										return !current;
									})
								}
								onMeasure={() =>
									setMeasure((current) => {
										if (!current) setOutline(true);
										return !current;
									})
								}
								onBackground={() => setBgStep((current) => (current + 1) % 3)}
								onDensity={onToggleDensity}
								onTheme={onToggleTheme}
								onInspector={onToggleInspector}
								onSettings={onToggleSettings}
								onRemount={() => setEpoch((current) => current + 1)}
							/>
							<>
								{extraGlobalEntries(story?.globals).map((entry, index) => {
									const shown = globalPatch[entry.name] !== undefined ? globalPatch[entry.name] : entry.value;
									if (typeOf(shown) === "boolean" || typeOf(entry.value) === "boolean") {
										const on = shown === true;
										return (
											<textbutton
												key={`global-${entry.name}`}
												Text={`${entry.name} ${on ? "on" : "off"}`}
												LayoutOrder={20 + index}
												AutomaticSize={Enum.AutomaticSize.X}
												Size={new UDim2(0, 0, 0, theme.spacing.calc(2))}
												BackgroundColor3={theme.palette.action.selected}
												BackgroundTransparency={on ? 0 : 1}
												BorderSizePixel={0}
												AutoButtonColor={false}
												Font={theme.typography.fontFamilies.semibold}
												TextSize={theme.typography.fontSizes.caption}
												TextColor3={on ? theme.palette.text.primary : theme.palette.text.secondary}
												Event={{
													MouseButton1Click: () =>
														setGlobalPatch((current) => {
															const patched: { [key: string]: unknown } = {};
															for (const [key, value] of pairs(current)) patched[key as string] = value;
															patched[entry.name] = !on;
															return patched;
														}),
												}}
											>
												<uicorner key="Round" CornerRadius={new UDim(0, theme.shape.borderRadius)} />
												<uipadding
													key="Pad"
													PaddingLeft={new UDim(0, theme.spacing.calc(0.75))}
													PaddingRight={new UDim(0, theme.spacing.calc(0.75))}
												/>
											</textbutton>
										);
									}
									return (
										<textbox
											key={`global-${entry.name}`}
											Text={tostring(shown)}
											PlaceholderText={entry.name}
											LayoutOrder={20 + index}
											Size={new UDim2(0, theme.spacing.calc(8), 0, theme.spacing.calc(2))}
											BackgroundTransparency={0.5}
											BackgroundColor3={theme.palette.surface.paper}
											ClearTextOnFocus={false}
											Font={theme.typography.fontFamilies.default}
											TextSize={theme.typography.fontSizes.caption}
											TextColor3={theme.palette.text.primary}
											Event={{
												FocusLost: (box) =>
													setGlobalPatch((current) => {
														const patched: { [key: string]: unknown } = {};
														for (const [key, value] of pairs(current)) patched[key as string] = value;
														patched[entry.name] = box.Text;
														return patched;
													}),
											}}
										/>
									);
								})}
							</>
							{extraGlobalEntries(story?.globals).size() > 0 && (
								<textbutton
									key="ResetGlobals"
									Text="Reset"
									LayoutOrder={36}
									AutomaticSize={Enum.AutomaticSize.X}
									Size={new UDim2(0, 0, 0, theme.spacing.calc(2))}
									BackgroundTransparency={1}
									Font={theme.typography.fontFamilies.semibold}
									TextSize={theme.typography.fontSizes.caption}
									TextColor3={theme.palette.text.secondary}
									Event={{ MouseButton1Click: () => setGlobalPatch({}) }}
								/>
							)}
						</frame>
					)}
				</frame>
				</SafeBoundary>

				{hasStoryTools && (
					<frame
						key="StoryTools"
						{...storyBar}
						Position={new UDim2(0.5, 0, 0, chromeHeight)}
						AnchorPoint={new Vector2(0.5, 0)}
					>
						<uilistlayout
							key="StoryToolsLayout"
							FillDirection={Enum.FillDirection.Horizontal}
							VerticalAlignment={Enum.VerticalAlignment.Center}
							HorizontalAlignment={Enum.HorizontalAlignment.Left}
							Padding={new UDim(0, theme.spacing.calc(1))}
							SortOrder={Enum.SortOrder.LayoutOrder}
						/>
						<uipadding
							key="StoryToolsPad"
							PaddingLeft={new UDim(0, theme.spacing.calc(0.75))}
							PaddingRight={new UDim(0, theme.spacing.calc(0.75))}
						/>
						<>
							{storyTools.map((tool, index) => (
								<textbutton
									key={tool.id}
									Text={tool.label}
									LayoutOrder={index}
									AutomaticSize={Enum.AutomaticSize.X}
									Size={new UDim2(0, 0, 0, theme.spacing.calc(1.75))}
									BackgroundTransparency={1}
									Font={theme.typography.fontFamilies.semibold}
									TextSize={theme.typography.fontSizes.caption}
									TextColor3={theme.palette.text.secondary}
									TextTransparency={tool.active === false ? 0.45 : 0}
									Selectable={true}
									Event={{ MouseButton1Click: tool.onClick }}
								/>
							))}
						</>
					</frame>
				)}

				<frame
					key="Preview"
					{...preview}
					Size={new UDim2(1, 0, 1, -topBars)}
					Position={new UDim2(0, 0, 0, topBars)}
					ref={(rbx: Frame | undefined) => {
						if (!rbx) return;
						const x = rbx.AbsoluteSize.X;
						const y = rbx.AbsoluteSize.Y;
						setDock((current) => (current.x === x && current.y === y ? current : { x, y }));
					}}
					Change={{
						AbsoluteSize: (rbx) => {
							const x = rbx.AbsoluteSize.X;
							const y = rbx.AbsoluteSize.Y;
							setDock((current) => (current.x === x && current.y === y ? current : { x, y }));
						},
					}}
				>
					<SplitPane
						vertical
						value={split}
						min={controlled ? CONTROLS_MIN : theme.spacing.calc(7.5)}
						onChange={setSplit}
						first={
							<ErrorBoundary
								key={`canvas-${storyKey}-${canvasKey}`}
								fallback={(failure) => {
									onRenderError?.(failure);
									return (
										<Canvas className={canvas} flush={layout === "fullscreen"}>
											{storyError(storyKey.size() > 0 ? storyKey : "story", failure)}
										</Canvas>
									);
								}}
							>
								<Canvas className={canvas} flush={layout === "fullscreen"}>
									<ActionLogContext.Provider value={actionApi}>
										{hasLoaders && loaderPhase === "loading"
											? loaderStatus(theme)
											: hasLoaders && loaderPhase === "error"
												? storyError(storyKey.size() > 0 ? storyKey : "story", loaderMessage)
												: failure !== undefined
													? storyError(storyKey.size() > 0 ? storyKey : "story", failure)
													: template}
									</ActionLogContext.Provider>
								</Canvas>
							</ErrorBoundary>
						}
						second={
							<ThemeProvider theme={theme}>
								<SafeBoundary resetKey={`inspector:${storyKey}`}>
								<InspectorPane
									key={`inspector-${actionVersion}`}
									theme={theme}
									args={args}
									argTypes={argTypes}
									defaults={storyArgs(story as never)}
									description={(story as { description?: unknown } | undefined)?.description}
									resetKey={storyKey}
									onChange={(key, value) => setArgs((current) => applyArg(current, key, value))}
									onReset={() => setArgs(copyArgs(storyArgs(story as never)))}
									actions={
										actionsLogged
											? {
													events: actionLog.events,
													onReset: () => {
														actionLog.reset();
														setActionVersion((current) => current + 1);
													},
												}
											: undefined
									}
									interactions={
										interactionsEnabled
											? {
													cases: caseNames(story),
													results: caseResults,
													running: caseRunning,
													onRun: (name) =>
														setPanelCaseRequest((current) => ({
															name,
															id: (current?.id ?? 0) + 1,
														})),
													onRerun: () => {
														if (lastCase === undefined) return;
														setPanelCaseRequest((current) => ({
															name: lastCase,
															id: (current?.id ?? 0) + 1,
														}));
													},
												}
											: undefined
									}
									docs={
										docsEnabled
											? {
													title: storyKey,
													description: (story as { description?: unknown } | undefined)?.description,
													page: typeOf(page) === "string" ? page : undefined,
													argTypes,
													source: (story as { sourceText?: string } | undefined)?.sourceText ?? story?.source,
												}
											: undefined
									}
									a11y={
										story !== undefined
											? {
													findings: a11yFindings,
													onRescan: () => {
														const root = mountFrame.current;
														setA11yFindings(root !== undefined ? scanA11y(root) : []);
													},
												}
											: undefined
									}
								/>
								</SafeBoundary>
							</ThemeProvider>
						}
					/>
					{storyHold && (
						<textbutton
							key="StoryLoad"
							Size={UDim2.fromScale(1, 1)}
							BackgroundColor3={theme.palette.surface.paper}
							BackgroundTransparency={loadShown ? 0.35 : 1}
							BorderSizePixel={0}
							Text=""
							AutoButtonColor={false}
							Active={true}
							ZIndex={20}
						>
							{loadShown && (
								<frame
									key="LoadFace"
									AnchorPoint={new Vector2(0.5, 0.5)}
									Position={UDim2.fromScale(0.5, 0.5)}
									Size={new UDim2(0, 160, 0, 56)}
									BackgroundTransparency={1}
									BorderSizePixel={0}
								>
									<uilistlayout
										FillDirection={Enum.FillDirection.Vertical}
										HorizontalAlignment={Enum.HorizontalAlignment.Center}
										VerticalAlignment={Enum.VerticalAlignment.Center}
										Padding={new UDim(0, 6)}
									/>
									<CircularProgress />
									<textlabel
										Text="Loading story…"
										Size={new UDim2(1, 0, 0, 18)}
										BackgroundTransparency={1}
										Font={theme.typography.fontFamilies.semibold}
										TextSize={theme.typography.fontSizes.caption}
										TextColor3={theme.palette.text.primary}
									/>
								</frame>
							)}
						</textbutton>
					)}
				</frame>
			</frame>
		</frame>
	);
}

export default Template;
