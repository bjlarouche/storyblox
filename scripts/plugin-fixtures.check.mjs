import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const dev = JSON.parse(readFileSync(join(root, "plugin/plugin.project.json"), "utf8"));
const stories = dev.tree.ServerStorage.StorybloxPlugin.stories;
const storyJson = JSON.stringify(stories);
if (!storyJson.includes("fixtures/stories") || !storyJson.includes("fixtures/native") || !storyJson.includes("fixtures/viewport")) {
	throw new Error("dev plugin project is missing fixture stories");
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
const devModel = join(dir, "dev.rbxlx");
const releaseModel = join(dir, "release.rbxlx");
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
	execSync(`rojo build ${JSON.stringify(devProject)} -o ${JSON.stringify(devModel)}`, { stdio: "inherit" });
	execSync(`rojo build ${JSON.stringify(releaseProject)} -o ${JSON.stringify(releaseModel)}`, { stdio: "inherit" });
	const devXml = readFileSync(devModel, "utf8");
	const releaseXml = readFileSync(releaseModel, "utf8");
	for (const needle of needles) {
		if (!devXml.includes(needle)) throw new Error(`dev plugin build missing ${needle}`);
		if (releaseXml.includes(needle)) throw new Error(`release plugin build includes ${needle}`);
	}
	console.log("plugin fixtures ok");
} finally {
	rmSync(devProject, { force: true });
	rmSync(releaseProject, { force: true });
	rmSync(dir, { recursive: true, force: true });
}
