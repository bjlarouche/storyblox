import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const root = process.cwd();
const release = JSON.parse(readFileSync(join(root, "plugin/release.project.json"), "utf8"));
const stories = release.tree.StorybloxPlugin.stories;
if (!release.globIgnorePaths?.includes("**/fixtures/**")) {
	throw new Error("release.project.json must ignore **/fixtures/**");
}
if (Object.keys(stories).some((key) => key !== "$className")) {
	throw new Error("release.project.json must ship an empty stories folder");
}

const pnpm = join(root, "node_modules/.pnpm");
function resolveRbxts(name) {
	const entry = readdirSync(pnpm)
		.filter((dir) => dir.startsWith(`@rbxts+${name}@`))
		.find((dir) => existsSync(join(pnpm, dir, "node_modules/@rbxts", name, "package.json")));
	if (!entry) throw new Error(`could not resolve @rbxts/${name}`);
	return relative(join(root, "plugin"), join(pnpm, entry, "node_modules/@rbxts", name));
}

const rbxts = release.tree.StorybloxPlugin.node_modules["@rbxts"];
for (const name of Object.keys(rbxts)) {
	if (name === "$className" || name === "storyblox") continue;
	rbxts[name] = { $path: resolveRbxts(name === "ReactLua" ? "react-vendor" : name) };
}

const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
if (typeof version !== "string" || version === "") throw new Error("package.json missing version");

const devProject = readFileSync(join(root, "plugin/plugin.project.json"), "utf8");
if (devProject.includes("StorybloxRelease")) throw new Error("dev place project must not mount StorybloxRelease");
const shell = readFileSync(join(root, "plugin/shell/init.server.luau"), "utf8");
if (shell.includes("StorybloxRelease") || !shell.includes('ss:FindFirstChild("StorybloxPlugin")')) {
	throw new Error("dev shell must load ServerStorage.StorybloxPlugin only");
}

// Same tree as the store model. Plugin so a copy under ReplicatedStorage does not run on play.
const placeTree = {
	...release.tree,
	$attributes: { Version: version },
	$properties: { RunContext: "Plugin" },
};
const placeProject = { ...release, name: "StorybloxRelease", tree: placeTree };
const checkProject = {
	name: "storyblox-release-check",
	globIgnorePaths: release.globIgnorePaths,
	tree: {
		$className: "DataModel",
		ReplicatedStorage: {
			$className: "ReplicatedStorage",
			StorybloxRelease: placeTree,
		},
	},
};

execSync("pnpm build", { stdio: "inherit", cwd: root });

const artifact = join(root, "dist/storyblox.rbxm");
const placeArtifact = join(root, "dist/StorybloxRelease.rbxm");
const project = join(root, "plugin/.release.generated.project.json");
const tmp = mkdtempSync(join(tmpdir(), "storyblox-release-"));
const checkModel = join(tmp, "release.rbxlx");
mkdirSync(join(root, "dist"), { recursive: true });

try {
	writeFileSync(project, JSON.stringify(release));
	execSync(`rojo build ${JSON.stringify(project)} -o ${JSON.stringify(artifact)}`, { stdio: "inherit" });
	writeFileSync(project, JSON.stringify(placeProject));
	execSync(`rojo build ${JSON.stringify(project)} -o ${JSON.stringify(placeArtifact)}`, { stdio: "inherit" });
	writeFileSync(project, JSON.stringify(checkProject));
	execSync(`rojo build ${JSON.stringify(project)} -o ${JSON.stringify(checkModel)}`, { stdio: "inherit" });

	const xml = readFileSync(checkModel, "utf8");
	if (!xml.includes("<Item")) throw new Error("release check model was empty");
	const names = [...xml.matchAll(/<string name="Name">([^<]*)<\/string>/g)].map(([, name]) => name);
	if (!names.includes("StorybloxRelease")) throw new Error("release copy missing StorybloxRelease");
	const blobs = [...xml.matchAll(/<BinaryString name="AttributesSerialize">([^<]*)<\/BinaryString>/g)].map(([, b64]) =>
		Buffer.from(b64.replace(/\s/g, ""), "base64").toString("utf8"),
	);
	if (!blobs.some((blob) => blob.includes(version))) throw new Error(`release copy missing Version ${version}`);
	if (!xml.includes('<token name="RunContext">3</token>')) {
		throw new Error("release copy must be RunContext Plugin");
	}
	const placeBytes = readFileSync(placeArtifact).toString("latin1");
	if (!placeBytes.includes("StorybloxRelease") || !placeBytes.includes(version)) {
		throw new Error("dist/StorybloxRelease.rbxm missing name or version");
	}
	const storyModules = names.filter((name) => name.endsWith(".stories") || name.endsWith(".story"));
	if (storyModules.length > 0) throw new Error(`release bundles stories: ${storyModules.join(", ")}`);

	const devTitles = [...xml.matchAll(/title = "((?:Scenarios|Dev|Fixture|Shell|Docs)\/[^"]*)"/g)].map(([, title]) => title);
	if (devTitles.length > 0) throw new Error(`release bundles dev story titles: ${devTitles.join(", ")}`);

	for (const needle of ["storyblox-viewport", "collectLayoutStats", "Storyblox (dev)", "StorybloxDev"]) {
		if (xml.includes(needle)) throw new Error(`release bundles dev harness: ${needle}`);
	}
	if (!xml.includes("extraRoots")) throw new Error("release missing plugin host");

	console.log("plugin release ok: dist/storyblox.rbxm, dist/StorybloxRelease.rbxm");
} finally {
	rmSync(project, { force: true });
	rmSync(tmp, { recursive: true, force: true });
}
