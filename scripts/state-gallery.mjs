import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

Array.prototype.size = function size() {
	return this.length;
};
const { planGallery } = await import("../src/packages/galleryPlan.ts");

const source = process.env.UIBLOX_SRC ?? pathToFileURL(new URL("../../uiblox-rbxts/src/ui/packages/stateMatrix.ts", import.meta.url).pathname).href;
const { stateMatrix } = await import(source);
const plan = planGallery(stateMatrix);
if (plan.error) throw new Error(plan.error);
mkdirSync("captures", { recursive: true });
writeFileSync("captures/gallery.json", JSON.stringify(plan, undefined, 2));
const pointed = plan.files.filter((row) => row.needsPointer).length;
console.log(`${plan.count} rows, ${pointed} need a real pointer`);
