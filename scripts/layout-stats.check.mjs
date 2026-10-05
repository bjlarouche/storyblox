globalThis.typeOf = (value) => {
	if (value !== null && typeof value === "object" && value.__type) return value.__type;
	return typeof value === "object" && value !== null ? "table" : typeof value;
};
Array.prototype.size = function size() {
	return this.length;
};
String.prototype.size = function size() {
	return this.length;
};

class FakeVec {
	constructor(x, y) {
		this.X = x;
		this.Y = y;
	}
}

function gui(name, x, y, w, h, extra = {}) {
	const node = {
		Name: name,
		AbsolutePosition: new FakeVec(x, y),
		AbsoluteSize: new FakeVec(w, h),
		GetFullName: () => name,
		IsA: (className) => {
			if (className === "GuiObject") return true;
			if (className === "TextLabel") return extra.text !== undefined;
			return false;
		},
		Text: extra.text ?? "",
		TextFits: extra.textFits ?? true,
		GetDescendants: () => node._kids.flatMap((kid) => [kid, ...kid.GetDescendants()]),
		_kids: [],
	};
	return node;
}

const { collectLayoutStats } = await import("../src/fixtures/automation/layoutStats.ts");

const root = gui("Root", 0, 0, 400, 300);
const zero = gui("Zero", 10, 10, 0, 20);
const off = gui("Off", 500, 10, 40, 20);
const a = gui("A", 10, 10, 80, 20, { text: "Hello", textFits: false });
const b = gui("B", 40, 10, 80, 20, { text: "World", textFits: true });
root._kids.push(zero, off, a, b);

const stats = collectLayoutStats(root, new FakeVec(400, 300));
if (stats.guiObjects !== 4) throw new Error(`guiObjects ${stats.guiObjects}`);
if (!stats.issues.some((issue) => issue.kind === "zero-size")) throw new Error("zero-size");
if (!stats.issues.some((issue) => issue.kind === "offscreen")) throw new Error("offscreen");
if (!stats.issues.some((issue) => issue.kind === "text-overflow")) throw new Error("text-overflow");
if (!stats.issues.some((issue) => issue.kind === "text-overlap")) throw new Error("text-overlap");
console.log("layout stats ok");
