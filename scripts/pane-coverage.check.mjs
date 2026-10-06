import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel) => readFileSync(join(root, rel), "utf8");
const fixturesDir = join(root, "src/fixtures/stories");
const fixtureFiles = readdirSync(fixturesDir).filter((name) => name.endsWith(".stories.tsx"));
const fixtureBlob = fixtureFiles.map((name) => read(join("src/fixtures/stories", name))).join("\n");

const template = read("src/packages/ui/template/components/Template.tsx");
const inspector = read("src/packages/ui/template/components/InspectorPane.tsx");
const pack = read("package.json");

/** Every public inspector tab / canvas tool must have a fixture + check. */
const required = [
	{
		id: "controls",
		title: "Layout/Controls",
		check: "scripts/story-controls.check.mjs",
		needles: ["controls"],
	},
	{
		id: "actions",
		title: "Shell/Actions",
		check: "scripts/story-actions.check.mjs",
		needles: ["actions"],
	},
	{
		id: "interactions",
		title: "Shell/Interactions",
		check: "scripts/story-cases.check.mjs",
		needles: ["interactions"],
	},
	{
		id: "docs",
		title: "Shell/Docs",
		check: "scripts/define-story.check.mjs",
		needles: ["docs"],
		templateNeedles: ["source:"],
	},
	{
		id: "a11y",
		title: "Shell/A11y",
		check: "scripts/a11y-heuristics.check.mjs",
		needles: ["a11y"],
	},
	{
		id: "outline",
		title: "Shell/Outline",
		check: "scripts/layout-tools.check.mjs",
		needles: [],
		templateNeedles: ['key="Outline"', 'key="Measure"'],
	},
	{
		id: "tags",
		title: "Shell/Tags",
		check: "scripts/story-tags.check.mjs",
		needles: [],
	},
	{
		id: "chrome",
		title: "Shell/Chrome",
		check: "scripts/preview-scale.check.mjs",
		needles: [],
		templateNeedles: [
			'key="ZoomOut"',
			'key="Grid"',
			'key="Fit"',
			'key="Orientation"',
			'key="Background"',
			'id="Remount"',
			'id="Theme"',
		],
	},
	{
		id: "crash-control",
		title: "Dev/Crash Control",
		check: "scripts/error-containment.check.mjs",
		needles: [],
	},
	{
		id: "crash-story",
		title: "Dev/Crash Story",
		check: "scripts/error-containment.check.mjs",
		needles: [],
	},
	{
		id: "viewport-preset",
		title: "3D/Camera",
		check: "scripts/preview-camera.check.mjs",
		needles: [],
	},
	{
		id: "globals",
		title: "Shell/Globals",
		check: "scripts/define-story.check.mjs",
		needles: [],
		templateNeedles: ["globals: story.globals", "parameters: story.parameters"],
	},
];

for (const pane of required) {
	if (!fixtureBlob.includes(`title: "${pane.title}"`)) {
		throw new Error(`missing fixture title ${pane.title} for pane ${pane.id}`);
	}
	if (!existsSync(join(root, pane.check))) {
		throw new Error(`missing check ${pane.check} for pane ${pane.id}`);
	}
	if (!pack.includes(pane.check.replace("scripts/", ""))) {
		throw new Error(`${pane.check} must run in pnpm test`);
	}
	for (const needle of pane.needles) {
		if (!inspector.includes(`resetKey={\`${needle}:`)) {
			throw new Error(`InspectorPane missing SafeBoundary for ${needle}`);
		}
	}
	for (const needle of pane.templateNeedles ?? []) {
		if (!template.includes(needle)) {
			throw new Error(`Template missing ${needle} for pane ${pane.id}`);
		}
	}
}

if (!pack.includes("!out/fixtures/**")) {
	throw new Error("fixtures must stay excluded from npm pack");
}

console.log(`pane coverage ok (${required.length})`);
