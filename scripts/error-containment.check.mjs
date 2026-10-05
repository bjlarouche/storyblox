import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel) => readFileSync(join(root, rel), "utf8");

const safe = read("src/packages/ui/template/components/SafeBoundary.tsx");
if (!safe.includes("resetKey") || !safe.includes("Retry") || !safe.includes("ErrorBoundary")) {
	throw new Error("SafeBoundary must wrap ErrorBoundary with resetKey + Retry");
}

const controls = read("src/packages/ui/template/components/Controls.tsx");
if (!controls.includes("SafeBoundary") || !controls.includes("resetKey={`${resetKey}:${name}`}")) {
	throw new Error("Controls rows must wrap editors in SafeBoundary");
}

const inspector = read("src/packages/ui/template/components/InspectorPane.tsx");
for (const panel of ["controls", "actions", "interactions", "docs", "a11y"]) {
	if (!inspector.includes(`resetKey={\`${panel}:`)) {
		throw new Error(`InspectorPane missing SafeBoundary for ${panel}`);
	}
}

const template = read("src/packages/ui/template/components/Template.tsx");
if (!template.includes('resetKey={`inspector:${storyKey}`}') || !template.includes('resetKey={`toolbar:${storyKey}`}')) {
	throw new Error("Template must isolate inspector + toolbar");
}
if (!template.includes("ErrorBoundary") || !template.includes("canvas-")) {
	throw new Error("Template must keep canvas ErrorBoundary");
}

const storyblox = read("src/packages/ui/storyblox/components/Storyblox.tsx");
if (!storyblox.includes('resetKey="sidebar"') || !storyblox.includes("SafeBoundary")) {
	throw new Error("Storyblox sidebar must be behind SafeBoundary");
}

const host = read("plugin/host/init.luau");
if (!host.includes("ErrorBoundary") || !host.includes("Storyblox crashed")) {
	throw new Error("host root ErrorBoundary must remain last resort");
}

const controlFixture = read("src/fixtures/stories/CrashControl.stories.tsx");
const storyFixture = read("src/fixtures/stories/CrashStory.stories.tsx");
if (!controlFixture.includes("Dev/Crash Control") || !controlFixture.includes("intentional control crash")) {
	throw new Error("missing Crash Control fixture");
}
if (!storyFixture.includes("Dev/Crash Story") || !storyFixture.includes("intentional story crash")) {
	throw new Error("missing Crash Story fixture");
}

const pack = read("package.json");
if (!pack.includes("!out/fixtures/**")) {
	throw new Error("fixtures must stay excluded from npm pack");
}

const release = read("scripts/plugin-fixtures.check.mjs");
if (!release.includes('globIgnorePaths = ["**/fixtures/**"]')) {
	throw new Error("release plugin must ignore fixtures");
}

console.log("error containment ok");
