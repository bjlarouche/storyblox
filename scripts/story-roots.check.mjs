Array.prototype.size = function size() {
	return this.length;
};
String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	return this.slice(start - 1, finish);
};
String.prototype.gsub = function gsub(pattern, replacement) {
	if (pattern === ",") return [this.split(",").join(replacement), 0];
	if (pattern === "\n") return [this.split("\n").join(replacement), 0];
	return [this.replace(new RegExp(pattern, "g"), replacement), 0];
};
globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pcall = (fn) => {
	try {
		return [true, fn()];
	} catch (error) {
		return [false, error];
	}
};

const {
	DEFAULT_STORY_ROOTS,
	STORY_ROOT_CLASSES,
	parseRootList,
	encodeRootList,
	collapseRootPaths,
	mergeStoryRootPaths,
	splitRootPath,
	lookupRootPath,
	rootPathIssue,
} = await import("../src/packages/storyRoots.ts");

if (DEFAULT_STORY_ROOTS.join(",") !== "ServerStorage.StorybloxPlugin.stories,ReplicatedStorage,ServerStorage,StarterPlayer.StarterPlayerScripts") {
	throw new Error(`defaults ${DEFAULT_STORY_ROOTS}`);
}
if (!STORY_ROOT_CLASSES.includes("StarterPlayerScripts") || !STORY_ROOT_CLASSES.includes("PlayerScripts")) {
	throw new Error("starter player scripts missing from root classes");
}
if (parseRootList(" a, b\nc ,a ").join(",") !== "a,b,c") throw new Error("parse");
if (parseRootList("").join(",") !== "" || parseRootList(undefined).join(",") !== "") throw new Error("empty");
if (encodeRootList(["x", "x", "y"]) !== "x,y") throw new Error("encode");
if (splitRootPath(" ReplicatedStorage.UI.stories ").join("/") !== "ReplicatedStorage/UI/stories") {
	throw new Error("split");
}
if (splitRootPath("ReplicatedStorage.").join("/") !== "ReplicatedStorage/") throw new Error("split trailing");
if (splitRootPath("ReplicatedStorage..").join("/") !== "ReplicatedStorage//") throw new Error("split doubled");
if (splitRootPath(".ReplicatedStorage").join("/") !== "/ReplicatedStorage") throw new Error("split leading");
if (splitRootPath("ReplicatedStorage..Stories").join("/") !== "ReplicatedStorage//Stories") throw new Error("split gap");
if (collapseRootPaths(["ServerStorage.StorybloxPlugin.stories", "ServerStorage"]).join(",") !== "ServerStorage") {
	throw new Error("nested plugin folder");
}
const merged = mergeStoryRootPaths(["ReplicatedStorage.UI", "Workspace.Stories"]);
if (merged.join(",") !== "ReplicatedStorage,ServerStorage,StarterPlayer.StarterPlayerScripts,Workspace.Stories") {
	throw new Error(`merge ${merged}`);
}
const node = (children = {}) => ({ FindFirstChild: (name) => children[name] });
const stories = node();
const game = {
	FindService(name) {
		if (name !== "ReplicatedStorage") throw new Error(`${name} is not a valid Service name`);
		return node({ Stories: stories });
	},
};
const service = lookupRootPath("ReplicatedStorage", game);
if (service === undefined || service.FindFirstChild("Stories") !== stories) throw new Error("lookup service");
if (lookupRootPath("ReplicatedStorage.Stories", game) !== stories) throw new Error("lookup nested");
if (lookupRootPath("ReplicatedStorage.Missing", game) !== undefined) throw new Error("lookup missing child");
if (lookupRootPath("Replicatedtss", game) !== undefined) throw new Error("lookup bad service");
if (lookupRootPath("ReplicatedStorage.", game) !== undefined) throw new Error("lookup trailing");
if (lookupRootPath("ReplicatedStorage..", game) !== undefined) throw new Error("lookup doubled");
if (lookupRootPath(".ReplicatedStorage", game) !== undefined) throw new Error("lookup leading");
if (lookupRootPath("ReplicatedStorage..Stories", game) !== undefined) throw new Error("lookup gap");
const resolve = (path) => lookupRootPath(path, game);
if (rootPathIssue("  ", [], resolve) !== "") throw new Error("issue empty");
if (rootPathIssue("ReplicatedStorage.Stories", ["ReplicatedStorage.Stories"], resolve) !== "Already added") throw new Error("issue dupe");
if (rootPathIssue("ServerStorage", [], resolve) !== "Already added") throw new Error("issue built-in");
if (rootPathIssue("Replicatedtss", [], resolve) !== "Not found") throw new Error("issue missing");
if (rootPathIssue(" ReplicatedStorage.Stories ", [], resolve) !== undefined) throw new Error("issue valid");
if (rootPathIssue("ReplicatedStorage", [], resolve) !== "Already added") throw new Error("issue service");
if (rootPathIssue("ReplicatedStorage.", [], resolve) !== "Not found") throw new Error("issue trailing");
if (rootPathIssue("ReplicatedStorage..", [], resolve) !== "Not found") throw new Error("issue doubled");
if (rootPathIssue(".ReplicatedStorage", [], resolve) !== "Not found") throw new Error("issue leading");
if (rootPathIssue("ReplicatedStorage..Stories", [], resolve) !== "Not found") throw new Error("issue gap");
console.log("story roots ok");
