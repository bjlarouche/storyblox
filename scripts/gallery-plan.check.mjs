Array.prototype.size = function size() {
	return this.length;
};

const { planGallery } = await import("../src/packages/galleryPlan.ts");

const plan = planGallery([
	{ component: "Button", name: "Button-default-dark", theme: "Dark", pointer: "rest", width: 280 },
	{ component: "Button", name: "Button-hover-dark", theme: "Dark", pointer: "hover", width: 280 },
]);
if (plan.error || plan.count !== 2 || plan.files[1].needsPointer !== true || plan.files[0].file !== "captures/gallery/Button-default-dark.png") {
	throw new Error("gallery plan");
}
if (!planGallery([plan.files[0], plan.files[0]]).error) throw new Error("duplicate row");
console.log("gallery plan ok");
