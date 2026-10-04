Array.prototype.size = function size() {
	return this.length;
};

const { createActionLog, runSetup, wrapStory } = await import("../src/packages/storyActions.ts");

const log = createActionLog(2);
log.record("click", "a");
log.record("click", "b");
log.record("press", 3);
if (log.events.length !== 2 || log.events[0].name !== "click" || log.events[0].values[0] !== "b" || log.events[1].values[0] !== 3) {
	throw new Error("action cap");
}
log.reset();
if (log.events.length !== 0) throw new Error("action reset");

const other = createActionLog();
other.record("only");
if (log.events.length !== 0 || other.events.length !== 1) throw new Error("provider isolation");

const order = [];
let threw = false;
try {
	runSetup((tools) => {
		tools.onCleanup(() => order.push("a"));
		tools.onCleanup(() => {
			order.push("b");
			throw new Error("b");
		});
		throw new Error("setup failed");
	});
} catch {
	threw = true;
}
if (!threw || order.join(",") !== "b,a") throw new Error(`failing setup ${order.join(",")}`);

const done = runSetup((tools) => {
	tools.onCleanup(() => order.push("c"));
});
done();
if (order.join(",") !== "b,a,c") throw new Error("cleanup");

const render = wrapStory(
	(args) => `story:${args.label}`,
	[(inner) => (args) => `A(${inner(args)})`, (inner) => (args) => `B(${inner(args)})`],
);
if (render({ label: "Hi" }) !== "A(B(story:Hi))") throw new Error("decorators");

console.log("story actions ok");
