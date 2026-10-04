import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Story } from "../../../../interfaces";
import { IconButton, Icons, Shadow, Theme, useTheme, WriteableStyle } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { Canvas } from "../../canvas";
import { StoryCallback, StoryElement } from "interfaces/Story";
import { createCleanupGate, readTemplateResult } from "../cleanupGate";
import { previewScale } from "../../../previewScale";
import { applyArg, ArgValues, copyArgs } from "../storyArgs";
import Controls from "./Controls";
import useTemplateStyles from "./Template.styles";

const REMOUNT_ICON = "rbxassetid://75431112013973" as Icons;
const CONTROLS_MIN = 120;

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
}

function Template({ story, primaryThemeEnabled, onToggleTheme }: TemplateProps) {
	const { root, container, corner, navBar, title, preview, canvas } = useTemplateStyles();
	const { theme } = useTheme();
	const [gate] = useState(createCleanupGate);
	const [template, setTemplate] = useState<React.Element | undefined>();
	const [failure, setFailure] = useState<unknown>();
	const [epoch, setEpoch] = useState(0);
	const [split, setSplit] = useState(10000);
	const [fit, setFit] = useState(true);
	const [dock, setDock] = useState({ x: 0, y: 0 });
	const storyKey = story?.title ?? "";
	const [argsStory, setArgsStory] = useState("");
	const [args, setArgs] = useState<ArgValues>({});
	if (storyKey !== argsStory) {
		setArgsStory(storyKey);
		const described = story as { args?: unknown; props?: unknown } | undefined;
		setArgs(copyArgs(described?.args ?? described?.props));
	}
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
		if (native && mounted.current === mountKey && themeMounted.current === theme && session?.update !== undefined) {
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
			const [element, callback] = render(props, { theme }) as LuaTuple<[StoryElement, StoryCallback | undefined]>;
			const parsed = readTemplateResult(element, callback);
			const inset = theme.padding.calc(2);
			const logical = (story as { preview?: { width?: unknown; height?: unknown } }).preview;
			const logicalWidth = typeOf(logical?.width) === "number" ? (logical?.width as number) : undefined;
			const logicalHeight = typeOf(logical?.height) === "number" ? (logical?.height as number) : undefined;
			const scaled = logicalWidth !== undefined && logicalHeight !== undefined;
			const scale = scaled ? previewScale(fit ? "fit" : "actual", logicalWidth, logicalHeight, dock.x, dock.y) : 1;
			setTemplate(
				<frame
					key={`mount-${epoch}`}
					Size={scaled ? new UDim2(0, logicalWidth, 0, logicalHeight) : new UDim2(1, 0, 1, 0)}
					BackgroundTransparency={1}
				>
					{scaled && <uiscale key="Scale" Scale={scale} />}
					<uipadding
						key="Inset"
						PaddingTop={new UDim(0, inset)}
						PaddingBottom={new UDim(0, inset)}
						PaddingLeft={new UDim(0, inset)}
						PaddingRight={new UDim(0, inset)}
					/>
					{parsed.element as React.Element}
				</frame>,
			);
			themeMounted.current = theme;
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
	}, [story, gate, theme, epoch, args, native, mountKey, fit, dock]);

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
