import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

Array.prototype.size = function size() {
	return this.length;
};
const { planGallery } = await import("../src/packages/galleryPlan.ts");
const { partitionViewportRows } = await import("../src/packages/viewportCapture.ts");

const source =
	process.env.UIBLOX_SRC ??
	pathToFileURL(new URL("../../uiblox-rbxts/src/ui/packages/stateMatrix.ts", import.meta.url).pathname).href;
const { stateMatrix } = await import(source);
const plan = planGallery(stateMatrix);
if (plan.error) throw new Error(plan.error);
const { editRows, playRows } = partitionViewportRows(plan.files);
mkdirSync("captures", { recursive: true });
writeFileSync(
	"captures/gallery.json",
	JSON.stringify(
		{
			...plan,
			editRows,
			playRows,
			pointerNote: "Play is required for hover, press, and focus rows; Edit captures only rest rows.",
		},
		undefined,
		2,
	),
);
console.log(`${editRows.length} Edit rows, ${playRows.length} Play rows`);
