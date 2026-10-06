export type DensityName = "compact" | "comfortable";

export function flipDensity(current: DensityName): DensityName {
	return current === "compact" ? "comfortable" : "compact";
}

export function mergeGlobals(
	declared: unknown,
	patch: { [key: string]: unknown },
	themeName: "dark" | "light",
	density: DensityName,
) {
	const merged: { [key: string]: unknown } = {};
	if (typeOf(declared) === "table") {
		for (const [key, value] of pairs(declared as object)) merged[key as string] = value;
	}
	for (const [key, value] of pairs(patch)) merged[key as string] = value;
	merged.theme = themeName;
	merged.density = density;
	return merged;
}

export function extraGlobalEntries(declared: unknown): Array<{ name: string; value: unknown }> {
	const entries = new Array<{ name: string; value: unknown }>();
	if (typeOf(declared) !== "table") return entries;
	for (const [key, value] of pairs(declared as object)) {
		const name = key as string;
		if (name === "theme" || name === "density") continue;
		entries.push({ name, value });
	}
	entries.sort((a, b) => a.name < b.name);
	return entries;
}
