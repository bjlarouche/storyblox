const { createStorySession, keepSelection } = await import("../src/packages/ui/storyblox/storyRegistry.ts");

const picked = { title: "Fixture/React", n: 1 };
const reloaded = { title: "Fixture/React", n: 2 };
if (keepSelection(picked, reloaded) !== reloaded) throw new Error("reload dropped the selected story");
if (keepSelection(picked, { title: "Fixture/Native" }) !== picked) throw new Error("another story stole selection");
if (keepSelection(undefined, reloaded, "Fixture/React") !== reloaded) throw new Error("persisted selection was ignored");
if (keepSelection(undefined, { title: "Fixture/Native" }, "Fixture/React") !== undefined) {
	throw new Error("non-persisted story was selected");
}

let stories = [];
const session = createStorySession((apply) => {
	stories = apply(stories);
});
session.upsert({ title: "Button/Base", n: 1 });
session.upsert({ title: "Button/Base", n: 2 });
session.upsert({ title: "Other/One", n: 3 });
if (stories.length !== 2 || stories[0].n !== 2 || stories[1].n !== 3) {
	throw new Error(`duplicate title was not replaced: ${JSON.stringify(stories)}`);
}
session.remove("Button/Base");
if (stories.length !== 1 || stories[0].title !== "Other/One") {
	throw new Error(`remove left ${JSON.stringify(stories)}`);
}
console.log("story registry ok");
