import { readFileSync } from "node:fs";
import { join } from "node:path";

Array.prototype.size = function size() {
	return this.length;
};
globalThis.typeOf = (value) => (typeof value === "function" ? "function" : typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pairs = (record) => Object.keys(record).map((key) => [key, record[key]]);
String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	const len = this.length;
	const from = start < 0 ? len + start : start - 1;
	const to = finish === undefined ? len : finish < 0 ? len + finish + 1 : finish;
	return this.slice(from, to);
};

const root = process.cwd();
const { normalizeExport, storyModuleSuffix } = await import("../src/packages/ui/storyblox/normalizeStory.ts");
const { mountNative } = await import("../src/packages/ui/storyblox/nativeMount.ts");

if (storyModuleSuffix("Button.stories") !== ".stories") throw new Error("stories suffix");
if (storyModuleSuffix("FunctionLabel.story") !== ".story") throw new Error("story suffix");
if (storyModuleSuffix("Button.stories") === ".story") throw new Error("stories matched story");
if (storyModuleSuffix("notes") !== undefined) throw new Error("plain module");

const fn = (target) => {
	target.mounted = true;
	return () => {
		target.cleaned = true;
	};
};
const loaded = normalizeExport(fn, "FunctionLabel.story", storyModuleSuffix("FunctionLabel.story"));
if (loaded.kind !== "native" || loaded.title !== "FunctionLabel/Native" || loaded.mount !== fn) {
	throw new Error("function story");
}
const rejected = normalizeExport(fn, "FunctionLabel.story", ".stories");
if (rejected.kind !== "reject") throw new Error("wrong suffix should reject");

const withArgs = normalizeExport(
	{
		fn,
		args: { label: "Hi" },
		controls: { label: { type: "string" } },
	},
	"FunctionLabel.story",
	".story",
);
if (withArgs.kind !== "native" || withArgs.title !== "FunctionLabel/Native" || withArgs.args.label !== "Hi" || withArgs.argTypes.label.type !== "string") {
	throw new Error("function table");
}
const named = normalizeExport({ fn, title: "Panel/Base", args: { count: "nope" }, argTypes: { count: { type: "number" } } }, "FunctionLabel.story", ".story");
if (named.kind !== "reject" || named.reason !== "args") throw new Error("function table args");

const target = { Name: "canvas", mounted: false, cleaned: false };
const host = mountNative(loaded.mount, target, {}, {});
if (!target.mounted || host.update !== undefined) throw new Error("mount target");
host.destroy();
host.destroy();
if (!target.cleaned) throw new Error("cleanup");

const fixture = readFileSync(join(root, "fixtures/functionStory/init.luau"), "utf8");
if (!fixture.startsWith("return function(target)") || !fixture.includes("label:Destroy()")) {
	throw new Error("fixture");
}
const storyblox = readFileSync(join(root, "src/packages/ui/storyblox/components/Storyblox.tsx"), "utf8");
const catalog = readFileSync(join(root, "src/fixtures/automation/index.tsx"), "utf8");
if (!storyblox.includes("storyModuleSuffix") || !catalog.includes("storyModuleSuffix")) {
	throw new Error("discovery");
}
const project = readFileSync(join(root, "plugin/plugin.project.json"), "utf8");
const release = readFileSync(join(root, "plugin/release.project.json"), "utf8");
if (!project.includes("FunctionLabel.story") || !project.includes("fixtures/functionStory")) {
	throw new Error("dev project");
}
if (release.includes("functionStory") || release.includes("FunctionLabel.story")) {
	throw new Error("release project mounts the fixture");
}

console.log("function story ok");
