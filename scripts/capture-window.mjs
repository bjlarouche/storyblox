import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

String.prototype.size = function size() {
	return this.length;
};
const { captureShot } = await import("../src/packages/captureShot.ts");

const finder = `#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>
int main(void) {
	CFArrayRef windows = CGWindowListCopyWindowInfo(kCGWindowListOptionAll, kCGNullWindowID);
	for (NSDictionary *w in (NSArray *)windows) {
		NSString *owner = w[(id)kCGWindowOwnerName] ?: @"";
		NSString *name = w[(id)kCGWindowName] ?: @"";
		if (![owner isEqualToString:@"Roblox Studio"]) continue;
		if (![name containsString:@"Roblox Studio"]) continue;
		NSDictionary *b = w[(id)kCGWindowBounds];
		printf("%d\\t%s\\t%s\\t%s\\n", [w[(id)kCGWindowNumber] intValue], name.UTF8String, [b[@"Width"] stringValue].UTF8String, [b[@"Height"] stringValue].UTF8String);
	}
	return 0;
}
`;

const dir = join(tmpdir(), "storyblox-capture");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "wins.m"), finder);
execFileSync("clang", ["-framework", "CoreGraphics", "-framework", "Foundation", join(dir, "wins.m"), "-o", join(dir, "wins")]);
const listed = execFileSync(join(dir, "wins"), { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const row = listed.sort((a, b) => Number(b.split("\t")[2]) * Number(b.split("\t")[3]) - Number(a.split("\t")[2]) * Number(a.split("\t")[3]))[0];
if (!row) throw new Error("no Studio window");
const [id, title, pointWidth, pointHeight] = row.split("\t");
const name = process.argv[2] ?? "studio-window";
mkdirSync("captures", { recursive: true });
const file = `captures/${name}.png`;
execFileSync("screencapture", ["-l", id, "-o", file]);
const info = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
const pixelWidth = Number(info.match(/pixelWidth: (\d+)/)[1]);
const pixelHeight = Number(info.match(/pixelHeight: (\d+)/)[1]);
const shot = captureShot({
	backend: "studio-window",
	windowId: Number(id),
	name,
	pixelWidth,
	pixelHeight,
	pointWidth: Number(pointWidth),
	pointHeight: Number(pointHeight),
});
if (shot.error) throw new Error(shot.error);
writeFileSync(`captures/${name}.json`, JSON.stringify({ ...shot, title }, undefined, 2));
console.log(`${shot.file} ${shot.pixelWidth}x${shot.pixelHeight} scale ${shot.scale}`);
console.log("full Studio window, including panels outside the dock");
