String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	const len = this.length;
	const from = start < 0 ? len + start : start - 1;
	const to = finish === undefined ? len : finish < 0 ? len + finish + 1 : finish;
	return this.slice(from, to);
};
String.prototype.upper = function upper() {
	return this.toUpperCase();
};
Array.prototype.size = function size() {
	return this.length;
};

const { storyMatches, searchStories, splitStoryTitle, stepSearchIndex } = await import(
	"../src/packages/ui/storiesSidebar/storySearch.ts"
);

if (!storyMatches("Examples/Button", "button")) throw new Error("deep segment");
if (!storyMatches("Examples/Styled Labels", "es/st")) throw new Error("cross-segment");
if (storyMatches("Examples/Styled Labels", "missing")) throw new Error("no match");
if (!storyMatches("Examples/Styled Labels", "sTyLeD")) throw new Error("case");
if (!storyMatches("Examples/Styled Labels", "")) throw new Error("empty query");

const split = splitStoryTitle("Inputs/Button/Primary");
if (split.leaf !== "Primary" || split.breadcrumb !== "Inputs/Button") throw new Error("split path");
if (splitStoryTitle("Solo").breadcrumb !== "") throw new Error("solo breadcrumb");

const hits = searchStories(["Inputs/Button/Primary", "Fixture/Styled", "Other/Skip"], "button");
if (hits.size() !== 1 || hits[0].leaf !== "Primary" || hits[0].title !== "Inputs/Button/Primary") {
	throw new Error("structured hits");
}
if (searchStories(["Fixture/Styled"], "").size() !== 0) throw new Error("empty query yields no hits");

if (stepSearchIndex(0, -1, 3) !== 2) throw new Error("wrap up");
if (stepSearchIndex(2, 1, 3) !== 0) throw new Error("wrap down");
if (stepSearchIndex(1, 1, 0) !== 0) throw new Error("empty step");

console.log("story search ok");
