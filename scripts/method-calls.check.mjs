import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const methods = ["GetEnumItems", "GetService", "IsA", "FindFirstChild"];
const names = methods.join("|");
const luauDot = new RegExp(`\\.(${names})\\s*\\(`);
const fnProp = new RegExp(`\\b(${names})\\s*\\??\\s*:\\s*\\(`);

function walk(dir, files) {
	for (const name of readdirSync(dir)) {
		if (name === "node_modules" || name === "out" || name === "dist") continue;
		const path = join(dir, name);
		if (statSync(path).isDirectory()) walk(path, files);
		else files.push(path);
	}
}

const files = [];
for (const rel of ["src", "plugin", "fixtures"]) walk(join(root, rel), files);

for (const file of files) {
	const luau = file.endsWith(".luau") || file.endsWith(".lua");
	const ts = file.endsWith(".ts") || file.endsWith(".tsx");
	if (!luau && !ts) continue;
	const lines = readFileSync(file, "utf8").split("\n");
	const where = relative(root, file);
	lines.forEach((line, i) => {
		const match = luau ? line.match(luauDot) : line.match(fnProp);
		if (!match) return;
		const how = luau ? "dot call drops self" : "function type compiles to a dot call";
		throw new Error(`${where}:${i + 1} ${match[1]} ${how}`);
	});
}

console.log("method calls ok");
