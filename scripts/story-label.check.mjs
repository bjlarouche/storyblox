String.prototype.size = function size() {
	return this.length;
};
Array.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	return this.slice(start - 1, finish);
};
String.prototype.find = function find(pattern, init, plain) {
	const at = this.indexOf(pattern, init - 1);
	return at < 0 ? [undefined] : [at + 1, at + pattern.length];
};

globalThis.typeOf = (value) => (value !== null && typeof value === "object" ? "table" : typeof value);
globalThis.tostring = (value) => String(value);
globalThis.pairs = (value) => Object.entries(value);

const { argDoc, storyLabel, storyLanguage, storyInspector } = await import("../src/packages/ui/template/storyLabel.ts");

if (storyLanguage("-- Compiled with roblox-ts v3.0.0\nlocal TS") !== "TS") throw new Error("ts header");
if (storyLanguage("local function mount() end") !== "Luau") throw new Error("luau source");
if (storyLabel("Inputs/Button/Primary", undefined, "TS") !== "Inputs › Button › Primary  ·  react · TS") {
	throw new Error("react label");
}
if (storyLabel("Fixture/Native Scene", "native", "Luau") !== "Fixture › Native Scene  ·  native · Luau") {
	throw new Error("native label");
}
if (storyLabel("Canvas") !== "Canvas  ·  react") throw new Error("no language");
if (argDoc("label", { type: "string", description: "Button text" }, "Native") !== 'label · string · default "Native"\nButton text') {
	throw new Error("string doc");
}
if (argDoc("count", { type: "number", control: "slider", optional: true }, undefined) !== "count · slider · optional · no default") {
	throw new Error("optional doc");
}
if (argDoc("disabled", { type: "boolean" }, false) !== "disabled · boolean · default false") throw new Error("false default");
if (argDoc("mystery", undefined, 3) !== "mystery · unknown · default 3") throw new Error("missing spec");
if (argDoc("items", { type: "array" }, ["a"]) !== "items · array") throw new Error("table default");
if (storyInspector(undefined) !== "No story selected") throw new Error("empty inspector");
if (
	storyInspector({
		title: "Components/Button",
		language: "TS",
		source: "ServerStorage.stories.Button",
		description: "A button",
		argTypes: { text: {}, disabled: {} },
	}) !== "Components/Button\nreact · TS\nServerStorage.stories.Button\nA button\ndisabled, text"
) {
	throw new Error("inspector lines");
}

console.log("story label ok");
