globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pairs = (record) => Object.keys(record).map((key) => [key, record[key]]);

const { copyArgs, patchArg } = await import("../src/packages/ui/template/storyArgs.ts");

const source = { label: "Primary", disabled: false };
const copied = copyArgs(source);
copied.label = "Other";
if (source.label !== "Primary") throw new Error("defaults mutated");

const patched = patchArg(copied, "disabled", true);
if (patched.disabled !== true || copied.disabled !== false) throw new Error("patch");
if (copyArgs(undefined).label !== undefined) throw new Error("empty");

console.log("story args ok");
