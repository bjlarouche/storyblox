globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pairs = (record) => Object.keys(record).map((key) => [key, record[key]]);
globalThis.math = { huge: Infinity };
globalThis.tostring = (value) => String(value);
globalThis.tonumber = (text) => {
	if (typeof text !== "string" || text.trim() === "") return undefined;
	const value = Number(text);
	return Number.isFinite(value) ? value : undefined;
};
String.prototype.size = function size() {
	return this.length;
};

String.prototype.sub = function sub(start, finish) {
	const len = this.length;
	const from = start < 0 ? len + start : start - 1;
	const to = finish === undefined ? len : finish < 0 ? len + finish + 1 : finish;
	return this.slice(from, to);
};

const { copyArgs, patchArg, omitArg, applyArg, commitNumberText, choiceOptions, assetText, assetId } = await import(
	"../src/packages/ui/template/storyArgs.ts"
);

const source = { label: "Primary", disabled: false };
const copied = copyArgs(source);
copied.label = "Other";
if (source.label !== "Primary") throw new Error("defaults mutated");

const patched = patchArg(copied, "disabled", true);
if (patched.disabled !== true || copied.disabled !== false) throw new Error("patch");
if (copyArgs(undefined).label !== undefined) throw new Error("empty");

const present = applyArg({}, "disabled", false);
if (present.disabled !== false) throw new Error("false is a value");
const absent = applyArg(present, "disabled", undefined);
if (absent.disabled !== undefined || Object.hasOwn(absent, "disabled")) throw new Error("absence");
if (omitArg({ count: 1, label: "A" }, "count").count !== undefined) throw new Error("omit");
if (commitNumberText("nope") !== undefined || commitNumberText("") !== undefined || commitNumberText("12a") !== undefined) {
	throw new Error("invalid draft");
}
if (commitNumberText("3") !== 3) throw new Error("number draft");

const choices = choiceOptions(["contained", { label: "Outlined", value: "outlined" }, { label: "Text" }]);
if (choices[0]?.value !== "contained" || choices[0]?.label !== "contained") throw new Error("string choice");
if (choices[1]?.value !== "outlined" || choices[1]?.label !== "Outlined") throw new Error("labeled choice");
if (choices[2]?.value !== "Text" || choices[2]?.label !== "Text") throw new Error("label only");
if (choiceOptions(undefined).length !== 0) throw new Error("empty choices");

if (assetText(123) !== "123" || assetText("rbxassetid://9") !== "rbxassetid://9" || assetText(undefined) !== "") {
	throw new Error("asset text");
}
if (assetId("123") !== 123 || assetId("rbxassetid://9") !== 9) throw new Error("asset id");
if (assetId("-1") !== undefined || assetId("1.5") !== undefined || assetId("nope") !== undefined) {
	throw new Error("asset id reject");
}

console.log("story args ok");
