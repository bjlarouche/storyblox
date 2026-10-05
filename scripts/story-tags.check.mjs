Array.prototype.size = function size() {
	return this.length;
};
String.prototype.size = function size() {
	return this.length;
};
globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);

const { normalizeTags, parseTagList, storyHasTag, filterStoriesByTags } = await import("../src/packages/storyTags.ts");

if (normalizeTags(["dev", "", 1, "wip"]).join(",") !== "dev,wip") throw new Error("normalize");
if (parseTagList("dev,wip,").join(",") !== "dev,wip") throw new Error("parse");
if (!storyHasTag(["dev", "wip"], "wip") || storyHasTag(["dev"], "missing")) throw new Error("has");

const stories = [
	{ title: "A", tags: ["dev"] },
	{ title: "B", tags: ["wip"] },
	{ title: "C", tags: ["dev", "stable"] },
	{ title: "D" },
];
const included = filterStoriesByTags(stories, ["dev"], undefined).map((s) => s.title);
if (included.join(",") !== "A,C") throw new Error(`include ${included}`);
const excluded = filterStoriesByTags(stories, undefined, ["wip"]).map((s) => s.title);
if (excluded.join(",") !== "A,C,D") throw new Error(`exclude ${excluded}`);
const both = filterStoriesByTags(stories, ["dev"], ["stable"]).map((s) => s.title);
if (both.join(",") !== "A") throw new Error(`both ${both}`);
const none = filterStoriesByTags(stories, [], undefined).map((s) => s.title);
if (none.join(",") !== "A,B,C,D") throw new Error("empty include keeps all");

console.log("story tags ok");
