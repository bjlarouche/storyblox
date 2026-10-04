String.prototype.size = function size() {
	return this.length;
};
Array.prototype.size = function size() {
	return this.length;
};

const { storyBranches, parseFavorites, toggleFavorite, favoriteBranch } = await import("../src/packages/ui/storiesSidebar/storyTree.ts");

const click = () => {};
const icons = { folder: "folder", component: "component", story: "story" };
const branches = storyBranches(
	[
		{ title: "Fixture/Styled", onClick: click },
		{ title: "Inputs/Button/Primary", onClick: click },
		{ title: "Inputs/Button/Secondary", onClick: click },
	],
	icons,
);

const fixture = branches.find((branch) => branch.title === "Fixture");
if (fixture?.icon !== "component" || fixture.leaves?.[0]?.title !== "Styled") {
	throw new Error("component row");
}
if (fixture.leaves[0].icon !== "story") throw new Error("story icon");

const inputs = branches.find((branch) => branch.title === "Inputs");
const button = inputs?.branches?.find((branch) => branch.title === "Button");
if (inputs?.icon !== "folder") throw new Error("folder icon");
if (button?.icon !== "component") throw new Error("nested component");
const titles = (button?.leaves ?? []).map((leaf) => leaf.title);
if (titles[0] !== "Primary" || titles[1] !== "Secondary") throw new Error("nested stories");

if (parseFavorites(undefined).length !== 0 || parseFavorites("").length !== 0) throw new Error("empty favorites");
const starred = toggleFavorite(toggleFavorite(parseFavorites("Fixture/Styled"), "Inputs/Button/Primary"), "Fixture/Styled");
if (starred.length !== 1 || starred[0] !== "Inputs/Button/Primary") throw new Error("toggle favorite");
const fav = favoriteBranch(
	[
		{ title: "Fixture/Styled", onClick: click },
		{ title: "Inputs/Button/Primary", onClick: click },
	],
	starred,
	icons,
);
if (fav?.title !== "Favorites" || fav.leaves[0]?.title !== "Inputs/Button/Primary" || fav.icon !== "folder") {
	throw new Error("favorites branch");
}
if (favoriteBranch([{ title: "Fixture/Styled", onClick: click }], ["Missing/Story"], icons) !== undefined) {
	throw new Error("missing favorite");
}

console.log("story tree ok");
