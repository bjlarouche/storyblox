import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Story } from "interfaces";
import { IconButton, Icons, Shadow, Theme, useTheme, WriteableStyle } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import { createCleanupGate, readTemplateResult } from "../cleanupGate";
import { resolveStoryTools, StoryTools } from "packages/defineStory";
import { CAMERA_DISTANCE, CAMERA_PITCH, dragYaw, ORBIT_STEP, orbitOffset } from "packages/previewCamera";
import { GRID_CELL, gridLineCount, previewScale, previewSize, stepZoom } from "packages/previewScale";
import { applyArg, ArgValues, copyArgs } from "../storyArgs";
import { storyLabel } from "../storyLabel";
import { CaseResult, createCaseClock, createSeed, runCase } from "packages/storyCases";
import Controls from "./Controls";
import useTemplateStyles from "./Template.styles";

const REMOUNT_ICON = "rbxassetid://75431112013973" as Icons;
const CONTROLS_MIN = 120;
const SCENE_BACKDROP = new Color3(0.1, 0.1, 0.12);

function HostScene(props: { yaw: number; onOrbit: (dx: number) => void; children?: React.ReactNode }) {
	const frame = useRef<ViewportFrame>();
	const camera = useRef<Camera>();
	const drag = useRef<number | undefined>(undefined);
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
			BackgroundColor3={SCENE_BACKDROP}
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
	starred?: boolean;
	onToggleFavorite?: () => void;
	remount?: number;
	caseRequest?: { name: string; id: number };
	argsRequest?: { args?: { [key: string]: unknown }; id: number };
	onCaseResult?: (result: CaseResult) => void;
}

function Template({
	story,
	primaryThemeEnabled,
	onToggleTheme,
	starred,
	onToggleFavorite,
	remount = 0,
	caseRequest,
	argsRequest,
	onCaseResult,
}: TemplateProps) {
	const { root, container, corner, navBar, storyBar, title, preview, canvas } = useTemplateStyles();
	const { theme } = useTheme();
	const [gate] = useState(createCleanupGate);
	const [template, setTemplate] = useState<React.Element | undefined>();
	const [failure, setFailure] = useState<unknown>();
	const [epoch, setEpoch] = useState(0);
	const [split, setSplit] = useState(10000);
	const [fit, setFit] = useState(true);
	const [grid, setGrid] = useState(false);
	const [zoom, setZoom] = useState(1);
	const [yaw, setYaw] = useState(0);
	const [dock, setDock] = useState({ x: 0, y: 0 });
	const storyKey = story?.title ?? "";
	const [argsStory, setArgsStory] = useState("");
	const [args, setArgs] = useState<ArgValues>({});
	if (storyKey !== argsStory) {
		setArgsStory(storyKey);
		const described = story as { args?: unknown; props?: unknown } | undefined;
		setArgs(copyArgs(described?.args ?? described?.props));
		setYaw(0);
	}
	const previewTheme = theme;
	const argTypes = (story as { argTypes?: unknown } | undefined)?.argTypes;
	let controlled = false;
	if (typeOf(argTypes) === "table") {
		for (const _ of pairs(argTypes as object)) controlled = true;
	}
	const native = (story as { renderer?: string } | undefined)?.renderer === "native";
	const chromeHeight = theme.spacing.calc(2);
	const storyBarHeight = theme.spacing.calc(1.75);
	const storyTools = resolveStoryTools((story as { tools?: StoryTools } | undefined)?.tools, {
		orbit: () => setYaw((current) => current + ORBIT_STEP),
		resetCamera: () => setYaw(0),
	});
	const hasStoryTools = storyTools.size() > 0;
	const topBars = chromeHeight + (hasStoryTools ? storyBarHeight : 0);
	const mountKey = `${storyKey}@${epoch}`;
	const mounted = useRef("");
	const themeMounted = useRef<Theme | undefined>(undefined);
	const mountFrame = useRef<Frame>();
	const argsRef = useRef(args);
	argsRef.current = args;

	useEffect(() => {
		return () => gate.dispose();
	}, [gate]);

	useEffect(() => {
		if (remount > 0) setEpoch((current) => current + 1);
	}, [remount]);

	useEffect(() => {
		if (caseRequest === undefined || story === undefined) return;
		const name = caseRequest.name;
		const cases = (story as { cases?: { [key: string]: unknown } }).cases;
		const body = cases?.[name];
		if (typeOf(body) !== "function") {
			onCaseResult?.({ name, passed: false, failures: ["missing case"] });
			return;
		}
		const described = story as { args?: unknown; props?: unknown };
		setArgs(copyArgs(described.args ?? described.props));
		const key = mounted.current;
		const clock = createCaseClock();
		task.spawn(() => {
			task.wait();
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
			clock.cancel();
			onCaseResult?.(result);
		});
	}, [caseRequest]);

	useEffect(() => {
		if (argsRequest === undefined || story === undefined) return;
		const incoming = argsRequest.args;
		if (incoming === undefined) {
			const described = story as { args?: unknown; props?: unknown };
			setArgs(copyArgs(described.args ?? described.props));
			return;
		}
		setArgs((current) => {
			let updated = current;
			for (const [key, value] of pairs(incoming)) updated = applyArg(updated, key as string, value);
			return updated;
		});
	}, [argsRequest]);

	useEffect(() => {
		if (story === undefined) {
			setTemplate(undefined);
			gate.replace(undefined);
			mounted.current = "";
			themeMounted.current = undefined;
			return;
		}

		const session = (story as { nativeSession?: { update?: (args: unknown) => void } }).nativeSession;
		if (native && mounted.current === mountKey && themeMounted.current === previewTheme && session?.update !== undefined) {
			try {
				session.update(args);
			} catch (error) {
				setFailure(error);
			}
			return;
		}

		try {
			const render = story.template as (props: unknown, context: { theme: Theme }) => unknown;
			const props = args;
			const [element, callback] = render(props, { theme: previewTheme }) as LuaTuple<[StoryElement, StoryCallback | undefined]>;
			const parsed = readTemplateResult(element, callback);
			const inset = theme.padding.calc(2);
			const logical = (
				story as { preview?: { kind?: unknown; width?: unknown; height?: unknown; background?: unknown } }
			).preview;
			const viewport = logical?.kind === "viewport" && !native;
			const size = previewSize(logical);
			const declared = size !== undefined;
			const logicalWidth = size?.width ?? dock.x;
			const logicalHeight = size?.height ?? dock.y;
			const background = typeOf(logical?.background) === "Color3" ? (logical?.background as Color3) : undefined;
			const fitScale = declared
				? previewScale(fit ? "fit" : "actual", logicalWidth, logicalHeight, dock.x, dock.y)
				: 1;
			const scale = fitScale * zoom;
			const gridColor = theme.options.constants.colors.textMuted;
			setTemplate(
				<frame
					key={`mount-${epoch}`}
					ref={mountFrame}
					Size={declared ? new UDim2(0, logicalWidth, 0, logicalHeight) : new UDim2(1, 0, 1, 0)}
					BackgroundColor3={background ?? new Color3(0, 0, 0)}
					BackgroundTransparency={background !== undefined ? 0 : 1}
				>
					<uiscale key="Scale" Scale={scale} />
					{declared ? <uistroke key="Bounds" Thickness={1} Color={gridColor} Transparency={0.45} /> : undefined}
					{grid ? gridLines(logicalWidth, logicalHeight, gridColor) : undefined}
					<uipadding
						key="Inset"
						PaddingTop={new UDim(0, inset)}
						PaddingBottom={new UDim(0, inset)}
						PaddingLeft={new UDim(0, inset)}
						PaddingRight={new UDim(0, inset)}
					/>
					{viewport ? (
						<HostScene yaw={yaw} onOrbit={(dx) => setYaw((current) => dragYaw(current, dx))}>{parsed.element as React.Element}</HostScene>
					) : (
						(parsed.element as React.Element)
					)}
				</frame>,
			);
			themeMounted.current = previewTheme;
			if (native || mounted.current !== mountKey) {
				mounted.current = mountKey;
				gate.replace(parsed.cleanup);
			}
		} catch (error) {
			setTemplate(undefined);
			gate.replace(undefined);
			mounted.current = "";
			themeMounted.current = undefined;
			setFailure(error);
		}
	}, [story, gate, theme, epoch, args, native, mountKey, fit, dock, grid, zoom, previewTheme, yaw]);

	if (failure !== undefined) {
		throw failure;
	}

	const favoriteShown = onToggleFavorite !== undefined && story !== undefined;
	const favoriteSlot = favoriteShown ? theme.spacing.calc(2) : 0;

	return (
		<frame key="Template" {...root}>
			<frame key="Container" {...container}>
				<uicorner key="Corner" {...corner} />
				<Shadow />

				<frame key="NavBar" {...navBar}>
					{favoriteShown && (
						<stars.Tooltip
							text={starred ? "Remove from starred" : "Add to starred"}
							className={
								{
									Size: new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5)),
									Position: new UDim2(0, theme.spacing.calc(0.5), 0.5, 0),
									AnchorPoint: new Vector2(0, 0.5),
									AutomaticSize: Enum.AutomaticSize.None,
									ZIndex: 300,
								} as WriteableStyle<Frame>
							}
						>
							<IconButton
								id="Favorite"
								icon={starred ? stars.Icons.StarFilled : stars.Icons.Star}
								tint={theme.options.constants.colors.textMuted}
								onClick={onToggleFavorite}
								className={
									{
										Size: new UDim2(0, theme.spacing.calc(1.25), 0, theme.spacing.calc(1.25)),
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
						Position={new UDim2(0, theme.spacing.calc(0.5) + favoriteSlot, 0, 0)}
						Size={new UDim2(1, -(theme.spacing.calc(5) + favoriteSlot), 1, 0)}
					/>
					{onToggleTheme && (
						<frame
							key="Tools"
							Size={new UDim2(0, 0, 1, 0)}
							AutomaticSize={Enum.AutomaticSize.X}
							AnchorPoint={new Vector2(1, 0.5)}
							Position={new UDim2(1, -theme.spacing.calc(0.5), 0.5, 0)}
							BackgroundTransparency={1}
						>
							<uilistlayout
								key="ToolsLayout"
								FillDirection={Enum.FillDirection.Horizontal}
								VerticalAlignment={Enum.VerticalAlignment.Center}
								HorizontalAlignment={Enum.HorizontalAlignment.Right}
								Padding={new UDim(0, theme.spacing.calc(1))}
								SortOrder={Enum.SortOrder.LayoutOrder}
							/>
							<textbutton
								key="ZoomOut"
								Text="-"
								LayoutOrder={1}
								AutomaticSize={Enum.AutomaticSize.X}
								Size={new UDim2(0, 0, 0, theme.spacing.calc(1.5))}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
								Event={{ MouseButton1Click: () => setZoom((current) => stepZoom(current, -1)) }}
							/>
							<textlabel
								key="Zoom"
								Text={`${math.floor(zoom * 100)}%`}
								LayoutOrder={2}
								AutomaticSize={Enum.AutomaticSize.X}
								Size={new UDim2(0, 0, 0, theme.spacing.calc(1.5))}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
							/>
							<textbutton
								key="ZoomIn"
								Text="+"
								LayoutOrder={3}
								AutomaticSize={Enum.AutomaticSize.X}
								Size={new UDim2(0, 0, 0, theme.spacing.calc(1.5))}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
								Event={{ MouseButton1Click: () => setZoom((current) => stepZoom(current, 1)) }}
							/>
							<textbutton
								key="Grid"
								Text={grid ? "Grid on" : "Grid"}
								LayoutOrder={4}
								AutomaticSize={Enum.AutomaticSize.X}
								Size={new UDim2(0, 0, 0, theme.spacing.calc(1.5))}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
								TextTransparency={grid ? 0 : 0.45}
								Event={{ MouseButton1Click: () => setGrid((current) => !current) }}
							/>
							<textbutton
								key="Fit"
								Text={fit ? "Fit" : "100%"}
								LayoutOrder={5}
								AutomaticSize={Enum.AutomaticSize.X}
								Size={new UDim2(0, 0, 0, theme.spacing.calc(1.5))}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
								Event={{ MouseButton1Click: () => setFit((current) => !current) }}
							/>
							<IconButton
								id="Remount"
								icon={REMOUNT_ICON}
								tint={theme.options.constants.colors.textMuted}
								onClick={() => setEpoch((current) => current + 1)}
								className={
									{
										Size: new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5)),
										LayoutOrder: 6,
									} as WriteableStyle<ImageButton>
								}
							/>
							<IconButton
								id="Theme"
								icon={primaryThemeEnabled ? Icons.DarkTheme : Icons.LightTheme}
								tint={theme.options.constants.colors.textMuted}
								onClick={onToggleTheme}
								className={
									{
										Size: new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5)),
										LayoutOrder: 7,
									} as WriteableStyle<ImageButton>
								}
							/>
						</frame>
					)}
				</frame>

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
							PaddingLeft={new UDim(0, theme.spacing.calc(0.5))}
							PaddingRight={new UDim(0, theme.spacing.calc(0.5))}
						/>
						{storyTools.map((tool, index) => (
							<textbutton
								key={tool.id}
								Text={tool.label}
								LayoutOrder={index}
								AutomaticSize={Enum.AutomaticSize.X}
								Size={new UDim2(0, 0, 0, theme.spacing.calc(1.25))}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.options.constants.colors.textMuted}
								TextTransparency={tool.active === false ? 0.45 : 0}
								Selectable={true}
								Event={{ MouseButton1Click: tool.onClick }}
							/>
						))}
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
						min={controlled ? CONTROLS_MIN : theme.spacing.calc(5)}
						onChange={setSplit}
						first={<Canvas className={canvas}>{template}</Canvas>}
						second={
							<Controls
								theme={theme}
								args={args}
								argTypes={argTypes}
								defaults={(story as { args?: unknown; props?: unknown } | undefined)?.args ?? (story as { props?: unknown } | undefined)?.props}
								description={(story as { description?: unknown } | undefined)?.description}
								onChange={(key, value) => setArgs((current) => applyArg(current, key, value))}
								onReset={() => {
									const described = story as { args?: unknown; props?: unknown } | undefined;
									setArgs(copyArgs(described?.args ?? described?.props));
								}}
							/>
						}
					/>
				</frame>
			</frame>
		</frame>
	);
}

export default Template;
