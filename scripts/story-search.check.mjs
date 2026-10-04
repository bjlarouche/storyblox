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

const { storyMatches } = await import("../src/packages/ui/storiesSidebar/storySearch.ts");

if (!storyMatches("Inputs/Button/Primary", "button")) throw new Error("deep segment");
if (!storyMatches("Fixture/Styled", "xture")) throw new Error("cross-segment");
if (storyMatches("Fixture/Styled", "missing")) throw new Error("no match");
if (!storyMatches("Fixture/Styled", "sTyLeD")) throw new Error("case");
if (!storyMatches("Fixture/Styled", "")) throw new Error("empty query");

console.log("story search ok");
