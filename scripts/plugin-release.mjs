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

execSync("pnpm build", { stdio: "inherit", cwd: root });

const artifact = join(root, "dist/storyblox.rbxm");
const project = join(root, "plugin/.release.generated.project.json");
const tmp = mkdtempSync(join(tmpdir(), "storyblox-release-"));
const checkModel = join(tmp, "release.rbxlx");
mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(project, JSON.stringify(release));

try {
	execSync(`rojo build ${JSON.stringify(project)} -o ${JSON.stringify(artifact)}`, { stdio: "inherit" });
	execSync(`rojo build ${JSON.stringify(project)} -o ${JSON.stringify(checkModel)}`, { stdio: "inherit" });

	const xml = readFileSync(checkModel, "utf8");
	const names = [...xml.matchAll(/<string name="Name">([^<]*)<\/string>/g)].map(([, name]) => name);
	const storyModules = names.filter((name) => name.endsWith(".stories") || name.endsWith(".story"));
	if (storyModules.length > 0) throw new Error(`release bundles stories: ${storyModules.join(", ")}`);

	const devTitles = [...xml.matchAll(/title = "((?:Scenarios|Dev|Fixture|Shell|Docs)\/[^"]*)"/g)].map(([, title]) => title);
	if (devTitles.length > 0) throw new Error(`release bundles dev story titles: ${devTitles.join(", ")}`);

	for (const needle of ["storyblox-viewport", "collectLayoutStats", "Storyblox (dev)", "StorybloxDev"]) {
		if (xml.includes(needle)) throw new Error(`release bundles dev harness: ${needle}`);
	}
	if (!xml.includes("extraRoots")) throw new Error("release missing plugin host");

	console.log(`plugin release ok: dist/storyblox.rbxm`);
} finally {
	rmSync(project, { force: true });
	rmSync(tmp, { recursive: true, force: true });
}
