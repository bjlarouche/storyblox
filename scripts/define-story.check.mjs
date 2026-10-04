globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pairs = (record) => Object.keys(record).map((key) => [key, record[key]]);
String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	const len = this.length;
	const from = start < 0 ? len + start : start - 1;
	const to = finish === undefined ? len : finish < 0 ? len + finish + 1 : finish;
	return this.slice(from, to);
};

const { defineStory, controls, claimStoryId, releaseStoryId } = await import("../src/packages/defineStory.ts");
const { normalizeExport } = await import("../src/packages/ui/storyblox/normalizeStory.ts");

const descriptor = {
	id: "inputs/button/default",
	title: "Inputs/Button/Primary",
	args: { label: "Continue", disabled: false },
	argTypes: { label: controls.string(), disabled: controls.boolean() },
	render: (args) => args.label,
};
const wrapped = defineStory(descriptor);
if (wrapped.args.label !== "Continue" || wrapped.args.disabled !== false) throw new Error("args changed");

const fromTable = normalizeExport({ default: descriptor }, "Button.stories", ".stories");
const fromWrap = normalizeExport({ default: wrapped }, "Button.stories", ".stories");
if (fromTable.kind !== "react" || fromWrap.kind !== "react") throw new Error("modern story");
if (fromTable.story.title !== "Inputs/Button/Primary" || fromWrap.story.title !== fromTable.story.title) {
	throw new Error("nested title");
}
if (fromTable.story.template() !== "Continue" || fromWrap.story.template() !== "Continue") throw new Error("render");
if (fromTable.story.args.label !== fromWrap.story.args.label) throw new Error("normalized args");

const optional = normalizeExport(
	{
		default: {
			title: "Inputs/Button/Optional",
			args: { label: "Continue" },
			argTypes: { label: controls.string(), disabled: controls.boolean() },
			render: (args) => args.label,
		},
	},
	"Optional.stories",
	".stories",
);
if (optional.kind !== "react") throw new Error("optional arg");

const bad = normalizeExport(
	{
		default: {
			title: "Inputs/Button/Bad",
			args: { label: 1 },
			argTypes: { label: controls.string() },
			render: () => {},
		},
	},
	"Bad.stories",
	".stories",
);
if (bad.kind !== "reject" || bad.reason !== "args") throw new Error("type failure");

const legacy = normalizeExport(
	{ default: { title: "Button/Base", template: () => "el" } },
	"Button.stories",
	".stories",
);
if (legacy.kind !== "react" || legacy.story.title !== "Button/Base") throw new Error("legacy story");

const seen = [];
if (!claimStoryId(seen, "inputs/button/default", "Inputs/Button/Primary")) throw new Error("claim");
if (claimStoryId(seen, "inputs/button/default", "Inputs/Button/Other")) throw new Error("duplicate id");
if (!claimStoryId(seen, "inputs/button/default", "Inputs/Button/Primary")) throw new Error("same title");
const released = releaseStoryId(seen, "Inputs/Button/Primary");
if (!claimStoryId(released, "inputs/button/default", "Inputs/Button/Other")) throw new Error("released id");

console.log("define story ok");
