globalThis.math = { min: Math.min, max: Math.max, floor: Math.floor, round: Math.round, abs: Math.abs, huge: Infinity };

Array.prototype.size = function () {
	return this.length;
};

globalThis.typeOf = (value) => (value === null || value === undefined ? "nil" : typeof value === "object" ? "table" : typeof value);

const { previewScale, gridLineCount, GRID_CELL, stepZoom, previewSize, flipOrientation, sizeChoice, sizeChoiceLabel, sizeChoiceActive, storySizeLabel, presetMenuLabel, activePreview, zoomPresetId } =
	await import("../src/packages/previewScale.ts");

const phone = previewSize({ preset: "phone" });
if (phone?.width !== 390 || phone?.height !== 844) throw new Error("phone preset");
const phoneLandscape = previewSize({ preset: "phone" }, "landscape");
if (phoneLandscape?.width !== 844 || phoneLandscape?.height !== 390) throw new Error("phone landscape");
const tabletPortrait = previewSize({ preset: "tablet", orientation: "portrait" });
if (tabletPortrait?.width !== 768 || tabletPortrait?.height !== 1024) throw new Error("tablet portrait");
const custom = previewSize({ preset: "phone", width: 320, height: 48 });
if (custom?.width !== 320 || custom?.height !== 48) throw new Error("custom size wins");
if (previewSize({ preset: "watch" }) !== undefined) throw new Error("unknown preset");
if (previewSize(undefined) !== undefined) throw new Error("no preview");
if (flipOrientation("portrait") !== "landscape" || flipOrientation("landscape") !== "portrait") {
	throw new Error("flip orientation");
}

if (previewScale("actual", 200, 100, 10, 10) !== 1) throw new Error("100 percent ignores the dock");
if (previewScale("fit", 200, 100, 100, 100) !== 0.5) throw new Error("fit width");
if (previewScale("fit", 200, 100, 400, 20) !== 0.2) throw new Error("narrow height");
if (previewScale("fit", 0, 100, 100, 100) !== 1) throw new Error("empty logical size");
if (gridLineCount(320, GRID_CELL) !== 39) throw new Error("grid columns");
if (gridLineCount(48, GRID_CELL) !== 5) throw new Error("grid rows");
if (gridLineCount(0, GRID_CELL) !== 0) throw new Error("empty grid");
if (stepZoom(1, 1) !== 1.1) throw new Error("zoom in");
if (stepZoom(1, -1) !== 0.9) throw new Error("zoom out");
if (stepZoom(4, 1) !== 4) throw new Error("zoom stays at 400");
if (stepZoom(0.25, -1) !== 0.25) throw new Error("zoom stays at 25");
if (stepZoom(0.4, 1) !== 0.5) throw new Error("zoom steps up to the next preset");
if (stepZoom(0.4, -1) !== 0.33) throw new Error("zoom steps down to the previous preset");
if (zoomPresetId(1) !== "100" || zoomPresetId(0.4) !== undefined) throw new Error("zoom preset id");
if (sizeChoice(undefined, { width: 320, height: 48 }) !== "story") throw new Error("sized story defaults to story");
if (sizeChoice(undefined, undefined) !== "responsive") throw new Error("unset size is responsive");
if (sizeChoice("responsive", { width: 320, height: 48 }) !== "responsive") throw new Error("responsive forces fill");
if (sizeChoiceLabel("phone") !== "Phone" || sizeChoiceLabel("responsive") !== "Responsive") throw new Error("size label");
if (sizeChoiceActive(undefined, { width: 320, height: 48 }) !== false) throw new Error("story default is not a pill");
if (sizeChoiceActive("phone", { width: 320, height: 48 }) !== true) throw new Error("device pick is a pill");
if (storySizeLabel({ width: 320, height: 48 }) !== "Story 320×48") throw new Error("story option");
if (presetMenuLabel("phone") !== "Phone 390×844") throw new Error("phone option");
const storySize = { width: 320, height: 48, preset: "phone" };
if (previewSize(activePreview(storySize, undefined))?.width !== 320) throw new Error("story size stays");
if (previewSize(activePreview(storySize, "responsive")) !== undefined) throw new Error("responsive fills");
if (previewSize(activePreview(storySize, "tablet"))?.width !== 1024) throw new Error("picked preset");

console.log("preview scale ok");
