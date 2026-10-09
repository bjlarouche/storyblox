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
if (host.includes("press Reload")) {
	throw new Error("host crash copy must not assume a Reload toolbar button");
}
if (host.includes("ReactRoblox.act")) throw new Error("host must not use act; it throws outside test mode");
const unmountAt = host.indexOf("handle:unmount()");
const drainAt = host.indexOf("while not drained");
if (unmountAt < 0 || drainAt < unmountAt || !host.includes("React.createElement(Drained)")) {
	throw new Error("host cleanup must yield until the unmount effects ran");
}
for (const rel of ["plugin/shell/init.server.luau", "plugin/shell-release/init.server.luau"]) {
	const shell = read(rel);
	const body = shell.slice(shell.indexOf("local function mount()"));
	if (!shell.includes("if loading then") || body.indexOf("runCleanup()") > body.indexOf("root:ClearAllChildren()")) {
		throw new Error(`${rel} must finish cleanup before the next load renders`);
	}
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

const releaseProject = read("plugin/release.project.json");
if (!releaseProject.includes('"**/fixtures/**"') || releaseProject.includes("fixtures/stories")) {
	throw new Error("release.project.json must ignore fixtures and omit fixture story mounts");
}
const releaseScript = read("scripts/plugin-release.mjs");
if (!releaseScript.includes("dist/storyblox.rbxm") || !releaseScript.includes('endsWith(".stories")')) {
	throw new Error("plugin-release must write dist/storyblox.rbxm and reject bundled stories");
}

function jsxDepthChange(line) {
	const opens = line.match(/<[A-Za-z]/g)?.length ?? 0;
	const closes = line.match(/<\/[A-Za-z]/g)?.length ?? 0;
	const selfCloses = line.match(/\/>/g)?.length ?? 0;
	return opens - selfCloses - closes;
}

function elementArrayNames(source) {
	const names = new Set();
	for (const match of source.matchAll(/(?:const|let)\s+([A-Za-z_]\w*)[^=\n]*=\s*(?:new Array<React\.Element>\(\)|\[\])/g)) {
		if (match[0].includes("React.Element")) names.add(match[1]);
	}
	for (const match of source.matchAll(/([A-Za-z_]\w*)\s*:\s*Array<React\.Element>/g)) names.add(match[1]);
	return names;
}

function arrayFactories(source, names) {
	const factories = new Set();
	const heads = [...source.matchAll(/^function ([A-Za-z_]\w*)/gm)];
	for (let i = 0; i < heads.length; i++) {
		const body = source.slice(heads[i].index, heads[i + 1]?.index ?? source.length);
		for (const name of names) {
			if (body.includes(`return ${name};`)) factories.add(heads[i][1]);
		}
	}
	return factories;
}

function bareArrayChild(line, names, factories) {
	const trimmed = line.trim();
	if (names.has(trimmed)) return trimmed;
	const ident = trimmed.match(/^\{([A-Za-z_]\w*)\}$/);
	if (ident && names.has(ident[1])) return ident[1];
	const call = trimmed.match(/^\{([A-Za-z_]\w*)\(/);
	if (call && factories.has(call[1])) return call[1];
	return undefined;
}

function hasElementSibling(lines, depths, index) {
	const depth = depths[index];
	let start = index;
	while (start > 0 && depths[start] >= depth) start--;
	let end = index + 1;
	while (end < lines.length && depths[end] >= depth) end++;
	for (let j = start + 1; j < end; j++) {
		if (j === index) continue;
		const trimmed = lines[j].trim();
		if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.startsWith("<>")) return true;
		if (trimmed.startsWith("{") && depths[j] === depth) return true;
	}
	return false;
}

for (const rel of readdirSync(join(root, "src/packages"), { recursive: true })) {
	if (!rel.endsWith(".tsx")) continue;
	const source = read(join("src/packages", rel));
	const lines = source.split("\n");
	const names = elementArrayNames(source);
	const factories = arrayFactories(source, names);
	const depths = [];
	let depth = 0;
	for (const line of lines) {
		depths.push(depth);
		depth += jsxDepthChange(line);
	}
	lines.forEach((line, i) => {
		if (/^\s*\{[^}]*\.map\(/.test(line) && lines[i - 1].trim() !== "<>") {
			throw new Error(`${rel}:${i + 1} mapped children must be wrapped in <> (ReactLua rekeys bare arrays into text)`);
		}
		const child = bareArrayChild(line, names, factories);
		const wrapped = (lines[i - 1] ?? "").trim() === "<>" || line.includes("<>");
		if (child && !wrapped && hasElementSibling(lines, depths, i)) {
			throw new Error(`${rel}:${i + 1} element array ${child} must be wrapped in <> (bare arrays beside other children rekey into text)`);
		}
	});
}

console.log("error containment ok");
