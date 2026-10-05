import { pathToFileURL } from "node:url";

Array.prototype.size = function size() {
	return this.length;
};
String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	return this.slice(start - 1, finish);
};

const { planGallery } = await import("../src/packages/galleryPlan.ts");
const { partitionViewportRows, validateViewportCapture } = await import("../src/packages/viewportCapture.ts");

const plan = planGallery([
	{ component: "Button", name: "Button-default-dark", theme: "Dark", pointer: "rest", width: 280 },
	{ component: "Button", name: "Button-hover-dark", theme: "Dark", pointer: "hover", width: 280 },
]);
if (
	plan.error ||
	plan.count !== 2 ||
	plan.files[1].needsPointer !== true ||
	plan.files[0].file !== "captures/gallery/Button-default-dark.png"
) {
	throw new Error("gallery plan");
}
if (!planGallery([plan.files[0], plan.files[0]]).error) throw new Error("duplicate row");
const partition = partitionViewportRows(plan.files);
if (partition.editRows.length !== 1 || partition.playRows.length !== 1) throw new Error("gallery partition");
const valid = validateViewportCapture({
	story: "Button/default",
	theme: "dark",
	ready: "Button/default@4",
	stats: { guiObjects: 5, textObjects: 1, issues: [] },
});
if (!valid.ok || valid.issueCount !== 0) throw new Error("valid capture status");
if (
	validateViewportCapture({
		story: "Button/default",
		theme: "dark",
		ready: "Button/default@3",
		error: "mount failed",
		stats: { guiObjects: 5, textObjects: 1, issues: [] },
	}).ok
) {
	throw new Error("error capture status");
}

if (process.env.UIBLOX_SRC !== undefined) {
	const source = process.env.UIBLOX_SRC.startsWith("file:")
		? process.env.UIBLOX_SRC
		: pathToFileURL(process.env.UIBLOX_SRC).href;
	const { stateMatrix } = await import(source);
	const gallery = planGallery(stateMatrix);
	if (gallery.error) throw new Error(gallery.error);
	for (const component of ["Switch", "Slider"]) {
		const rows = gallery.files.filter((row) => row.component === component);
		if (rows.length === 0) throw new Error(`${component} missing from gallery plan`);
		if (!rows.some((row) => row.theme === "Dark") || !rows.some((row) => row.theme === "Light")) {
			throw new Error(`${component} missing theme coverage`);
		}
		if (!rows.some((row) => row.pointer === "focus")) throw new Error(`${component} missing focus`);
		if (!rows.some((row) => row.pointer === "hover")) throw new Error(`${component} missing hover`);
	}
	if (!gallery.files.some((row) => row.component === "Switch" && row.name.includes("disabled-on"))) {
		throw new Error("Switch missing disabled-on gallery rows");
	}
	if (!gallery.files.some((row) => row.component === "Slider" && row.name.includes("disabled"))) {
		throw new Error("Slider missing disabled gallery rows");
	}
}

console.log("gallery plan ok");
