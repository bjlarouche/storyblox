import { readFileSync } from "node:fs";
import { join } from "node:path";

String.prototype.size = function size() {
	return this.length;
};
String.prototype.sub = function sub(start, finish) {
	const len = this.length;
	const from = start < 0 ? len + start : start - 1;
	const to = finish === undefined ? len : finish < 0 ? len + finish + 1 : finish;
	return this.slice(from, to);
};
Array.prototype.size = function size() {
	return this.length;
};

const { storyBranches, parseFavorites, toggleFavorite, favoriteBranch, rememberRecent, adoptTree, orderedStoryTitles, stepStoryTitle, navStoryTitles, storyById } = await import(
	"../src/packages/ui/storiesSidebar/storyTree.ts"
);

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
const recent = rememberRecent(rememberRecent(["Layout/Controls"], "Examples/Button/Primary"), "Layout/Controls");
if (recent.join(",") !== "Layout/Controls,Examples/Button/Primary") throw new Error("recent order");
const capped = ["a", "b", "c", "d", "e", "f", "g", "h", "i"].reduce((list, title) => rememberRecent(list, title), []);
if (capped.length !== 8 || capped[0] !== "i" || capped.includes("a")) throw new Error("recent cap");
const recentBranch = favoriteBranch(
	[{ title: "Layout/Controls", onClick: click }],
	["Layout/Controls"],
	icons,
	"Recent",
);
if (recentBranch?.title !== "Recent" || recentBranch.icon !== "folder") throw new Error("recent branch");

const held = { title: "STORIES", branches: [] };
const adopted = adoptTree(held, { title: "STORIES", branches: fav ? [fav] : [] });
if (adopted !== held || held.branches[0]?.title !== "Starred") throw new Error("adopt tree");
if (adoptTree(undefined, held) !== held) throw new Error("fresh tree");

const order = orderedStoryTitles(branches);
if (order.join(",") !== "Examples/Button/Primary,Examples/Button/Secondary,Layout/Controls") {
	throw new Error(`story order ${order.join(",")}`);
}
if (stepStoryTitle(order, "Examples/Button/Primary", 1) !== "Examples/Button/Secondary") throw new Error("next story");
if (stepStoryTitle(order, "Layout/Controls", 1) !== "Examples/Button/Primary") throw new Error("wrap next");
if (stepStoryTitle(order, "Examples/Button/Primary", -1) !== "Layout/Controls") throw new Error("wrap previous");
if (stepStoryTitle(order, undefined, 1) !== "Examples/Button/Primary") throw new Error("first story");
if (stepStoryTitle([], "Layout/Controls", 1) !== undefined) throw new Error("empty stories");
const nav = navStoryTitles([{ title: "Layout/Controls" }, { title: "Plain" }, { title: "/Hidden" }, { title: "Examples/Button/Primary" }]);
if (nav.join(",") !== "Examples/Button/Primary,Layout/Controls,/Hidden,Plain") throw new Error(`loose nav ${nav.join(",")}`);
const looseTree = storyBranches(
	[
		{ title: "Layout/Controls", onClick: click },
		{ title: "Plain", onClick: click },
		{ title: "/Hidden", onClick: click },
		{ title: "Alpha", onClick: click },
	],
	icons,
);
if (looseTree.map((branch) => branch.title).join() !== "Alpha,Layout,Plain") throw new Error(`loose leaves ${looseTree.map((branch) => branch.title).join()}`);
const plain = looseTree.find((branch) => branch.title === "Plain");
if (plain?.icon !== "story" || plain.leaves.length !== 0 || plain.onClick !== click) throw new Error("plain leaf");
if (looseTree.some((branch) => branch.title === "/Hidden" || branch.title === "Hidden")) throw new Error("slash title stays out");

const root = process.cwd();
const sidebar = readFileSync(join(root, "src/packages/ui/storiesSidebar/components/StoriesSidebar.tsx"), "utf8");
const storyblox = readFileSync(join(root, "src/packages/ui/storyblox/components/Storyblox.tsx"), "utf8");
if (!sidebar.includes("KeyCode.LeftAlt") || !sidebar.includes("stepStoryTitle")) throw new Error("keyboard nav");
if (!storyblox.includes('key="CopyId"') || !storyblox.includes("copyText") || !storyblox.includes('key="CopyIdBox"')) {
	throw new Error("copy id");
}
if (!storyblox.includes('key="OpenId"') || !storyblox.includes("storyById")) throw new Error("open id");
if (!storyblox.includes("storyblox-recent") || !storyblox.includes("rememberRecent") || !sidebar.includes('"Recent"')) {
	throw new Error("recent list");
}
const remember = readFileSync(join(root, "plugin/remember.luau"), "utf8");
const devShell = readFileSync(join(root, "plugin/shell/init.server.luau"), "utf8");
const releaseShell = readFileSync(join(root, "plugin/shell-release/init.server.luau"), "utf8");
for (const attr of ["storyblox-recent", "storyblox-include-tags", "storyblox-exclude-tags"]) {
	if (!remember.includes(attr)) throw new Error(`remember ${attr}`);
}
if (!remember.includes("GetSetting") || !remember.includes("SetSetting")) throw new Error("remember settings");
if (!devShell.includes('WaitForChild("remember")') || !releaseShell.includes('WaitForChild("remember")')) {
	throw new Error("shell remember");
}
if (readFileSync(join(root, "plugin/host/init.luau"), "utf8").includes("storyblox-recent")) throw new Error("host recent");
const listed = [
	{ title: "Shell/Actions", id: "shell-actions" },
	{ title: "Shell/Docs" },
];
if (storyById(listed, "  Shell/Actions ")?.title !== "Shell/Actions") throw new Error("open by title");
if (storyById(listed, "shell-actions")?.title !== "Shell/Actions") throw new Error("open by id");
if (storyById(listed, "missing") !== undefined || storyById(listed, "  ") !== undefined) throw new Error("open miss");
if (!readFileSync(join(root, "src/packages/ui/template/components/ErrorPanel.tsx"), "utf8").includes("export function selectText")) {
	throw new Error("copy fallback");
}

console.log("story tree ok");
