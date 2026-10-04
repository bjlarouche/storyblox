globalThis.math = { min: Math.min, huge: Infinity };

const { previewScale } = await import("../src/packages/previewScale.ts");

if (previewScale("actual", 200, 100, 10, 10) !== 1) throw new Error("100 percent ignores the dock");
if (previewScale("fit", 200, 100, 100, 100) !== 0.5) throw new Error("fit width");
if (previewScale("fit", 200, 100, 400, 20) !== 0.2) throw new Error("narrow height");
if (previewScale("fit", 0, 100, 100, 100) !== 1) throw new Error("empty logical size");

console.log("preview scale ok");
