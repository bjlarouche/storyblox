import { readFileSync } from "node:fs";

Array.prototype.size = function size() {
	return this.length;
};
Math.huge = Infinity;
globalThis.math = Math;

function gui(name, x, y, width, height, children) {
	return {
		Name: name,
		ClassName: "Frame",
		AbsolutePosition: { X: x, Y: y },
		AbsoluteSize: { X: width, Y: height },
		IsA: (className) => className === "GuiObject",
		GetChildren: () => children,
	};
}

const { formatMeasure, relativeBox, collectGuiBoxes, overlayLocal } = await import("../src/packages/layoutTools.ts");

const box = { x: 10, y: 20, width: 40.6, height: 12.2, name: "Btn", className: "TextButton" };
if (formatMeasure(box) !== "Btn 40×12 @ 10,20") throw new Error(`format ${formatMeasure(box)}`);
const rel = relativeBox(box, { x: 5, y: 5, width: 100, height: 100, name: "Root", className: "Frame" });
if (rel.x !== 5 || rel.y !== 15 || rel.width !== 40.6) throw new Error("relative");

const template = readFileSync("src/packages/ui/template/components/Template.tsx", "utf8");
if (template.includes("outlineEnabled") || template.includes("measureEnabled")) throw new Error("outline gate");
if (!template.includes('key="Outline"') || !template.includes('key="Measure"')) throw new Error("toolbar");
if (template.includes("declared ? <uistroke")) throw new Error("bounds stroke is always on");
if (!template.includes("declared && grid ? <uistroke")) throw new Error("bounds stroke follows grid");
if (!template.includes("ClipsDescendants={declared}")) throw new Error("preview frame does not clip");
if (!template.includes('key="Inset"')) throw new Error("padding shares the overlay parent");

const origin = { x: 100, y: 200, width: 160, height: 360, name: "mount", className: "Frame" };
const story = { x: 116, y: 216, width: 80, height: 32, name: "One", className: "TextButton" };
const once = overlayLocal(story, origin, 2);
const back = {
	x: origin.x + once.x * 2,
	y: origin.y + once.y * 2,
	width: once.width * 2,
	height: once.height * 2,
	name: once.name,
	className: once.className,
};
const twice = overlayLocal(back, origin, 2);
if (once.x !== 8 || once.y !== 8 || once.width !== 40 || twice.x !== once.x || twice.y !== once.y || twice.width !== once.width) {
	throw new Error(`overlay offset drifted ${once.x},${once.y} then ${twice.x},${twice.y}`);
}

const measure = gui("Measure", 14, 14, 22, 13, []);
const oldOutline = gui("outline-0", 12, 12, 80, 32, [measure]);
const overlay = gui("OutlineOverlay", 0, 0, 240, 120, [oldOutline]);
const button = gui("One", 12, 12, 80, 32, []);
const root = gui("mount", 0, 0, 240, 120, [button, overlay]);
const first = collectGuiBoxes(root);
const second = collectGuiBoxes(root);
const names = first.map((box) => box.name).join(",");
if (names !== "mount,One" || second.length !== first.length) throw new Error(`overlay leaked into measure: ${names}`);
for (let i = 0; i < first.length; i++) {
	if (first[i].x !== second[i].x || first[i].y !== second[i].y) throw new Error("second toggle moved");
}

console.log("layout tools ok");
