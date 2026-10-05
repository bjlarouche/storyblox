globalThis.math = {
	...Math,
	floor: Math.floor,
};
globalThis.string = {
	format: (fmt, value) => {
		if (fmt === "%.1f") return Number(value).toFixed(1);
		return String(value);
	},
};

const { contrastRatio } = await import("../src/packages/a11yHeuristics.ts");

const black = { R: 0, G: 0, B: 0 };
const white = { R: 1, G: 1, B: 1 };
const ratio = contrastRatio(black, white);
if (ratio < 20) throw new Error(`contrast ${ratio}`);
const low = contrastRatio({ R: 0.5, G: 0.5, B: 0.5 }, { R: 0.55, G: 0.55, B: 0.55 });
if (low >= 3) throw new Error(`low ${low}`);

console.log("a11y heuristics ok");
