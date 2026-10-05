#!/usr/bin/env node
/**
 * Saves Studio viewport captures after the Storyblox viewport harness mounts a story.
 * Mount with attributes on ServerStorage.StorybloxPlugin.stories, then:
 *   node scripts/viewport-gallery.mjs Components-Switch-dark
 *
 * Writes under ../storyblox-assets/captures/ (never commit that tree).
 * For full story×theme layout scans, set storyblox-viewport-scan on the stories root
 * and read storyblox-viewport-report (see skill storyblox-viewport-test).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const name = (process.argv[2] ?? "viewport").replace(/[^\w.-]+/g, "-");
const outDir = resolve(process.cwd(), "../storyblox-assets/captures");
mkdirSync(outDir, { recursive: true });

const finder = `#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>
int main(void) {
	CFArrayRef windows = CGWindowListCopyWindowInfo(kCGWindowListOptionAll, kCGNullWindowID);
	for (NSDictionary *w in (NSArray *)windows) {
		NSString *owner = w[(id)kCGWindowOwnerName] ?: @"";
		NSString *title = w[(id)kCGWindowName] ?: @"";
		if (![owner isEqualToString:@"Roblox Studio"]) continue;
		if (![title containsString:@"Roblox Studio"]) continue;
		NSDictionary *b = w[(id)kCGWindowBounds];
		printf("%d\\t%s\\t%s\\t%s\\n", [w[(id)kCGWindowNumber] intValue], title.UTF8String, [b[@"Width"] stringValue].UTF8String, [b[@"Height"] stringValue].UTF8String);
	}
	return 0;
}
`;

const dir = join(tmpdir(), "storyblox-viewport-gallery");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "wins.m"), finder);
execFileSync("clang", ["-framework", "CoreGraphics", "-framework", "Foundation", join(dir, "wins.m"), "-o", join(dir, "wins")]);
const listed = execFileSync(join(dir, "wins"), { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const row = listed.sort(
	(a, b) => Number(b.split("\t")[2]) * Number(b.split("\t")[3]) - Number(a.split("\t")[2]) * Number(a.split("\t")[3]),
)[0];
if (!row) throw new Error("no Studio window");
const [id] = row.split("\t");
const file = join(outDir, `${name}.png`);
execFileSync("screencapture", ["-l", id, "-o", file]);
const info = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
const pixelWidth = Number(info.match(/pixelWidth: (\d+)/)[1]);
const pixelHeight = Number(info.match(/pixelHeight: (\d+)/)[1]);
const manifest = { file, name, pixelWidth, pixelHeight, backend: "studio-window", note: "prefer MCP screen_capture of StarterGui StorybloxViewport for clean frames" };
writeFileSync(join(outDir, `${name}.json`), JSON.stringify(manifest, undefined, 2));
console.log(`${file} ${pixelWidth}x${pixelHeight}`);
