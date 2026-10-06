import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const titles = [
	"Shell/Globals",
	"Shell/Chrome",
	"Shell/Loaders",
	"Shell/AsyncLoaders",
	"Shell/Actions",
	"Shell/Interactions",
	"Shell/Docs",
	"Shell/A11y",
	"Shell/Outline",
	"Shell/Tags",
	"Layout/Controls",
	"3D/Camera",
];

const fixturesDir = join(process.cwd(), "src/fixtures/stories");
const blob = readdirSync(fixturesDir)
	.filter((name) => name.endsWith(".stories.tsx"))
	.map((name) => readFileSync(join(fixturesDir, name), "utf8"))
	.join("\n");

for (const title of titles) {
	if (!blob.includes(`title: "${title}"`)) throw new Error(`missing parity fixture ${title}`);
}

if (process.argv.includes("--check")) {
	console.log("parity harness ok");
	process.exit(0);
}

console.log("Run after a sync of current main. Do not hydrate from a feature branch.");
console.log("Edit mode. Harness must already be running from ServerStorage.StorybloxPlugin._HarnessBoot.");
console.log("On ServerStorage.StorybloxPlugin.stories, for each title, dark then light:");
for (const title of titles) {
	console.log(`  storyblox-viewport-theme=dark|light  storyblox-viewport=${title}`);
}
console.log("Wait for storyblox-viewport-ready starting with the title, or stop on storyblox-viewport-error.");
console.log("Read storyblox-viewport-stats. screen_capture sees StarterGui.StorybloxViewport only.");
console.log("Save under storyblox-assets/captures/storybook-parity/.");
console.log("Then: node --experimental-strip-types scripts/capture-baseline.mjs --update <report.json>");
