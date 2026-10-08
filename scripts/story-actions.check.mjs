import { readFileSync } from "node:fs";
import { join } from "node:path";

Array.prototype.size = function size() {
	return this.length;
};
globalThis.typeOf = (value) => (typeof value === "function" ? "function" : typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pairs = (record) => Object.entries(record);

const { bindActionArgs, createActionLog, runSetup, wrapStory } = await import("../src/packages/storyActions.ts");

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

const events = [];
const original = () => "ok";
const bound = bindActionArgs({ label: "Hi", onClick: original, nested: { onClick: original } }, (name, ...values) => {
	events.push([name, ...values]);
});
if (bound.label !== "Hi" || bound.nested.onClick !== original) throw new Error("non-function args");
if (bound.onClick === original || bound.onClick("a") !== "ok" || events.length !== 1 || events[0][0] !== "onClick" || events[0][1] !== "a") {
	throw new Error("callback log");
}
if (bindActionArgs("nope", () => {}) !== "nope") throw new Error("non-table args");

const render = wrapStory(
	(args) => `story:${args.label}`,
	[(inner) => (args) => `A(${inner(args)})`, (inner) => (args) => `B(${inner(args)})`],
);
if (render({ label: "Hi" }) !== "A(B(story:Hi))") throw new Error("decorators");

const template = readFileSync(join(process.cwd(), "src/packages/ui/template/components/Template.tsx"), "utf8");
if (!template.includes("bindActionArgs(args, actionApi.record)")) throw new Error("template wiring");
const fixture = readFileSync(join(process.cwd(), "src/fixtures/stories/Actions.stories.tsx"), "utf8");
if (!fixture.includes("args.onClick?.()") || !fixture.includes("features: { actions: true }")) throw new Error("callback fixture");

console.log("story actions ok");
