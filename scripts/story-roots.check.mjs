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

const {
	DEFAULT_STORY_ROOTS,
	STORY_ROOT_CLASSES,
	parseRootList,
	encodeRootList,
	collapseRootPaths,
	mergeStoryRootPaths,
	splitRootPath,
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
if (collapseRootPaths(["ServerStorage.StorybloxPlugin.stories", "ServerStorage"]).join(",") !== "ServerStorage") {
	throw new Error("nested plugin folder");
}
const merged = mergeStoryRootPaths(["ReplicatedStorage.UI", "Workspace.Stories"]);
if (merged.join(",") !== "ReplicatedStorage,ServerStorage,StarterPlayer.StarterPlayerScripts,Workspace.Stories") {
	throw new Error(`merge ${merged}`);
}
console.log("story roots ok");
