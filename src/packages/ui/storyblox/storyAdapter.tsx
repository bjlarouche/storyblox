import React from "@rbxts/react";
import { DarkTheme } from "@rbxts/uiblox";
import { Workspace } from "@rbxts/services";
import { Story } from "interfaces";
import { mountNative } from "./nativeMount";
import { NormalizedStory } from "./normalizeStory";

export interface StoryAdapterOptions {
	workspaceAllowed?: () => boolean;
}

export function storyFromExport(normalized: NormalizedStory, options?: StoryAdapterOptions): Story | undefined {
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
		tags: normalized.tags,
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
			if (kind === "workspace" && options?.workspaceAllowed?.() !== true) {
				target.Destroy();
				return [
					<textlabel
						key="WorkspaceNotice"
						Text={`Workspace preview is off. Run "Storyblox: Allow workspace preview" to mount this story into Workspace.`}
						Size={new UDim2(1, 0, 0, 48)}
						TextWrapped={true}
						BackgroundTransparency={1}
						TextColor3={DarkTheme.palette.status.warning.main}
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
			} catch (failure) {
				restore?.();
				pcall(() => target.Destroy());
				throw failure;
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
							TextColor3={DarkTheme.palette.status.warning.main}
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
