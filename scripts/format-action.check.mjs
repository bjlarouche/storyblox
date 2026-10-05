Array.prototype.size = function size() {
	return this.length;
};
globalThis.typeOf = (value) => {
	if (value === null || value === undefined) return "nil";
	if (typeof value === "string") return "string";
	if (typeof value === "number") return "number";
	if (typeof value === "boolean") return "boolean";
	if (typeof value === "function") return "function";
	if (typeof value === "object") return "table";
	return typeof value;
};
globalThis.tostring = (value) => String(value);

const { formatActionLine, formatActionValue } = await import("../src/packages/formatAction.ts");

if (formatActionValue(undefined) !== "nil") throw new Error("nil");
if (formatActionValue("hi") !== "hi") throw new Error("string");
if (formatActionValue(3) !== "3") throw new Error("number");
if (formatActionValue(true) !== "true") throw new Error("boolean");
if (formatActionValue(() => {}) !== "function") throw new Error("function");
if (formatActionValue({ a: 1 }) !== "table") throw new Error("table");

const line = formatActionLine({ name: "click", values: ["ok", 2] });
if (line !== "click(ok, 2)") throw new Error(`line ${line}`);
if (formatActionLine({ name: "press", values: [] }) !== "press") throw new Error("bare");

console.log("format action ok");
