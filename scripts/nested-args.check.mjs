globalThis.typeOf = (value) => {
	if (value !== null && typeof value === "object" && value.__type) return value.__type;
	if (typeof value === "function") return "function";
	return typeof value === "object" && value !== null ? "table" : typeof value;
};
globalThis.pairs = (record) => Object.keys(record).map((key) => [key, record[key]]);
Array.prototype.size = function size() {
	return this.length;
};
Array.prototype.insert = function insert(index, value) {
	this.splice(index, 0, value);
};
Array.prototype.remove = function remove(index) {
	this.splice(index, 1);
};

const {
	copyTree,
	patchField,
	resetBranch,
	insertItem,
	removeItem,
	moveItem,
	switchUnion,
	readOnlyKind,
	registerControlEditor,
	mountControlEditor,
} = await import("../src/packages/nestedArgs.ts");

const original = { user: { name: "A" }, other: 1 };
const patched = patchField(original, "user", patchField(original.user, "name", "B"));
if (original.user.name !== "A" || patched.user.name !== "B" || patched.other !== 1) throw new Error("immutable patch");

const defaults = { items: ["a"], label: "keep" };
const current = { items: ["b"], label: "keep" };
const reset = resetBranch(current, defaults, "items");
reset.items.push("c");
if (defaults.items.length !== 1 || defaults.items[0] !== "a" || reset.label !== "keep" || reset.items[1] !== "c") {
	throw new Error("branch reset");
}

const moved = moveItem(["a", "b", "c"], 0, 2);
if (moved.join(",") !== "b,c,a") throw new Error(`move ${moved.join(",")}`);
const removed = removeItem(moved, 1);
if (removed.join(",") !== "b,a") throw new Error("delete");
const added = insertItem(removed, 1, "d");
if (added.join(",") !== "b,d,a") throw new Error("add");
const keys = moveItem(["row-a", "row-b", "row-c"], 0, 2);
if (keys.join(",") !== "row-b,row-c,row-a") throw new Error("row identity");

const switched = switchUnion("kind", "square", { size: 2 });
if (switched.kind !== "square" || switched.size !== 2 || switched.radius !== undefined) throw new Error("union");

const fn = () => {};
if (readOnlyKind(fn) !== "function") throw new Error("function");
if (readOnlyKind({ __type: "Instance" }) !== "Instance") throw new Error("instance");
if (readOnlyKind({ getValue: () => 1 }) !== "binding") throw new Error("binding");
const copied = copyTree({ onClick: fn, label: "A" });
if (copied.onClick !== fn) throw new Error("function was copied by value");

let mounts = 0;
let cleaned = 0;
const unregister = registerControlEditor("label", () => {
	mounts += 1;
	return () => {
		cleaned += 1;
	};
});
mountControlEditor("label", "A", () => {})();
unregister();
mountControlEditor("label", "A", () => {})();
if (mounts !== 1 || cleaned !== 1) throw new Error("custom editor cleanup");

console.log("nested args ok");
