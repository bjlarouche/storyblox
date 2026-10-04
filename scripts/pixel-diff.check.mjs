Array.prototype.size = function size() {
	return this.length;
};

const { pixelDiff } = await import("../src/packages/pixelDiff.ts");

const same = pixelDiff([1, 2, 3], [1, 2, 3]);
if (same.error || same.ratio !== 0) throw new Error("identical");
const changed = pixelDiff([0, 0, 0], [0, 9, 0]);
if (changed.error || changed.changed !== 1 || Math.abs(changed.ratio - 1 / 3) > 0.0001) throw new Error("one channel");
if (!pixelDiff([1], [1, 2]).error) throw new Error("size mismatch");
console.log("pixel diff ok");
