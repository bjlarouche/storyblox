import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel) => readFileSync(join(root, rel), "utf8");

const shell = read("plugin/shell/init.server.luau");
for (const needle of [
	"StorybloxZoomIn",
	"StorybloxZoomOut",
	"StorybloxToggleGrid",
	"StorybloxToggleFit",
	'storyblox-chrome',
]) {
	if (!shell.includes(needle)) throw new Error(`plugin shell missing ${needle}`);
}

const storyblox = read("src/packages/ui/storyblox/components/Storyblox.tsx");
if (!storyblox.includes('GetAttributeChangedSignal("storyblox-chrome")') || !storyblox.includes("chromeCommand")) {
	throw new Error("Storyblox must wire storyblox-chrome to Template");
}

const template = read("src/packages/ui/template/components/Template.tsx");
for (const kind of ["zoomIn", "zoomOut", "grid", "fit"]) {
	if (!template.includes(`"${kind}"`)) throw new Error(`Template missing chrome kind ${kind}`);
}

console.log("chrome shortcuts ok");
