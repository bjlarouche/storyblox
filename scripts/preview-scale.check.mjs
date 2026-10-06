globalThis.math = { min: Math.min, max: Math.max, floor: Math.floor, huge: Infinity };

Array.prototype.size = function () {
	return this.length;
};

globalThis.typeOf = (value) => (value === null || value === undefined ? "nil" : typeof value === "object" ? "table" : typeof value);

const { previewScale, gridLineCount, GRID_CELL, stepZoom, previewSize, flipOrientation } = await import(
	"../src/packages/previewScale.ts"
);

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
if (stepZoom(1, 1) !== 2) throw new Error("zoom in");
if (stepZoom(1, -1) !== 0.5) throw new Error("zoom out");
if (stepZoom(2, 1) !== 2) throw new Error("zoom stays at 200");
if (stepZoom(0.5, -1) !== 0.5) throw new Error("zoom stays at 50");

console.log("preview scale ok");
