Array.prototype.size = function () {
	return this.length;
};

const { planGallery } = await import("../src/packages/galleryPlan.ts");
const { partitionViewportRows } = await import("../src/packages/viewportCapture.ts");

const sample = [
	{ component: "Button", name: "Button-rest-dark", theme: "Dark", pointer: "rest", width: 280 },
	{ component: "Button", name: "Button-hover-dark", theme: "Dark", pointer: "hover", width: 280 },
	{ component: "Button", name: "Button-press-dark", theme: "Dark", pointer: "press", width: 280 },
	{ component: "SplitPane", name: "SplitPane-drag-dark", theme: "Dark", pointer: "press", width: 280 },
];
const plan = planGallery(sample);
if (plan.error) throw new Error(plan.error);
const { editRows, playRows } = partitionViewportRows(plan.files);
if (editRows.length !== 1 || playRows.length !== 3) throw new Error("pointer partition");
const playNames = playRows.map((row) => row.name);
if (!playNames.some((name) => name.includes("hover"))) throw new Error("hover row");
if (!playNames.some((name) => name.includes("press"))) throw new Error("press row");
if (!playNames.some((name) => name.includes("drag"))) throw new Error("drag row");
if (playRows.some((row) => row.needsPointer !== true)) throw new Error("play rows need a pointer");
if (editRows.some((row) => row.needsPointer)) throw new Error("rest row is edit");

if (process.argv.includes("--check")) {
	console.log("play pointer ok");
	process.exit(0);
}

console.log("Play solo against current main.");
console.log("Edit captures rest rows only. Hover, press, and focus need Play.");
console.log("SplitPane drag is a press-and-move. stateMatrix marks that row pointer=press and the name contains drag.");
console.log("There is no separate drag pointer kind.");
console.log("1. Start play. Leave the plugin tree alone.");
console.log("2. node scripts/state-gallery.mjs and use playRows.");
console.log("3. For each play row, mount the story, then on the client:");
console.log("   hover: move the pointer over StarterGui.StorybloxViewport.Host");
console.log("   press: mouse down on that Host");
console.log("   drag (name contains drag): mouse down, move, mouse up");
console.log("4. Capture StarterGui.StorybloxViewport to STORYBLOX_CAPTURES or ./captures/parity/play/<name>.png");
console.log("5. Stop play.");
