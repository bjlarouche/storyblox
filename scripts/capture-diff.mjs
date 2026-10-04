import { execFileSync } from "node:child_process";
import { copyFileSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

Array.prototype.size = function size() {
	return this.length;
};
const { pixelDiff } = await import("../src/packages/pixelDiff.ts");

function raw(file) {
	const bmp = join(tmpdir(), `storyblox-${process.pid}-${file.replaceAll("/", "_")}.bmp`);
	execFileSync("sips", ["-s", "format", "bmp", file, "--out", bmp]);
	const buf = readFileSync(bmp);
	unlinkSync(bmp);
	const offset = buf.readUInt32LE(10);
	return { width: buf.readInt32LE(18), height: Math.abs(buf.readInt32LE(22)), bytes: [...buf.subarray(offset)] };
}

const update = process.argv.includes("--update");
const files = process.argv.slice(2).filter((arg) => arg !== "--update");
const [baseline, actual] = files;
if (!baseline || !actual) {
	console.log("usage: node scripts/capture-diff.mjs [--update] baseline.png actual.png");
	process.exit(1);
}
if (update) {
	copyFileSync(actual, baseline);
	console.log(`updated ${baseline}`);
	process.exit(0);
}
const left = raw(baseline);
const right = raw(actual);
if (left.width !== right.width || left.height !== right.height) {
	console.log(`size ${left.width}x${left.height} vs ${right.width}x${right.height}`);
	process.exit(1);
}
const diff = pixelDiff(left.bytes, right.bytes);
if (diff.error) {
	console.log(diff.error);
	process.exit(1);
}
console.log(`${diff.changed}/${diff.total} (${diff.ratio.toFixed(4)})`);
if (diff.ratio > 0) process.exit(1);
