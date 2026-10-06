import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel) => readFileSync(join(root, rel), "utf8");

const safe = read("src/packages/ui/template/components/SafeBoundary.tsx");
if (!safe.includes("resetKey") || !safe.includes("Retry") || !safe.includes("ErrorBoundary")) {
	throw new Error("SafeBoundary must wrap ErrorBoundary with resetKey + Retry");
}

const panel = read("src/packages/ui/template/components/ErrorPanel.tsx");
for (const needle of ["<textbox", "TextEditable={false}", "ClearTextOnFocus={false}", "MultiLine={true}", "<scrollingframe", "setclipboard"]) {
	if (!panel.includes(needle)) throw new Error(`ErrorPanel must keep ${needle}`);
}
if (panel.includes("TextScaled") || panel.indexOf('"Retry"') > panel.indexOf("<scrollingframe")) {
	throw new Error("ErrorPanel must not scale text and must pin Retry above the stack");
}
if (!safe.includes("<ErrorPanel")) throw new Error("SafeBoundary must use ErrorPanel");
for (const rel of ["src/packages/ui/template/components/Template.tsx", "src/packages/ui/storyblox/components/Storyblox.tsx"]) {
	if (!read(rel).includes("<ErrorPanel")) throw new Error(`${rel} must use ErrorPanel`);
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

for (const rel of readdirSync(join(root, "src/packages"), { recursive: true })) {
	if (!rel.endsWith(".tsx")) continue;
	const lines = read(join("src/packages", rel)).split("\n");
	lines.forEach((line, i) => {
		if (/^\s*\{[^}]*\.map\(/.test(line) && lines[i - 1].trim() !== "<>") {
			throw new Error(`${rel}:${i + 1} mapped children must be wrapped in <> (ReactLua rekeys bare arrays into text)`);
		}
	});
}

console.log("error containment ok");
