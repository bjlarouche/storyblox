Array.prototype.size = function size() {
	return this.length;
};
globalThis.math = Math;

const { formatMeasure, relativeBox } = await import("../src/packages/layoutTools.ts");

const box = { x: 10, y: 20, width: 40.6, height: 12.2, name: "Btn", className: "TextButton" };
if (formatMeasure(box) !== "Btn 40×12 @ 10,20") throw new Error(`format ${formatMeasure(box)}`);
const rel = relativeBox(box, { x: 5, y: 5, width: 100, height: 100, name: "Root", className: "Frame" });
if (rel.x !== 5 || rel.y !== 15 || rel.width !== 40.6) throw new Error("relative");

console.log("layout tools ok");
