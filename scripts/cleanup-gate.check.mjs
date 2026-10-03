globalThis.typeOf = (value) => typeof value;
const { createCleanupGate, readTemplateResult } = await import("../src/packages/ui/template/cleanupGate.ts");

let calls = 0;
const gate = createCleanupGate();
const first = () => {
	calls += 1;
};
const second = () => {
	calls += 10;
};
gate.replace(first);
gate.replace(second);
if (calls !== 1) throw new Error(`replace ran cleanup ${calls} times`);
gate.dispose();
if (calls !== 11) throw new Error(`dispose ran cleanup ${calls}`);
gate.dispose();
if (calls !== 11) throw new Error(`second dispose ran cleanup ${calls}`);

const parsed = readTemplateResult("element", () => {});
if (parsed.element !== "element" || typeof parsed.cleanup !== "function") {
	throw new Error("tuple result was not kept");
}
const elementOnly = readTemplateResult("only", undefined);
if (elementOnly.cleanup !== undefined) throw new Error("element-only result invented a cleanup");
let rejected = false;
try {
	readTemplateResult("x", "nope");
} catch {
	rejected = true;
}
if (!rejected) throw new Error("non-function cleanup was accepted");

console.log("cleanup gate ok");
