import { readFileSync } from "node:fs";
import { join } from "node:path";

Array.prototype.size = function size() {
	return this.length;
};
globalThis.typeOf = (value) => (typeof value === "function" ? "function" : typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pairs = (record) => Object.entries(record);
globalThis.tostring = (value) => String(value);
String.prototype.size = function size() {
	return this.length;
};

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
const plain = { label: "Hi" };
if (bindActionArgs(plain, () => {}) !== plain) throw new Error("unchanged identity");
const bound = bindActionArgs(
	{ label: "Hi", onClick: original, nested: { onClick: original }, group: { row: { onSelect: original } } },
	(name, ...values) => {
		events.push([name, ...values]);
	},
);
if (bound.label !== "Hi" || bound.nested.onClick === original || bound.group.row.onSelect === original) throw new Error("non-function args");
if (bound.onClick("a") !== "ok" || bound.nested.onClick("b") !== "ok" || bound.group.row.onSelect("c") !== "ok") {
	throw new Error("callback return");
}
if (events[0][0] !== "onClick" || events[0][1] !== "a" || events[1][0] !== "nested.onClick" || events[2][0] !== "group.row.onSelect" || events[2][1] !== "c") {
	throw new Error(`callback log ${JSON.stringify(events)}`);
}
const cyclic = { onClick: original };
cyclic.self = cyclic;
const wrappedCycle = bindActionArgs(cyclic, () => {});
if (wrappedCycle.onClick === original || wrappedCycle.self !== cyclic) throw new Error("cycle");
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
