import { readFileSync } from "node:fs";
import { join } from "node:path";

globalThis.typeOf = (value) => (value === null || value === undefined ? "nil" : typeof value === "object" ? "table" : typeof value);
globalThis.pairs = (record) => Object.entries(record);
Array.prototype.size = function () {
	return this.length;
};

const { mergeGlobals, extraGlobalEntries, flipDensity } = await import("../src/packages/storyGlobals.ts");

const merged = mergeGlobals({ brand: "storyblox" }, { brand: "patched" }, "light", "comfortable");
if (merged.brand !== "patched" || merged.theme !== "light" || merged.density !== "comfortable") {
	throw new Error("merge globals");
}
const reset = mergeGlobals({ brand: "storyblox" }, {}, "dark", "compact");
if (reset.brand !== "storyblox" || reset.theme !== "dark" || reset.density !== "compact") {
	throw new Error("globals reset to declared + theme/density");
}
const extras = extraGlobalEntries({ brand: "storyblox", theme: "dark", density: "compact", flag: true });
const names = extras.map((entry) => entry.name).sort();
if (names.join(",") !== "brand,flag") {
	throw new Error(`extra globals ${JSON.stringify(extras)}`);
}
if (flipDensity("compact") !== "comfortable" || flipDensity("comfortable") !== "compact") {
	throw new Error("flip density");
}

const root = process.cwd();
const template = readFileSync(join(root, "src/packages/ui/template/components/Template.tsx"), "utf8");
const chrome = template + readFileSync(join(root, "src/packages/ui/template/components/CanvasToolbar.tsx"), "utf8");
const shell = readFileSync(join(root, "src/packages/ui/storyblox/components/Storyblox.tsx"), "utf8");
const storyChange = template.slice(template.indexOf("if (storyKey !== argsStory)"), template.indexOf("const loaderFns"));
if (!storyChange.includes("setGlobalPatch({})") || storyChange.includes("setDensity")) {
	throw new Error("story change must clear the global patch and keep density");
}
for (const wiped of ["setSizePick", "setOutline(false)", "setMeasure(false)", "setBgStep", "setZoom", "setFit(", "setGrid("]) {
	if (storyChange.includes(wiped)) throw new Error(`story change resets canvas chrome: ${wiped}`);
}
const seedAt = storyChange.indexOf('if (argsStory === "")');
if (seedAt < 0 || storyChange.slice(0, seedAt).includes("setOrientation") || !storyChange.slice(seedAt).includes("setOrientation")) {
	throw new Error("orientation seeds from the first story, then stays");
}
for (const needle of ['resetKey={`toolbar:', 'key="Density"', 'key="ResetGlobals"', "setGlobalPatch({})"]) {
	if (!chrome.includes(needle)) throw new Error(`toolbar missing ${needle}`);
}
for (const needle of ['SetAttribute("storyblox-theme"', 'SetAttribute("storyblox-density"', "storyblox-theme", "storyblox-density"]) {
	if (!shell.includes(needle)) throw new Error(`shell missing ${needle}`);
}

console.log("story globals ok");
