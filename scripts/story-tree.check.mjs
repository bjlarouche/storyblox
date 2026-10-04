String.prototype.size = function size() {
	return this.length;
};
Array.prototype.size = function size() {
	return this.length;
};

const { storyBranches } = await import("../src/packages/ui/storiesSidebar/storyTree.ts");

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

console.log("story tree ok");
