globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);
Array.prototype.size = function size() {
	return this.length;
};
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

const { defineStory, controls, claimStoryId, releaseStoryId, resolveStoryTools, storyFeatures } = await import(
	"../src/packages/defineStory.ts"
);
const { normalizeExport } = await import("../src/packages/ui/storyblox/normalizeStory.ts");

const descriptor = {
	id: "inputs/button/default",
	title: "Examples/Button",
	args: { label: "Continue", disabled: false },
	argTypes: { label: controls.string(), disabled: controls.boolean() },
	render: (args) => args.label,
};
const wrapped = defineStory(descriptor);
if (wrapped.args.label !== "Continue" || wrapped.args.disabled !== false) throw new Error("args changed");

const fromTable = normalizeExport({ default: descriptor }, "Button.stories", ".stories");
const fromWrap = normalizeExport({ default: wrapped }, "Button.stories", ".stories");
if (fromTable.kind !== "react" || fromWrap.kind !== "react") throw new Error("modern story");
if (fromTable.story.title !== "Examples/Button" || fromWrap.story.title !== fromTable.story.title) {
	throw new Error("nested title");
}
if (fromTable.story.template() !== "Continue" || fromWrap.story.template() !== "Continue") throw new Error("render");
if (fromTable.story.args.label !== fromWrap.story.args.label) throw new Error("normalized args");

const optional = normalizeExport(
	{
		default: {
			title: "Examples/Button/Optional",
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
			title: "Examples/Button/Bad",
			args: { label: 1 },
			argTypes: { label: controls.string() },
			render: () => {},
		},
	},
	"Bad.stories",
	".stories",
);
if (bad.kind !== "reject" || bad.reason !== "args") throw new Error("type failure");

const listed = normalizeExport(
	{
		default: {
			title: "Examples/Button",
			args: { variant: "contained" },
			argTypes: { variant: controls.enum(["contained", "outlined", "text"]) },
			render: (args) => args.variant,
		},
	},
	"Button.stories",
	".stories",
);
if (listed.kind !== "react" || listed.story.template() !== "contained") throw new Error("enum arg");

const ranged = normalizeExport(
	{
		default: {
			title: "Layout/Controls",
			args: { tone: "low", amount: 20 },
			argTypes: { tone: controls.radio(["low", "high"]), amount: controls.slider(0, 100, 5) },
			render: (args) => `${args.tone}:${args.amount}`,
		},
	},
	"Controls.stories",
	".stories",
);
if (ranged.kind !== "react" || ranged.story.template() !== "low:20") throw new Error("radio and slider");

const toggled = normalizeExport(
	{
		default: {
			title: "Components/Switch",
			args: { on: true, flagged: false },
			argTypes: { on: controls.switch(), flagged: controls.boolean() },
			render: (args) => `${args.on}:${args.flagged}`,
		},
	},
	"Switch.stories",
	".stories",
);
if (toggled.kind !== "react" || toggled.story.argTypes.on.control !== "switch") throw new Error("switch control");
if (toggled.story.argTypes.flagged.control !== undefined) throw new Error("boolean stays checkbox default");
if (toggled.story.template() !== "true:false") throw new Error("switch args");

const legacy = normalizeExport(
	{ default: { title: "Button/Base", template: () => "el" } },
	"Button.stories",
	".stories",
);
if (legacy.kind !== "react" || legacy.story.title !== "Button/Base") throw new Error("legacy story");

const seen = [];
if (!claimStoryId(seen, "inputs/button/default", "Examples/Button")) throw new Error("claim");
if (claimStoryId(seen, "inputs/button/default", "Examples/Button/Other")) throw new Error("duplicate id");
if (!claimStoryId(seen, "inputs/button/default", "Examples/Button")) throw new Error("same title");
const released = releaseStoryId(seen, "Examples/Button");
if (!claimStoryId(released, "inputs/button/default", "Examples/Button/Other")) throw new Error("released id");

if (resolveStoryTools(undefined, { orbit: () => {}, resetCamera: () => {} }).length !== 0) {
	throw new Error("empty tools");
}
let orbits = 0;
let resets = 0;
const hostTools = resolveStoryTools(
	(host) => [
		{ id: "orbit", label: "Orbit", onClick: () => host.orbit() },
		{ id: "cam-reset", label: "Cam reset", onClick: () => host.resetCamera() },
	],
	{
		orbit: () => {
			orbits += 1;
		},
		resetCamera: () => {
			resets += 1;
		},
	},
);
if (hostTools.length !== 2 || hostTools[0].label !== "Orbit") throw new Error("host tools");
hostTools[0].onClick();
hostTools[1].onClick();
if (orbits !== 1 || resets !== 1) throw new Error("host tool clicks");

const withTools = normalizeExport(
	{
		default: {
			title: "3D/Camera",
			preview: { kind: "viewport" },
			tools: (host) => [{ id: "orbit", label: "Orbit", onClick: () => host.orbit() }],
			render: () => "ok",
		},
	},
	"ViewportHost.stories",
	".stories",
);
if (withTools.kind !== "react" || typeof withTools.story.tools !== "function") throw new Error("tools passthrough");

const configured = normalizeExport(
	{
		default: defineStory({
			title: "Examples/Button",
			args: { label: "Continue" },
			argTypes: { label: controls.string() },
			tags: ["dev"],
			parameters: { layout: "centered" },
			globals: { theme: "dark" },
			features: { actions: true },
			decorators: [(inner) => (args) => `wrapped:${inner(args)}`],
			render: (args) => args.label,
		}),
	},
	"Configured.stories",
	".stories",
);
if (configured.kind !== "react") throw new Error("configured story");
if (configured.story.tags[0] !== "dev" || configured.story.parameters.layout !== "centered") throw new Error("parameters");
if (configured.story.globals.theme !== "dark") throw new Error("globals");
const flags = storyFeatures({ actions: true });
if (flags.actions !== true || flags.docs !== false || flags.measure !== false) throw new Error("feature defaults");
if (configured.story.features.actions !== true || configured.story.features.docs !== false) throw new Error("features");
if (configured.story.template() !== "wrapped:Continue") throw new Error("decorator");

const withContext = normalizeExport(
	{
		default: defineStory({
			title: "Shell/Globals",
			globals: { brand: "storyblox" },
			parameters: { layout: "centered" },
			render: (_args, context) => `${context?.globals?.brand}:${context?.parameters?.layout}`,
		}),
	},
	"Globals.stories",
	".stories",
);
if (withContext.kind !== "react") throw new Error("context story");
if (
	withContext.story.template(
		{},
		{ theme: {}, globals: withContext.story.globals, parameters: withContext.story.parameters },
	) !== "storyblox:centered"
) {
	throw new Error("render context globals/parameters");
}

const withLoaders = normalizeExport(
	{
		default: defineStory({
			title: "Shell/Loaders",
			args: { label: "world" },
			argTypes: { label: controls.string() },
			loaders: [() => ({ greeting: "hello" }), (context) => ({ label: `${context.args.label}!` })],
			render: (args) => `${args.greeting} ${args.label}`,
		}),
	},
	"Loaders.stories",
	".stories",
);
if (withLoaders.kind !== "react") throw new Error("loaders story");
if (withLoaders.story.template({ label: "world" }, { theme: {} }) !== "hello world!") {
	throw new Error("loaders merge");
}

console.log("define story ok");
