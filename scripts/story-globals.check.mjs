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

console.log("story globals ok");
