import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const dev = JSON.parse(readFileSync(join(root, "plugin/plugin.project.json"), "utf8"));
const stories = dev.tree.ServerStorage.StorybloxPlugin.stories;
const storyJson = JSON.stringify(stories);
if (!storyJson.includes("fixtures/stories") || !storyJson.includes("fixtures/native") || !storyJson.includes("fixtures/viewport")) {
	throw new Error("dev plugin project is missing fixture stories");
}
if (!existsSync(join(root, "out/fixtures/automation/init.luau"))) {
	throw new Error("dev build missing out/fixtures/automation (viewport harness)");
}
if (!readFileSync(join(root, "plugin/host/init.luau"), "utf8").includes("fixtures")) {
	throw new Error("plugin host does not wire viewport harness from storyblox fixtures");
}

const release = JSON.parse(JSON.stringify(dev));
release.name = "storyblox-release";
release.globIgnorePaths = ["**/fixtures/**"];
release.tree.ServerStorage.StorybloxPlugin.stories = { $className: "Folder" };
if (JSON.stringify(release).includes("fixtures/stories")) {
	throw new Error("release project still mounts fixture stories");
}

const dir = mkdtempSync(join(tmpdir(), "storyblox-plugin-"));
const pluginDir = join(root, "plugin");
const devProject = join(pluginDir, ".fixtures-dev.project.json");
const releaseProject = join(pluginDir, ".fixtures-release.project.json");
const harnessDevProject = join(pluginDir, ".fixtures-harness-dev.project.json");
const harnessReleaseProject = join(pluginDir, ".fixtures-harness-release.project.json");
const devModel = join(dir, "dev.rbxlx");
const releaseModel = join(dir, "release.rbxlx");
const harnessDevModel = join(dir, "harness-dev.rbxlx");
const harnessReleaseModel = join(dir, "harness-release.rbxlx");
const needles = [
	"Basics/React Label",
	"Basics/Native Label",
	"Examples/Button (Native)",
	"ControlledButton",
	"native fixture",
	"Rotating Part (React)",
	"Examples/Styled Labels",
	"Examples/Button",
	"Components/RadioGroup",
	"Components/Select",
	"Components/Tabs",
	"Components/SplitPane",
	"Components/Tooltip",
	"Components/Button",
	"Components/Button Loading",
	"Feedback/Skeleton",
	"Feedback/Progress",
	"Components/Checkbox",
	"Components/Switch",
	"Components/Slider",
	"Components/Input",
	"Basics/Typed Story",
	"Layout/Controls",
	"Layout/Data Types",
	"Layout/Nested Args",
	"3D/Camera",
	"3D/Scene",
	"SceneOverlay",
	"Examples/Mount Adapter",
	"3D/Workspace",
	"Examples/EditableImage Reel",
	"Examples/EditableImage Reel (Native)",
	"EditableImageReel",
	"ReelFrame",
	"Animation/Bouncing Ball",
	"Animation/Bouncing Ball (Native)",
	"BounceBall",
	"hostColor",
	"defined story",
	"Dev/Crash Control",
	"Dev/Crash Story",
	"intentional control crash",
	"intentional story crash",
];

try {
	writeFileSync(
		devProject,
		JSON.stringify({
			name: "storyblox-dev-stories",
			tree: { $className: "Folder", stories },
		}),
	);
	writeFileSync(
		releaseProject,
		JSON.stringify({
			name: "storyblox-release-stories",
			globIgnorePaths: release.globIgnorePaths,
			tree: {
				$className: "Folder",
				storyblox: { $path: "../out" },
				stories: { $className: "Folder" },
			},
		}),
	);
	writeFileSync(
		harnessDevProject,
		JSON.stringify({
			name: "storyblox-dev-harness",
			tree: {
				$className: "Folder",
				storyblox: { $path: "../out" },
			},
		}),
	);
	writeFileSync(
		harnessReleaseProject,
		JSON.stringify({
			name: "storyblox-release-harness",
			globIgnorePaths: ["**/fixtures/**"],
			tree: {
				$className: "Folder",
				storyblox: { $path: "../out" },
			},
		}),
	);
	execSync(`rojo build ${JSON.stringify(devProject)} -o ${JSON.stringify(devModel)}`, { stdio: "inherit" });
	execSync(`rojo build ${JSON.stringify(releaseProject)} -o ${JSON.stringify(releaseModel)}`, { stdio: "inherit" });
	execSync(`rojo build ${JSON.stringify(harnessDevProject)} -o ${JSON.stringify(harnessDevModel)}`, { stdio: "inherit" });
	execSync(`rojo build ${JSON.stringify(harnessReleaseProject)} -o ${JSON.stringify(harnessReleaseModel)}`, {
		stdio: "inherit",
	});
	const devXml = readFileSync(devModel, "utf8");
	const releaseXml = readFileSync(releaseModel, "utf8");
	const harnessDevXml = readFileSync(harnessDevModel, "utf8");
	const harnessReleaseXml = readFileSync(harnessReleaseModel, "utf8");
	for (const needle of needles) {
		if (!devXml.includes(needle)) throw new Error(`dev plugin build missing ${needle}`);
		if (releaseXml.includes(needle)) throw new Error(`release plugin build includes ${needle}`);
	}
	if (!harnessDevXml.includes("storyblox-viewport")) throw new Error("dev out missing viewport harness");
	if (harnessReleaseXml.includes("storyblox-viewport")) throw new Error("release out still includes viewport harness");
	if (harnessReleaseXml.includes("layoutStats") || harnessReleaseXml.includes("collectLayoutStats")) {
		throw new Error("release out still includes viewport harness modules");
	}
	console.log("plugin fixtures ok");
} finally {
	rmSync(devProject, { force: true });
	rmSync(releaseProject, { force: true });
	rmSync(harnessDevProject, { force: true });
	rmSync(harnessReleaseProject, { force: true });
	rmSync(dir, { recursive: true, force: true });
}
