import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const banned = [
	"options.constants.colors",
	"palette.secondary",
	"palette.error.main",
	"palette.warning.main",
	"palette.success.main",
	"palette.background.",
	"extendedPalette",
];

const walk = (dir) => {
	const out = [];
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) out.push(...walk(path));
		else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(path);
	}
	return out;
};

const hits = [];
for (const file of walk("src/packages")) {
	const text = readFileSync(file, "utf8");
	for (const needle of banned) {
		if (text.includes(needle)) hits.push(`${file}: ${needle}`);
	}
}
if (hits.length) throw new Error(`stale theme tokens:\n${hits.join("\n")}`);
console.log("chrome tokens ok");
