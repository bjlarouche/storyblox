String.prototype.size = function size() {
	return this.length;
};
Array.prototype.size = function size() {
	return this.length;
};

const { storyBranches, parseFavorites, toggleFavorite, favoriteBranch, adoptTree } = await import("../src/packages/ui/storiesSidebar/storyTree.ts");

const click = () => {};
const icons = { folder: "folder", story: "story", starred: "star" };
const branches = storyBranches(
	[
		{ title: "Layout/Controls", onClick: click },
		{ title: "Examples/Button/Secondary", onClick: click },
		{ title: "Examples/Button/Primary", onClick: click },
	],
	icons,
);

if (branches.map((branch) => branch.title).join() !== "Examples,Layout") throw new Error("branch order");
if (branches.some((branch) => branch.icon !== "folder")) throw new Error("branch icon");

const layout = branches.find((branch) => branch.title === "Layout");
if (layout?.leaves?.[0]?.title !== "Controls") throw new Error("component row");
if (layout.leaves[0].icon !== "story") throw new Error("story icon");

const examples = branches.find((branch) => branch.title === "Examples");
const button = examples?.branches?.find((branch) => branch.title === "Button");
if (button?.icon !== "folder") throw new Error("nested branch icon");
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
	["Examples/Button/Primary", "Layout/Controls"],
	icons,
);
if (fav?.title !== "Starred" || fav.icon !== "star") throw new Error("starred branch");
if (fav.leaves[0]?.title !== "Examples/Button/Primary" || fav.leaves[1]?.title !== "Layout/Controls") {
	throw new Error("starred keeps saved order");
}
if (favoriteBranch([{ title: "Layout/Controls", onClick: click }], ["Missing/Story"], icons) !== undefined) {
	throw new Error("missing favorite");
}

const held = { title: "STORIES", branches: [] };
const adopted = adoptTree(held, { title: "STORIES", branches: fav ? [fav] : [] });
if (adopted !== held || held.branches[0]?.title !== "Starred") throw new Error("adopt tree");
if (adoptTree(undefined, held) !== held) throw new Error("fresh tree");

console.log("story tree ok");
