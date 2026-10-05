String.prototype.size = function size() {
	return this.length;
};
Array.prototype.size = function size() {
	return this.length;
};

const { storyBranches, parseFavorites, toggleFavorite, favoriteBranch, adoptTree } = await import("../src/packages/ui/storiesSidebar/storyTree.ts");

const click = () => {};
const icons = { folder: "folder", component: "component", story: "story" };
const branches = storyBranches(
	[
		{ title: "Layout/Controls", onClick: click },
		{ title: "Examples/Button/Primary", onClick: click },
		{ title: "Examples/Button/Secondary", onClick: click },
	],
	icons,
);

const layout = branches.find((branch) => branch.title === "Layout");
if (layout?.icon !== "component" || layout.leaves?.[0]?.title !== "Controls") {
	throw new Error("component row");
}
if (layout.leaves[0].icon !== "story") throw new Error("story icon");

const examples = branches.find((branch) => branch.title === "Examples");
const button = examples?.branches?.find((branch) => branch.title === "Button");
if (examples?.icon !== "folder") throw new Error("folder icon");
if (button?.icon !== "component") throw new Error("nested component");
const titles = (button?.leaves ?? []).map((leaf) => leaf.title);
if (titles[0] !== "Primary" || titles[1] !== "Secondary") throw new Error("nested stories");

if (parseFavorites(undefined).length !== 0 || parseFavorites("").length !== 0) throw new Error("empty favorites");
const starred = toggleFavorite(toggleFavorite(parseFavorites("Layout/Controls"), "Examples/Button/Primary"), "Layout/Controls");
if (starred.length !== 1 || starred[0] !== "Examples/Button/Primary") throw new Error("toggle favorite");
const fav = favoriteBranch(
	[
		{ title: "Layout/Controls", onClick: click },
		{ title: "Examples/Button/Primary", onClick: click },
	],
	starred,
	icons,
);
if (fav?.title !== "Favorites" || fav.leaves[0]?.title !== "Examples/Button/Primary" || fav.icon !== "folder") {
	throw new Error("favorites branch");
}
if (favoriteBranch([{ title: "Layout/Controls", onClick: click }], ["Missing/Story"], icons) !== undefined) {
	throw new Error("missing favorite");
}

const held = { title: "STORIES", branches: [] };
const adopted = adoptTree(held, { title: "STORIES", branches: fav ? [fav] : [] });
if (adopted !== held || held.branches[0]?.title !== "Favorites") throw new Error("adopt tree");
if (adoptTree(undefined, held) !== held) throw new Error("fresh tree");

console.log("story tree ok");
