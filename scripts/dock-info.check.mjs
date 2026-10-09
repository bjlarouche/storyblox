import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const prop =
	/(?<!Enum)\.(InitialDockState|InitialEnabledShouldOverrideRestore|InitialEnabled|FloatingXSize|FloatingYSize|MinWidth|MinHeight)\b/;

function walk(dir, files) {
	for (const name of readdirSync(dir)) {
		if (name === "node_modules" || name === "out" || name === "dist") continue;
		const path = join(dir, name);
		if (statSync(path).isDirectory()) walk(path, files);
		else files.push(path);
	}
}

const files = [];
walk(join(root, "src"), files);
for (const file of files) {
	if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
	const lines = readFileSync(file, "utf8").split("\n");
	const where = relative(root, file);
	lines.forEach((line, i) => {
		const match = line.match(prop);
		if (match) throw new Error(`${where}:${i + 1} ${match[1]} cannot be read back`);
	});
}

console.log("dock info ok");
