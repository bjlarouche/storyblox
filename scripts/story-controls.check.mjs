import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pairs = (record) => Object.keys(record).map((key) => [key, record[key]]);

const { hasStoryControls, storyArgs, withStoryControls } = await import(
	"../src/packages/ui/template/storyControls.ts"
);

const described = {
	title: "Examples/EditableImage Reel",
	args: { fps: 4, frameCount: 3, paused: false, holdFrame: 0 },
	argTypes: {
		fps: { type: "number" },
		frameCount: { type: "number" },
		paused: { type: "boolean" },
		holdFrame: { type: "number" },
	},
	description: "reel",
};

if (!hasStoryControls(described)) throw new Error("args+argTypes should control");
if (!hasStoryControls({ args: { label: "x" } })) throw new Error("args-only should control");
if (!hasStoryControls({ argTypes: { label: { type: "string" } } })) throw new Error("argTypes-only should control");
if (hasStoryControls({ title: "Basics/React Label" })) throw new Error("empty should not control");
if (storyArgs(described) !== described.args) throw new Error("story args");
if (storyArgs({ props: { a: 1 } }).a !== 1) throw new Error("props fallback");

const shell = withStoryControls(described, {
	component: () => "error",
	template: () => "error",
});
if (shell.title !== described.title) throw new Error("shell title");
if (shell.args !== described.args || shell.props !== described.args) throw new Error("shell args");
if (shell.argTypes !== described.argTypes) throw new Error("shell argTypes");
if (shell.description !== "reel") throw new Error("shell description");
if (shell.template() !== "error") throw new Error("shell patch");
if (!hasStoryControls(shell)) throw new Error("error shell must keep controls");

const bare = withStoryControls(undefined, { template: () => "error" });
if (bare.title !== "Error/Rendering" || hasStoryControls(bare)) throw new Error("empty shell");

const root = process.cwd();
const storyDirs = [join(root, "src/fixtures/stories"), join(root, "fixtures")];
const missing = [];

for (const dir of storyDirs) {
	const files = [];
	const walk = (path) => {
		for (const entry of readdirSync(path, { withFileTypes: true })) {
			const next = join(path, entry.name);
			if (entry.isDirectory()) walk(next);
			else if (/\.(stories\.tsx|stories\.ts|init\.luau)$/.test(entry.name) || entry.name.endsWith(".stories.tsx")) {
				files.push(next);
			}
		}
	};
	walk(dir);
	for (const file of files) {
		const text = readFileSync(file, "utf8");
		const hasArgs = /^\s*args\s*[:=]/m.test(text);
		const hasTypes = /^\s*argTypes\s*[:=]/m.test(text);
		if (hasArgs !== hasTypes) missing.push(`${file.replace(`${root}/`, "")}: args=${hasArgs} argTypes=${hasTypes}`);
	}
}

if (missing.length > 0) {
	throw new Error(`stories with args/argTypes mismatch:\n${missing.join("\n")}`);
}

console.log("story controls ok");
