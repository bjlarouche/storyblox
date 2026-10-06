Array.prototype.size = function size() {
	return this.length;
};
String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	return this.slice(start - 1, finish);
};
String.prototype.lower = function lower() {
	return this.toLowerCase();
};
String.prototype.gsub = function gsub(pattern, replacement) {
	if (pattern === ",") return [this.split(",").join(replacement), 0];
	return [this.replace(new RegExp(pattern, "g"), replacement), 0];
};
globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);

const { normalizeTags, parseTagList, storyHasTag, filterStoriesByTags } = await import("../src/packages/storyTags.ts");

if (normalizeTags(["Dev", "", 1, " WIP "]).join(",") !== "dev,wip") throw new Error("normalize");
if (parseTagList("Dev, WIP,").join(",") !== "dev,wip") throw new Error("parse commas");
if (parseTagList("dev wip").join(",") !== "dev,wip") throw new Error("parse spaces");
if (parseTagList("").join(",") !== "" || parseTagList(undefined).join(",") !== "") throw new Error("parse empty");
if (!storyHasTag(["Dev", "wip"], "WIP") || storyHasTag(["dev"], "missing")) throw new Error("has");
if (storyHasTag(undefined, "dev") || storyHasTag(["dev"], "de")) throw new Error("exact only");

const stories = [
	{ title: "A", tags: ["dev"] },
	{ title: "B", tags: ["wip"] },
	{ title: "C", tags: ["Dev", "stable"] },
	{ title: "D" },
];
const included = filterStoriesByTags(stories, ["DEV"], undefined).map((s) => s.title);
if (included.join(",") !== "A,C") throw new Error(`include ${included}`);
const excluded = filterStoriesByTags(stories, undefined, ["WIP"]).map((s) => s.title);
if (excluded.join(",") !== "A,C,D") throw new Error(`exclude ${excluded}`);
const both = filterStoriesByTags(stories, ["dev"], ["stable"]).map((s) => s.title);
if (both.join(",") !== "A") throw new Error(`both ${both}`);
const bothHit = filterStoriesByTags(stories, ["dev"], ["dev"]).map((s) => s.title);
if (bothHit.join(",") !== "") throw new Error(`exclude wins ${bothHit}`);
const none = filterStoriesByTags(stories, [], undefined).map((s) => s.title);
if (none.join(",") !== "A,B,C,D") throw new Error("empty include keeps all");
const cleared = filterStoriesByTags(stories, undefined, undefined).map((s) => s.title);
if (cleared.join(",") !== "A,B,C,D") throw new Error("clear keeps all");
const noMatch = filterStoriesByTags(stories, ["missing"], undefined).map((s) => s.title);
if (noMatch.join(",") !== "") throw new Error("no results");
const untagged = filterStoriesByTags(stories, undefined, ["dev"]).map((s) => s.title);
if (untagged.join(",") !== "B,D") throw new Error(`untagged stay ${untagged}`);

console.log("story tags ok");
