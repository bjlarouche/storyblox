import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { HttpService, StarterGui, Workspace } from "@rbxts/services";
import { DarkTheme, LightTheme, ThemeProvider } from "@rbxts/uiblox";
import { Story } from "interfaces";
import { mergeGlobals } from "packages/storyGlobals";
import { canvasLayout } from "packages/storyParameters";
import { normalizeExport, storyModuleSuffix } from "packages/ui/storyblox/normalizeStory";
import { storyFromExport } from "packages/ui/storyblox/storyAdapter";
import { readTemplateResult } from "packages/ui/template/cleanupGate";
import { applyArg, copyArgs } from "packages/ui/template/storyArgs";
import { collectLayoutStats } from "./layoutStats";

const GUI_NAME = "StorybloxViewport";
const SUFFIX = ".stories";
const DARK_BG = Color3.fromRGB(24, 24, 28);
const LIGHT_BG = Color3.fromRGB(245, 245, 247);

interface CatalogEntry {
	title: string;
	module: ModuleScript;
	suffix: string;
}

function loadedHost(): Instance | undefined {
	let current: Instance | undefined = script;
	while (current !== undefined) {
		if (current.Name === "StorybloxPlugin_loaded") return current;
		current = current.Parent;
	}
	return undefined;
}

function catalogRoots(marker: Instance): Instance[] {
	const host = loadedHost();
	if (host === undefined) return [marker];
	const roots = new Array<Instance>();
	const compiled = script.Parent?.FindFirstChild("stories");
	if (compiled !== undefined) roots.push(compiled);
	const native = host.FindFirstChild("stories");
	if (native !== undefined && !roots.includes(native)) roots.push(native);
	return roots.size() > 0 ? roots : [marker];
}

function loadStoryModule(moduleScript: ModuleScript): unknown {
	const runtime = (_G as never as Record<string, { import: (context: Instance, module: ModuleScript) => unknown }>)[
		script as never as string
	];
	return runtime.import(script, moduleScript);
}

function wantsFit(raw: unknown) {
	return raw === true || raw === 1 || raw === "1" || raw === "fit";
}

function applyFit(storiesRoot: Instance, host: Frame) {
	const story = host.FindFirstChild("Story");
	if (story === undefined || !story.IsA("GuiObject")) return;
	const existing = story.FindFirstChild("Fit");
	if (!wantsFit(storiesRoot.GetAttribute("storyblox-viewport-fit"))) {
		if (existing !== undefined && existing.IsA("UIScale")) existing.Destroy();
		return;
	}
	const content = story.FindFirstChildWhichIsA("GuiObject");
	const width = content?.Size.X.Offset ?? 0;
	const height = content?.Size.Y.Offset ?? 0;
	if (content === undefined || width <= 0 || height <= 0 || host.AbsoluteSize.X <= 0 || host.AbsoluteSize.Y <= 0) return;
	let scale = existing;
	if (scale === undefined || !scale.IsA("UIScale")) {
		scale = new Instance("UIScale");
		scale.Name = "Fit";
		scale.Parent = story;
	}
	(scale as UIScale).Scale = math.min(host.AbsoluteSize.X / width, host.AbsoluteSize.Y / height, 1);
}

function parseSize(raw: unknown): Vector2 | undefined {
	if (typeOf(raw) !== "string") return undefined;
	const text = raw as string;
	const [wText, hText] = text.split("x");
	const width = tonumber(wText);
	const height = tonumber(hText);
	if (width === undefined || height === undefined || width <= 0 || height <= 0) return undefined;
	return new Vector2(width, height);
}

function parseColor(raw: unknown): Color3 | undefined {
	if (typeOf(raw) !== "string") return undefined;
	const parts = (raw as string).split(",");
	if (parts.size() !== 3) return undefined;
	const r = tonumber(parts[0]);
	const g = tonumber(parts[1]);
	const b = tonumber(parts[2]);
	if (r === undefined || g === undefined || b === undefined) return undefined;
	return Color3.fromRGB(r, g, b);
}

function parseArgs(raw: unknown): { [key: string]: unknown } | undefined {
	if (typeOf(raw) !== "string" || (raw as string).size() === 0) return undefined;
	const [ok, decoded] = pcall(() => HttpService.JSONDecode(raw as string));
	if (!ok || typeOf(decoded) !== "table") return undefined;
	return decoded as { [key: string]: unknown };
}

function buildCatalog(roots: Instance[]): CatalogEntry[] {
	const entries = new Array<CatalogEntry>();
	const seen: { [title: string]: boolean } = {};
	for (const root of roots) {
		for (const descendant of root.GetDescendants()) {
			if (!descendant.IsA("ModuleScript")) continue;
			const suffix = storyModuleSuffix(descendant.Name, SUFFIX);
			if (suffix === undefined) continue;
			const [ok, mod] = pcall(() => loadStoryModule(descendant));
			if (!ok) continue;
			const story = storyFromExport(normalizeExport(mod, descendant.Name, suffix));
			if (story === undefined) continue;
			if (seen[story.title]) continue;
			seen[story.title] = true;
			entries.push({ title: story.title, module: descendant, suffix });
		}
	}
	entries.sort((a, b) => a.title < b.title);
	return entries;
}

function ensureGui(): ScreenGui {
	const existing = StarterGui.FindFirstChild(GUI_NAME);
	if (existing && existing.IsA("ScreenGui")) return existing;
	existing?.Destroy();
	const gui = new Instance("ScreenGui");
	gui.Name = GUI_NAME;
	gui.ResetOnSpawn = false;
	gui.IgnoreGuiInset = true;
	gui.DisplayOrder = 100000;
	gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
	gui.Parent = StarterGui;
	return gui;
}

function destroyGui() {
	StarterGui.FindFirstChild(GUI_NAME)?.Destroy();
}

function resolveStory(entry: CatalogEntry): Story | undefined {
	const [ok, mod] = pcall(() => loadStoryModule(entry.module));
	if (!ok) return undefined;
	return storyFromExport(normalizeExport(mod, entry.module.Name, entry.suffix), { workspaceAllowed: () => true });
}

export = function (storiesRoot: Instance) {
	let generation = 0;
	let reactRoot: ReactRoblox.Root | undefined;
	let host: Frame | undefined;
	let templateCleanup: (() => void) | undefined;
	const roots = catalogRoots(storiesRoot);
	let catalog = buildCatalog(roots);
	storiesRoot.SetAttribute(
		"storyblox-viewport-stories",
		HttpService.JSONEncode(catalog.map((entry) => entry.title)),
	);

	const unmountRoot = (root: ReactRoblox.Root) => {
		const [flushed] = pcall(() => {
			ReactRoblox.act(() => root.unmount());
		});
		if (!flushed) pcall(() => root.unmount());
	};

	const releaseStory = () => {
		templateCleanup?.();
		templateCleanup = undefined;
	};

	const ensureHost = (bg: Color3, size: Vector2 | undefined) => {
		const gui = ensureGui();
		if (host !== undefined && host.Parent !== gui) {
			pcall(() => {
				host!.Parent = gui;
			});
		}
		if (host === undefined || host.Parent !== gui) {
			const frame = new Instance("Frame");
			frame.Name = "Host";
			frame.BorderSizePixel = 0;
			frame.Parent = gui;
			host = frame;
		}
		host.BackgroundColor3 = bg;
		if (size !== undefined) {
			host.Size = new UDim2(0, size.X, 0, size.Y);
			host.Position = new UDim2(0.5, -size.X / 2, 0.5, -size.Y / 2);
		} else {
			host.Size = new UDim2(1, 0, 1, 0);
			host.Position = new UDim2(0, 0, 0, 0);
		}
		return host;
	};

	const mountTitle = (title: string, themeName: "light" | "dark", argsPatch?: { [key: string]: unknown }) => {
		generation += 1;
		const token = generation;
		storiesRoot.SetAttribute("storyblox-viewport-ready", undefined);
		storiesRoot.SetAttribute("storyblox-viewport-error", undefined);
		storiesRoot.SetAttribute("storyblox-viewport-stats", undefined);
		releaseStory();

		let entry: CatalogEntry | undefined;
		for (const item of catalog) {
			if (item.title === title) entry = item;
		}
		if (entry === undefined) {
			storiesRoot.SetAttribute("storyblox-viewport-error", `unknown story: ${title}`);
			return;
		}

		const story = resolveStory(entry);
		if (story === undefined) {
			storiesRoot.SetAttribute("storyblox-viewport-error", `rejected story: ${title}`);
			return;
		}

		const theme = themeName === "light" ? LightTheme : DarkTheme;
		const described = story as { args?: unknown; props?: unknown };
		let args = copyArgs(described.args ?? described.props);
		if (argsPatch !== undefined) {
			for (const [key, value] of pairs(argsPatch)) args = applyArg(args, key as string, value);
		}

		const [ok, rendered] = pcall(() => {
			const [element, cleanup] = (
				story.template as (
					props: unknown,
					context: { theme: unknown; globals: unknown; parameters: unknown },
				) => LuaTuple<[unknown, unknown]>
			)(args, {
				theme,
				globals: mergeGlobals(story.globals, {}, themeName, "compact"),
				parameters: story.parameters,
			});
			return readTemplateResult(element, cleanup);
		});
		if (!ok) {
			storiesRoot.SetAttribute("storyblox-viewport-error", `${rendered}`);
			return;
		}

		const parsed = rendered as { element: unknown; cleanup?: () => void };
		templateCleanup = parsed.cleanup;
		const size = parseSize(storiesRoot.GetAttribute("storyblox-viewport-size"));
		const bg =
			parseColor(storiesRoot.GetAttribute("storyblox-viewport-bg")) ??
			(themeName === "light" ? LIGHT_BG : DARK_BG);
		const mounted = ensureHost(bg, size);
		if (reactRoot === undefined) reactRoot = ReactRoblox.createRoot(mounted);
		let painted = false;
		const paintConn = mounted.DescendantAdded.Connect(() => {
			painted = true;
		});
		reactRoot.render(
			<ThemeProvider theme={theme}>
				<frame key="Story" Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
					{canvasLayout(story.parameters) === "centered" ? (
						<uilistlayout
							key="Center"
							FillDirection={Enum.FillDirection.Vertical}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>
					) : undefined}
					{parsed.element as React.Element}
				</frame>
			</ThemeProvider>,
		);

		let settleAttempts = 0;
		const settle = () => {
			if (token !== generation) {
				paintConn.Disconnect();
				return;
			}
			const camera = Workspace.CurrentCamera;
			const viewport = camera?.ViewportSize ?? new Vector2(0, 0);
			if (mounted.AbsoluteSize.X <= 0 || mounted.AbsoluteSize.Y <= 0) {
				task.delay(0.05, settle);
				return;
			}
			// ReactRoblox render is async; host size is ready before children exist.
			settleAttempts += 1;
			if ((!painted || mounted.FindFirstChildWhichIsA("GuiObject", true) === undefined) && settleAttempts < 40) {
				task.delay(0.05, settle);
				return;
			}
			paintConn.Disconnect();
			applyFit(storiesRoot, mounted);
			const stats = collectLayoutStats(mounted, viewport);
			storiesRoot.SetAttribute("storyblox-viewport-stats", HttpService.JSONEncode(stats));
			storiesRoot.SetAttribute("storyblox-viewport-ready", `${title}@${token}`);
		};
		task.defer(settle);
	};

	const remount = () => {
		const title = storiesRoot.GetAttribute("storyblox-viewport");
		if (title === undefined || title === "") {
			generation += 1;
			releaseStory();
			if (reactRoot !== undefined) reactRoot.render(undefined as never);
			storiesRoot.SetAttribute("storyblox-viewport-ready", undefined);
			storiesRoot.SetAttribute("storyblox-viewport-error", undefined);
			storiesRoot.SetAttribute("storyblox-viewport-stats", undefined);
			return;
		}
		if (typeOf(title) !== "string") return;
		const themeAttr = storiesRoot.GetAttribute("storyblox-viewport-theme");
		const themeName: "light" | "dark" = themeAttr === "light" ? "light" : "dark";
		mountTitle(title as string, themeName, parseArgs(storiesRoot.GetAttribute("storyblox-viewport-args")));
	};

	const runScan = () => {
		const scan = storiesRoot.GetAttribute("storyblox-viewport-scan");
		if (scan === undefined || scan === "" || scan === 0 || scan === false) return;
		catalog = buildCatalog(roots);
		storiesRoot.SetAttribute(
			"storyblox-viewport-stories",
			HttpService.JSONEncode(catalog.map((entry) => entry.title)),
		);
		const report: Array<{
			storyId: string;
			theme: string;
			ok: boolean;
			error?: string;
			stats?: unknown;
		}> = [];
		task.spawn(() => {
			for (const entry of catalog) {
				for (const themeName of ["dark", "light"] as const) {
					storiesRoot.SetAttribute("storyblox-viewport-theme", themeName);
					storiesRoot.SetAttribute("storyblox-viewport", entry.title);
					const deadline = os.clock() + 5;
					while (os.clock() < deadline) {
						const ready = storiesRoot.GetAttribute("storyblox-viewport-ready");
						const err = storiesRoot.GetAttribute("storyblox-viewport-error");
						if (typeOf(err) === "string" && (err as string).size() > 0) {
							report.push({ storyId: entry.title, theme: themeName, ok: false, error: err as string });
							break;
						}
						if (typeOf(ready) === "string" && (ready as string).sub(1, entry.title.size()) === entry.title) {
							const raw = storiesRoot.GetAttribute("storyblox-viewport-stats");
							const [ok, stats] = pcall(() =>
								typeOf(raw) === "string" ? HttpService.JSONDecode(raw as string) : undefined,
							);
							report.push({
								storyId: entry.title,
								theme: themeName,
								ok: true,
								stats: ok ? stats : undefined,
							});
							break;
						}
						task.wait(0.05);
					}
					if (report.size() === 0 || report[report.size() - 1].storyId !== entry.title || report[report.size() - 1].theme !== themeName) {
						report.push({ storyId: entry.title, theme: themeName, ok: false, error: "timeout" });
					}
				}
			}
			storiesRoot.SetAttribute("storyblox-viewport", "");
			storiesRoot.SetAttribute("storyblox-viewport-report", HttpService.JSONEncode(report));
		});
	};

	const conns = [
		storiesRoot.GetAttributeChangedSignal("storyblox-viewport").Connect(remount),
		storiesRoot.GetAttributeChangedSignal("storyblox-viewport-theme").Connect(remount),
		storiesRoot.GetAttributeChangedSignal("storyblox-viewport-args").Connect(remount),
		storiesRoot.GetAttributeChangedSignal("storyblox-viewport-size").Connect(remount),
		storiesRoot.GetAttributeChangedSignal("storyblox-viewport-fit").Connect(remount),
		storiesRoot.GetAttributeChangedSignal("storyblox-viewport-bg").Connect(remount),
		storiesRoot.GetAttributeChangedSignal("storyblox-viewport-scan").Connect(runScan),
		...roots.map((root) =>
			root.DescendantAdded.Connect((inst) => {
				if (!inst.IsA("ModuleScript")) return;
				catalog = buildCatalog(roots);
				storiesRoot.SetAttribute(
					"storyblox-viewport-stories",
					HttpService.JSONEncode(catalog.map((entry) => entry.title)),
				);
			}),
		),
	];

	remount();

	return () => {
		generation += 1;
		for (const conn of conns) conn.Disconnect();
		releaseStory();
		if (reactRoot !== undefined) {
			unmountRoot(reactRoot);
			reactRoot = undefined;
		}
		host = undefined;
		destroyGui();
		storiesRoot.SetAttribute("storyblox-viewport-ready", undefined);
		storiesRoot.SetAttribute("storyblox-viewport-error", undefined);
		storiesRoot.SetAttribute("storyblox-viewport-stats", undefined);
		storiesRoot.SetAttribute("storyblox-viewport-stories", undefined);
		storiesRoot.SetAttribute("storyblox-viewport-report", undefined);
	};
};
