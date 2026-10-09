import { readFileSync } from "node:fs";
import { join } from "node:path";

Array.prototype.size = function () {
	return this.length;
};
const nativeSort = Array.prototype.sort;
Array.prototype.sort = function (less) {
	return nativeSort.call(this, less ? (a, b) => (less(a, b) ? -1 : less(b, a) ? 1 : 0) : undefined);
};

const { createCaseClock, createSeed, pointerClick, runCase, MAX_CASE_FAILURES } = await import("../src/packages/storyCases.ts");

const clock = createCaseClock();
const order = [];
clock.after(2, () => order.push("late"));
clock.after(1, () => order.push("early"));
clock.advance(0.5);
if (order.length !== 0) throw new Error("timer ran early");
clock.advance(2);
if (order.join(",") !== "early,late") throw new Error("timer order");
clock.after(1, () => order.push("cancelled"));
clock.cancel();
clock.advance(5);
if (order.includes("cancelled")) throw new Error("cancel");

const a = createSeed(7);
const b = createSeed(7);
const first = [a(), a(), a()];
if (first.join() !== [b(), b(), b()].join()) throw new Error("seed repeat");
if (first.some((value) => value < 0 || value >= 1)) throw new Error("seed range");

let clicks = 0;
const pass = runCase(
	"click",
	(env) => {
		env.onClick();
		env.expect(clicks === 1, "clicked once");
	},
	{ onClick: () => clicks++ },
	() => false,
);
if (!pass.passed || pass.failures.length !== 0) throw new Error("passing case");

const fail = runCase(
	"many",
	(env) => {
		for (let i = 0; i < 40; i++) env.expect(false, `miss ${i}`);
	},
	{},
	() => false,
);
if (fail.passed || fail.failures.length !== MAX_CASE_FAILURES) throw new Error("bounded failures");

const thrown = runCase("boom", () => {
	throw "bad";
}, {}, () => false);
if (thrown.failures[0] !== "threw: bad") throw new Error("thrown case");

const stale = runCase("stale", () => {}, {}, () => true);
if (stale.passed || stale.failures[0] !== "cancelled") throw new Error("cancelled case");

const presses = [];
const button = {
	IsA: (className) => className === "GuiButton",
	AbsolutePosition: { X: 10, Y: 20 },
	AbsoluteSize: { X: 8, Y: 4 },
};
if (!pointerClick(button, (x, y, down) => presses.push([x, y, down]))) throw new Error("click button");
if (presses.join(";") !== "14,22,true;14,22,false") throw new Error("click point");
if (pointerClick({ IsA: () => false, AbsolutePosition: { X: 0, Y: 0 }, AbsoluteSize: { X: 1, Y: 1 } }, () => presses.push("no"))) {
	throw new Error("click ignores frames");
}
const template = readFileSync(join(process.cwd(), "src/packages/ui/template/components/Template.tsx"), "utf8");
if (!template.includes("pointerClick(") || !template.includes("VirtualInputManager")) throw new Error("click wiring");
if (!readFileSync(join(process.cwd(), "src/packages/storyCases.ts"), "utf8").includes("IsA(className: string): boolean")) {
	throw new Error("IsA must be a method so it compiles to a colon call");
}

console.log("story cases ok");
