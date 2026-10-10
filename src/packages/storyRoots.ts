function trimPath(value: string): string {
	let start = 1;
	let finish = value.size();
	while (start <= finish && value.sub(start, start) === " ") start += 1;
	while (finish >= start && value.sub(finish, finish) === " ") finish -= 1;
	if (start > finish) return "";
	return value.sub(start, finish);
}

export const DEFAULT_STORY_ROOTS = [
	"ServerStorage.StorybloxPlugin.stories",
	"ReplicatedStorage",
	"ServerStorage",
	"StarterPlayer.StarterPlayerScripts",
];

export const STORY_ROOT_CLASSES = [
	"Folder",
	"Script",
	"ModuleScript",
	"LocalScript",
	"Model",
	"ReplicatedStorage",
	"Workspace",
	"ServerStorage",
	"ServerScriptService",
	"Player",
	"StarterPlayer",
	"StarterPlayerScripts",
	"PlayerScripts",
];

export function splitRootPath(path: string): string[] {
	const parts = new Array<string>();
	for (const part of path.split(".")) {
		const name = trimPath(part);
		if (name.size() > 0) parts.push(name);
	}
	return parts;
}

export function lookupRootPath(path: string, root: DataModel = game): Instance | undefined {
	const parts = splitRootPath(path);
	if (parts.size() === 0) return undefined;
	const [ok, service] = pcall(() => root.GetService(parts[0] as keyof Services));
	let current: Instance | undefined = ok ? service : undefined;
	for (let index = 1; index < parts.size(); index++) {
		if (current === undefined) return undefined;
		current = current.FindFirstChild(parts[index]);
	}
	return current;
}

export function rootPathIssue(path: string, extras: string[], resolve = lookupRootPath): string | undefined {
	const name = trimPath(path);
	if (name.size() === 0) return "";
	if (extras.includes(name) || DEFAULT_STORY_ROOTS.includes(name)) return "Already added";
	return resolve(name) === undefined ? "Not found" : undefined;
}

export function uniqueRootPaths(paths: string[]): string[] {
	const kept = new Array<string>();
	for (const path of paths) {
		if (!kept.includes(path)) kept.push(path);
	}
	return kept;
}

export function parseRootList(value: unknown): string[] {
	if (typeOf(value) !== "string" || (value as string).size() === 0) return [];
	const [normalized] = (value as string).gsub("\n", ",");
	const paths = new Array<string>();
	for (const part of normalized.split(",")) {
		const path = trimPath(part);
		if (path.size() > 0) paths.push(path);
	}
	return uniqueRootPaths(paths);
}

export function encodeRootList(paths: string[]): string {
	return uniqueRootPaths(paths).join(",");
}

export function pathIsUnder(path: string, ancestor: string): boolean {
	if (path === ancestor) return true;
	return (
		path.size() > ancestor.size() &&
		path.sub(1, ancestor.size()) === ancestor &&
		path.sub(ancestor.size() + 1, ancestor.size() + 1) === "."
	);
}

export function collapseRootPaths(paths: string[]): string[] {
	const unique = uniqueRootPaths(paths);
	const kept = new Array<string>();
	for (const path of unique) {
		let nested = false;
		for (const other of unique) {
			if (other !== path && pathIsUnder(path, other)) {
				nested = true;
				break;
			}
		}
		if (!nested) kept.push(path);
	}
	return kept;
}

export function mergeStoryRootPaths(extra: string[]): string[] {
	const all = new Array<string>();
	for (const path of DEFAULT_STORY_ROOTS) all.push(path);
	for (const path of extra) all.push(path);
	return collapseRootPaths(all);
}
