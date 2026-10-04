globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);
String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	const len = this.length;
	const from = start < 0 ? len + start : start - 1;
	const to = finish === undefined ? len : finish < 0 ? len + finish + 1 : finish;
	return this.slice(from, to);
};

const { normalizeExport } = await import("../src/packages/ui/storyblox/normalizeStory.ts");
const suffix = ".stories";
const react = normalizeExport(
	{ default: { title: "Button/Base", template: () => "el" } },
	"Button.stories",
	suffix,
);
if (react.kind !== "react" || react.story.title !== "Button/Base") throw new Error("react story");

const fn = () => {};
const nativeFn = normalizeExport(fn, "Legacy.stories", suffix);
if (nativeFn.kind !== "native" || nativeFn.title !== "Legacy/Native" || nativeFn.mount !== fn) {
	throw new Error("native function");
}

const mount = () => {};
const descriptor = normalizeExport(
	{ renderer: "native", title: "Panel/Base", mount },
	"Panel.stories",
	suffix,
);
if (descriptor.kind !== "native" || descriptor.mount !== mount) throw new Error("native descriptor");

const ambiguous = normalizeExport(
	{ default: { title: "A/B", template: () => {} }, renderer: "native", mount },
	"Mix.stories",
	suffix,
);
if (ambiguous.kind !== "reject") throw new Error("ambiguous export was accepted");

const wrongName = normalizeExport({ default: { title: "A/B", template: () => {} } }, "Button.story", suffix);
if (wrongName.kind !== "reject") throw new Error("suffix mismatch was accepted");

console.log("normalize story ok");
