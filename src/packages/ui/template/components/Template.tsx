import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Story } from "../../../../interfaces";
import { IconButton, Icons, Shadow, Theme, useTheme, WriteableStyle } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import { createCleanupGate, readTemplateResult } from "../cleanupGate";
import { CAMERA_DISTANCE, CAMERA_PITCH, ORBIT_STEP, orbitOffset } from "../../../previewCamera";
import { GRID_CELL, gridLineCount, previewScale, previewSize, stepZoom } from "../../../previewScale";
import { applyArg, ArgValues, copyArgs } from "../storyArgs";
import Controls from "./Controls";
import useTemplateStyles from "./Template.styles";

const REMOUNT_ICON = "rbxassetid://75431112013973" as Icons;
const CONTROLS_MIN = 120;
const GRID_COLOR = new Color3(1, 1, 1);
const SCENE_BACKDROP = new Color3(0.1, 0.1, 0.12);

function HostScene(props: { yaw: number; children?: React.ReactNode }) {
	const frame = useRef<ViewportFrame>();
	const camera = useRef<Camera>();
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

function gridLines(width: number, height: number) {
	const lines = new Array<React.Element>();
	const vertical = gridLineCount(width, GRID_CELL);
	for (let i = 1; i <= vertical; i++) {
		const at = i * GRID_CELL;
		lines.push(
			<frame
				key={`gx-${at}`}
				BackgroundColor3={GRID_COLOR}
				BackgroundTransparency={0.8}
				BorderSizePixel={0}
				Size={new UDim2(0, 1, 1, 0)}
				Position={new UDim2(0, at, 0, 0)}
				ZIndex={2}
			/>,
		);
	}
	const horizontal = gridLineCount(height, GRID_CELL);
	for (let i = 1; i <= horizontal; i++) {
		const at = i * GRID_CELL;
		lines.push(
			<frame
				key={`gy-${at}`}
				BackgroundColor3={GRID_COLOR}
				BackgroundTransparency={0.8}
				BorderSizePixel={0}
				Size={new UDim2(1, 0, 0, 1)}
				Position={new UDim2(0, 0, 0, at)}
				ZIndex={2}
			/>,
		);
	}
	return lines;
}

const SplitPane = (
	Uiblox as unknown as {
		SplitPane: (props: {
			vertical?: boolean;
			value: number;
			onChange: (value: number) => void;
			min?: number;
			first?: React.ReactNode;
			second?: React.ReactNode;
		}) => React.Element;
	}
).SplitPane;

export interface TemplateProps {
	story?: Story;
	primaryThemeEnabled?: boolean;
	onToggleTheme?: () => void;
	storyTheme?: Theme;
	storyOnPrimary?: boolean;
	onToggleStoryTheme?: () => void;
}

function Template({ story, primaryThemeEnabled, onToggleTheme, storyTheme, storyOnPrimary, onToggleStoryTheme }: TemplateProps) {
	const { root, container, corner, navBar, title, preview, canvas } = useTemplateStyles();
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
	const previewTheme = storyTheme ?? theme;
	const native = (story as { renderer?: string } | undefined)?.renderer === "native";
	const mountKey = `${storyKey}@${epoch}`;
	const mounted = useRef("");
	const themeMounted = useRef<Theme | undefined>(undefined);

	useEffect(() => {
		return () => gate.dispose();
	}, [gate]);

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
			const viewport = logical?.kind === "viewport";
			const size = previewSize(logical);
			const logicalWidth = size?.width;
			const logicalHeight = size?.height;
			const background = typeOf(logical?.background) === "Color3" ? (logical?.background as Color3) : undefined;
			const scaled = logicalWidth !== undefined && logicalHeight !== undefined;
			const scale = scaled
				? previewScale(fit ? "fit" : "actual", logicalWidth, logicalHeight, dock.x, dock.y) * zoom
				: 1;
			setTemplate(
				<frame
					key={`mount-${epoch}`}
					Size={scaled ? new UDim2(0, logicalWidth, 0, logicalHeight) : new UDim2(1, 0, 1, 0)}
					BackgroundColor3={background ?? new Color3(0, 0, 0)}
					BackgroundTransparency={background !== undefined ? 0 : 1}
				>
					{scaled && <uiscale key="Scale" Scale={scale} />}
					{scaled && <uistroke key="Bounds" Thickness={1} Color={GRID_COLOR} Transparency={0.45} />}
					{scaled && grid && gridLines(logicalWidth, logicalHeight)}
					<uipadding
						key="Inset"
						PaddingTop={new UDim(0, inset)}
						PaddingBottom={new UDim(0, inset)}
						PaddingLeft={new UDim(0, inset)}
						PaddingRight={new UDim(0, inset)}
					/>
					{viewport ? (
						<HostScene yaw={yaw}>{parsed.element as React.Element}</HostScene>
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

	return (
		<frame key="Template" {...root}>
			<frame key="Container" {...container}>
				<uicorner key="Corner" {...corner} />
				<Shadow />

				<frame key="NavBar" {...navBar}>
					<textlabel key="Title" Text={story?.title ?? "Canvas"} {...title} />
					{onToggleTheme && (
						<>
							<IconButton
								id="Remount"
								icon={REMOUNT_ICON}
								tint={theme.options.constants.colors.textMuted}
								onClick={() => setEpoch((current) => current + 1)}
								className={
									{
										Size: new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5)),
										AnchorPoint: new Vector2(1, 0.5),
										Position: new UDim2(1, -theme.spacing.calc(2.5), 0.5, 0),
									} as WriteableStyle<ImageButton>
								}
							/>
							{((story as { preview?: { kind?: unknown } } | undefined)?.preview?.kind === "viewport") && (
								<>
									<textbutton
										key="Orbit"
										Text="Orbit"
										Size={new UDim2(0, theme.spacing.calc(3), 0, theme.spacing.calc(1.5))}
										AnchorPoint={new Vector2(1, 0.5)}
										Position={new UDim2(1, -theme.spacing.calc(30), 0.5, 0)}
										BackgroundTransparency={1}
										Font={theme.typography.fontFamilies.semibold}
										TextSize={theme.typography.fontSizes.caption}
										TextColor3={theme.palette.secondary.main}
										Event={{ MouseButton1Click: () => setYaw((current) => current + ORBIT_STEP) }}
									/>
									<textbutton
										key="CameraReset"
										Text="Cam reset"
										Size={new UDim2(0, theme.spacing.calc(4.5), 0, theme.spacing.calc(1.5))}
										AnchorPoint={new Vector2(1, 0.5)}
										Position={new UDim2(1, -theme.spacing.calc(25), 0.5, 0)}
										BackgroundTransparency={1}
										Font={theme.typography.fontFamilies.semibold}
										TextSize={theme.typography.fontSizes.caption}
										TextColor3={theme.palette.secondary.main}
										Event={{ MouseButton1Click: () => setYaw(0) }}
									/>
								</>
							)}
							{onToggleStoryTheme && (
								<textbutton
									key="StoryTheme"
									Text={storyOnPrimary === false ? "Story light" : "Story dark"}
									Size={new UDim2(0, theme.spacing.calc(5), 0, theme.spacing.calc(1.5))}
									AnchorPoint={new Vector2(1, 0.5)}
									Position={new UDim2(1, -theme.spacing.calc(21), 0.5, 0)}
									BackgroundTransparency={1}
									Font={theme.typography.fontFamilies.semibold}
									TextSize={theme.typography.fontSizes.caption}
									TextColor3={theme.palette.secondary.main}
									Event={{ MouseButton1Click: onToggleStoryTheme }}
								/>
							)}
							<textbutton
								key="ZoomOut"
								Text="-"
								Size={new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5))}
								AnchorPoint={new Vector2(1, 0.5)}
								Position={new UDim2(1, -theme.spacing.calc(16), 0.5, 0)}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
								Event={{ MouseButton1Click: () => setZoom((current) => stepZoom(current, -1)) }}
							/>
							<textlabel
								key="Zoom"
								Text={`${math.floor(zoom * 100)}%`}
								Size={new UDim2(0, theme.spacing.calc(2.5), 0, theme.spacing.calc(1.5))}
								AnchorPoint={new Vector2(1, 0.5)}
								Position={new UDim2(1, -theme.spacing.calc(13.5), 0.5, 0)}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
							/>
							<textbutton
								key="ZoomIn"
								Text="+"
								Size={new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5))}
								AnchorPoint={new Vector2(1, 0.5)}
								Position={new UDim2(1, -theme.spacing.calc(12), 0.5, 0)}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
								Event={{ MouseButton1Click: () => setZoom((current) => stepZoom(current, 1)) }}
							/>
							<textbutton
								key="Grid"
								Text={grid ? "Grid on" : "Grid"}
								Size={new UDim2(0, theme.spacing.calc(3.5), 0, theme.spacing.calc(1.5))}
								AnchorPoint={new Vector2(1, 0.5)}
								Position={new UDim2(1, -theme.spacing.calc(8), 0.5, 0)}
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
								Size={new UDim2(0, theme.spacing.calc(3), 0, theme.spacing.calc(1.5))}
								AnchorPoint={new Vector2(1, 0.5)}
								Position={new UDim2(1, -theme.spacing.calc(4.5), 0.5, 0)}
								BackgroundTransparency={1}
								Font={theme.typography.fontFamilies.semibold}
								TextSize={theme.typography.fontSizes.caption}
								TextColor3={theme.palette.secondary.main}
								Event={{ MouseButton1Click: () => setFit((current) => !current) }}
							/>
							<IconButton
								id="Theme"
								icon={primaryThemeEnabled ? Icons.DarkTheme : Icons.LightTheme}
								tint={theme.options.constants.colors.textMuted}
								onClick={onToggleTheme}
								className={
									{
										Size: new UDim2(0, theme.spacing.calc(1.5), 0, theme.spacing.calc(1.5)),
										AnchorPoint: new Vector2(1, 0.5),
										Position: new UDim2(1, -theme.spacing.calc(0.5), 0.5, 0),
									} as WriteableStyle<ImageButton>
								}
							/>
						</>
					)}
				</frame>

				<frame
					key="Preview"
					{...preview}
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
						min={CONTROLS_MIN}
						onChange={setSplit}
						first={<Canvas className={canvas}>{template}</Canvas>}
						second={
							<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
								<uipadding
									key="ControlsInset"
									PaddingTop={new UDim(0, theme.padding.calc(2))}
									PaddingLeft={new UDim(0, theme.padding.calc(2))}
									PaddingRight={new UDim(0, theme.padding.calc(2))}
								/>
								<Controls
									theme={theme}
									args={args}
									argTypes={(story as { argTypes?: unknown } | undefined)?.argTypes}
									onChange={(key, value) => setArgs((current) => applyArg(current, key, value))}
									onReset={() => {
										const described = story as { args?: unknown; props?: unknown } | undefined;
										setArgs(copyArgs(described?.args ?? described?.props));
									}}
								/>
							</frame>
						}
					/>
				</frame>
			</frame>
		</frame>
	);
}

export default Template;
