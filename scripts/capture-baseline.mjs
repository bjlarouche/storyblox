import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

globalThis.typeOf = (value) => {
	if (value === null || value === undefined) return "nil";
	if (typeof value === "function") return "function";
	if (typeof value === "object") return "table";
	return typeof value;
};
globalThis.pairs = (record) => Object.entries(record);
Array.prototype.size = function () {
	return this.length;
};
String.prototype.size = function () {
	return this.length;
};
String.prototype.sub = function (start, finish) {
	const from = start < 0 ? this.length + start : start - 1;
	const to = finish === undefined ? this.length : finish < 0 ? this.length + finish + 1 : finish;
	return this.slice(from, to);
};

const { summarizeCapture, diffCaptureBaseline } = await import("../src/packages/captureBaseline.ts");

const root = process.cwd();
const baselinePath = join(root, "baselines/viewport.json");

function rowsOf(parsed) {
	if (Array.isArray(parsed)) return parsed;
	if (parsed && Array.isArray(parsed.rows)) return parsed.rows;
	if (parsed && (parsed.story || parsed.storyId)) return [parsed];
	throw new Error("report needs rows");
}

function loadRows(file) {
	return rowsOf(JSON.parse(readFileSync(file, "utf8"))).map((row) => summarizeCapture(row));
}

function writeBaseline(rows) {
	const sorted = [...rows].sort((a, b) => `${a.story}@${a.theme}`.localeCompare(`${b.story}@${b.theme}`));
	writeFileSync(baselinePath, `${JSON.stringify({ rows: sorted }, null, "\t")}\n`);
}

const update = process.argv.includes("--update");
const check = process.argv.includes("--check");
const file = process.argv.slice(2).find((arg) => !arg.startsWith("--"));

if (update) {
	if (!file) {
		console.log("usage: node scripts/capture-baseline.mjs --update report.json");
		process.exit(1);
	}
	writeBaseline(loadRows(file));
	console.log(`updated ${baselinePath}`);
	process.exit(0);
}

if (check && file) {
	const lines = diffCaptureBaseline(loadRows(baselinePath), loadRows(file));
	if (lines.length === 0) {
		console.log("capture baseline ok");
		process.exit(0);
	}
	console.log(lines.join("\n"));
	process.exit(1);
}

const baseline = loadRows(baselinePath);
if (baseline.length === 0) throw new Error("empty capture baseline");
for (const row of baseline) {
	if (row.error) throw new Error(`${row.story}@${row.theme} ${row.error}`);
	if (row.guiObjects < 1) throw new Error(`${row.story} empty stats`);
}

const bumped = baseline.map((row, index) => (index === 0 ? { ...row, guiObjects: row.guiObjects + 1 } : row));
const changed = diffCaptureBaseline(baseline, bumped);
if (!changed.some((line) => line.includes("guiObjects") && line.includes("->"))) {
	throw new Error(`gui diff ${changed.join(" | ")}`);
}
const missing = diffCaptureBaseline(baseline, baseline.slice(1));
if (!missing.some((line) => line.endsWith(" missing"))) throw new Error("missing diff");
const extra = diffCaptureBaseline(baseline, [...baseline, { ...baseline[0], story: "Shell/Extra" }]);
if (!extra.some((line) => line.endsWith(" extra"))) throw new Error("extra diff");

const report = process.env.STORYBLOX_CAPTURE_REPORT;
if (report) {
	const lines = diffCaptureBaseline(baseline, loadRows(report));
	if (lines.length > 0) {
		console.log(lines.join("\n"));
		process.exit(1);
	}
}

console.log("capture baseline ok");
