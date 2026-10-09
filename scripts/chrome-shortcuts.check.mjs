import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel) => readFileSync(join(root, rel), "utf8");

const shell = read("plugin/shell/init.server.luau");
for (const needle of [
	"StorybloxFocusSearch",
	"StorybloxReload",
	"StorybloxZoomIn",
	"StorybloxZoomOut",
	"StorybloxToggleGrid",
	"StorybloxToggleFit",
	"StorybloxOrientation",
	"StorybloxBackground",
	'storyblox-chrome',
]) {
	if (!shell.includes(needle)) throw new Error(`plugin shell missing ${needle}`);
}
if (shell.includes("CreatePluginAction") && /CreatePluginAction\([^)]*Enum\.KeyCode/.test(shell)) {
	throw new Error("plugin actions must not claim a default key");
}

const storyblox = read("src/packages/ui/storyblox/components/Storyblox.tsx");
if (!storyblox.includes('GetAttributeChangedSignal("storyblox-chrome")') || !storyblox.includes("chromeCommand")) {
	throw new Error("Storyblox must wire storyblox-chrome to Template");
}

const template = read("src/packages/ui/template/components/Template.tsx");
for (const kind of ["zoomIn", "zoomOut", "grid", "fit", "orientation", "background"]) {
	if (!template.includes(`"${kind}"`)) throw new Error(`Template missing chrome kind ${kind}`);
}

const settings = read("src/packages/ui/storyblox/components/SettingsPanel.tsx");
const labels = [...shell.matchAll(/CreatePluginAction\(\s*"[^"]+"\s*,\s*"([^"]+)"/g)].map((match) => match[1]);
if (labels.length < 10) throw new Error(`expected plugin actions, got ${labels.length}`);
for (const label of labels) {
	if (!settings.includes(`"${label}"`)) throw new Error(`settings missing shortcut ${label}`);
}

console.log("chrome shortcuts ok");
