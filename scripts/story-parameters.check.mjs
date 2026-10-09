globalThis.typeOf = (value) => {
	if (value === null || value === undefined) return "nil";
	if (typeof value === "function") return "function";
	if (typeof value === "object") return "table";
	return typeof value;
};
String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	const len = this.length;
	const from = start < 0 ? len + start : start - 1;
	const to = finish === undefined ? len : finish < 0 ? len + finish + 1 : finish;
	return this.slice(from, to);
};

const { canvasLayout, docsPage, actionFilter, allowAction } = await import("../src/packages/storyParameters.ts");

if (canvasLayout(undefined) !== "padded" || canvasLayout({}) !== "padded" || canvasLayout({ layout: "nope" }) !== "padded") {
	throw new Error("default layout");
}
if (canvasLayout({ layout: "centered" }) !== "centered" || canvasLayout({ layout: "fullscreen" }) !== "fullscreen") {
	throw new Error("named layout");
}

if (docsPage(undefined) !== undefined || docsPage({ docs: false }) !== false) throw new Error("docs off");
if (docsPage({ docs: "Page" }) !== "Page" || docsPage({ docs: { page: "Body" } }) !== "Body") throw new Error("docs page");
if (docsPage({ docs: "" }) !== undefined || docsPage({ docs: { page: "" } }) !== undefined) throw new Error("empty docs");

if (actionFilter(undefined) !== "all" || actionFilter({ actions: true }) !== "all") throw new Error("actions default");
if (actionFilter({ actions: false }) !== "off") throw new Error("actions off");
const named = actionFilter({ actions: { names: ["onPress", ""] } });
if (!named.names || named.names.join(",") !== "onPress") throw new Error("action names");
const prefixed = actionFilter({ actions: { prefix: "on" } });
if (prefixed.prefix !== "on") throw new Error("action prefix");
if (!allowAction("all", "onClick") || allowAction("off", "onClick")) throw new Error("allow all/off");
if (!allowAction(named, "onPress") || allowAction(named, "onIgnore")) throw new Error("allow names");
if (!allowAction(prefixed, "onPress") || !allowAction(prefixed, "row.onSelect") || allowAction(prefixed, "handleClick")) {
	throw new Error("allow prefix");
}

const { readFileSync } = await import("node:fs");
const template = readFileSync(new URL("../src/packages/ui/template/components/Template.tsx", import.meta.url), "utf8");
for (const needle of ["canvasLayout(", "docsPage(", "actionFilter(", 'layout === "centered"', 'layout === "fullscreen"', "page: typeOf(page)"]) {
	if (!template.includes(needle)) throw new Error(`template missing ${needle}`);
}
const docs = readFileSync(new URL("../src/packages/ui/template/components/DocsPanel.tsx", import.meta.url), "utf8");
if (!docs.includes('key="Page"')) throw new Error("docs page");

console.log("story parameters ok");
