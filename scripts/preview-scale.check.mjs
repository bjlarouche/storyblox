globalThis.math = { min: Math.min, max: Math.max, floor: Math.floor, huge: Infinity };

const { previewScale, gridLineCount, GRID_CELL } = await import("../src/packages/previewScale.ts");

if (previewScale("actual", 200, 100, 10, 10) !== 1) throw new Error("100 percent ignores the dock");
if (previewScale("fit", 200, 100, 100, 100) !== 0.5) throw new Error("fit width");
if (previewScale("fit", 200, 100, 400, 20) !== 0.2) throw new Error("narrow height");
if (previewScale("fit", 0, 100, 100, 100) !== 1) throw new Error("empty logical size");
if (gridLineCount(320, GRID_CELL) !== 39) throw new Error("grid columns");
if (gridLineCount(48, GRID_CELL) !== 5) throw new Error("grid rows");
if (gridLineCount(0, GRID_CELL) !== 0) throw new Error("empty grid");

console.log("preview scale ok");
