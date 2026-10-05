const kinds = new WeakMap();
globalThis.typeOf = (value) => {
	if (value !== null && typeof value === "object" && kinds.has(value)) return kinds.get(value);
	if (typeof value === "object" && value !== null) return "table";
	return typeof value;
};
globalThis.math = { huge: Infinity };
globalThis.tonumber = (text) => {
	if (typeof text !== "string" || text.trim() === "") return undefined;
	const value = Number(text);
	return Number.isFinite(value) ? value : undefined;
};
globalThis.pairs = (record) => Object.keys(record).map((key) => [key, record[key]]);

function asType(type, fields) {
	const value = fields;
	kinds.set(value, type);
	return value;
}

class Color3 {
	constructor(r, g, b) {
		this.R = r;
		this.G = g;
		this.B = b;
		kinds.set(this, "Color3");
	}
}
class Vector2 {
	constructor(x, y) {
		this.X = x;
		this.Y = y;
		kinds.set(this, "Vector2");
	}
}
class Vector3 {
	constructor(x, y, z) {
		this.X = x;
		this.Y = y;
		this.Z = z;
		kinds.set(this, "Vector3");
	}
}
class UDim {
	constructor(scale, offset) {
		this.Scale = scale;
		this.Offset = offset;
		kinds.set(this, "UDim");
	}
}
class UDim2 {
	constructor(xScale, xOffset, yScale, yOffset) {
		this.X = { Scale: xScale, Offset: xOffset };
		this.Y = { Scale: yScale, Offset: yOffset };
		kinds.set(this, "UDim2");
	}
}
class CFrame {
	static lookAt(at, target, up) {
		const frame = new CFrame(at.X, at.Y, at.Z);
		frame.LookVector = { X: target.X - at.X, Y: target.Y - at.Y, Z: target.Z - at.Z };
		frame.UpVector = up;
		return frame;
	}

	constructor(x, y, z) {
		this.X = x;
		this.Y = y;
		this.Z = z;
		kinds.set(this, "CFrame");
	}
}
globalThis.Color3 = Color3;
globalThis.Vector2 = Vector2;
globalThis.Vector3 = Vector3;
globalThis.UDim = UDim;
globalThis.UDim2 = UDim2;
globalThis.CFrame = CFrame;

const font = asType("EnumItem", { Name: "SourceSans", EnumType: { Name: "Font" } });
const regular = asType("EnumItem", { Name: "Regular", EnumType: { Name: "FontWeight" } });
const normal = asType("EnumItem", { Name: "Normal", EnumType: { Name: "FontStyle" } });
globalThis.Enum = {
	Font: { SourceSans: font },
	FontWeight: { Regular: regular },
	FontStyle: { Normal: normal },
};
globalThis.Font = class Font {
	constructor(family, weight, style) {
		this.Family = family;
		this.Weight = weight;
		this.Style = style;
		kinds.set(this, "Font");
	}
};
globalThis.ColorSequenceKeypoint = class ColorSequenceKeypoint {
	constructor(time, color) {
		this.Time = time;
		this.Value = color;
	}
};
globalThis.ColorSequence = class ColorSequence {
	constructor(keys) {
		this.Keypoints = keys;
		kinds.set(this, "ColorSequence");
	}
};
globalThis.NumberSequenceKeypoint = class NumberSequenceKeypoint {
	constructor(time, value, envelope = 0) {
		this.Time = time;
		this.Value = value;
		this.Envelope = envelope;
	}
};
globalThis.NumberSequence = class NumberSequence {
	constructor(keys) {
		this.Keypoints = keys;
		kinds.set(this, "NumberSequence");
	}
};

globalThis.BrickColor = class BrickColor {
	constructor(key) {
		const byName = {
			"Bright red": 21,
			"Bright blue": 23,
			"Medium stone grey": 194,
		};
		const byNumber = {
			21: "Bright red",
			23: "Bright blue",
			194: "Medium stone grey",
		};
		if (typeof key === "number" && key in byNumber) {
			this.Name = byNumber[key];
			this.Number = key;
		} else if (typeof key === "string" && key in byName) {
			this.Name = key;
			this.Number = byName[key];
		} else {
			this.Name = "Medium stone grey";
			this.Number = 194;
		}
		kinds.set(this, "BrickColor");
	}
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
Array.prototype.size = function size() {
	return this.length;
};

const { encodeValue, encodeArgs, decodeValue, formatDatatype, parseDatatype } = await import("../src/packages/argCodec.ts");

function roundTrip(value, spec) {
	const encoded = encodeValue(value, "field", spec);
	if (!encoded.ok) throw new Error(`encode ${typeOf(value)} ${encoded.error.reason}`);
	return decodeValue(encoded.value);
}

const color = asType("Color3", { R: 0.1, G: 0.2, B: 0.3 });
const decodedColor = roundTrip(color);
if (decodedColor.R !== 0.1 || decodedColor.G !== 0.2 || decodedColor.B !== 0.3) throw new Error("color");
const badColor = encodeValue(asType("Color3", { R: 2, G: 0, B: 0 }), "paint");
if (badColor.ok || badColor.error.path !== "paint" || badColor.error.reason !== "color") throw new Error("color validation");

const vector = asType("Vector3", { X: 1, Y: 2, Z: 3 });
const decodedVector = roundTrip(vector);
if (decodedVector.X !== 1 || decodedVector.Y !== 2 || decodedVector.Z !== 3) throw new Error("vector");

const udim = asType("UDim", { Scale: 0.5, Offset: 8 });
const decodedUdim = roundTrip(udim);
if (decodedUdim.Scale !== 0.5 || decodedUdim.Offset !== 8) throw new Error("udim");
const udim2 = asType("UDim2", { X: { Scale: 0.5, Offset: 1 }, Y: { Scale: 1, Offset: -2 } });
const decodedUdim2 = roundTrip(udim2);
if (decodedUdim2.X.Scale !== 0.5 || decodedUdim2.X.Offset !== 1 || decodedUdim2.Y.Scale !== 1 || decodedUdim2.Y.Offset !== -2) {
	throw new Error("udim2");
}

if (roundTrip(font) !== font) throw new Error("enum identity");
const missing = decodeValue({ kind: "enum", enumType: "Font", name: "Nope" });
if (missing !== undefined) throw new Error("missing enum");

const asset = encodeValue(123, "icon", { type: "asset" });
if (!asset.ok || asset.value.id !== 123 || decodeValue(asset.value) !== 123) throw new Error("asset");
const badAsset = encodeValue(-1, "icon", { type: "asset" });
if (badAsset.ok || badAsset.error.reason !== "asset") throw new Error("asset validation");

const frame = asType("CFrame", {
	X: 1,
	Y: 2,
	Z: 3,
	LookVector: { X: 0, Y: 0, Z: -1 },
	UpVector: { X: 0, Y: 1, Z: 0 },
});
const decodedFrame = roundTrip(frame);
if (decodedFrame.X !== 1 || decodedFrame.LookVector.Z !== -1 || decodedFrame.UpVector.Y !== 1) throw new Error("cframe");
const zeroLook = encodeValue(asType("CFrame", { X: 0, Y: 0, Z: 0, LookVector: { X: 0, Y: 0, Z: 0 } }), "camera");
if (zeroLook.ok || zeroLook.error.reason !== "cframe") throw new Error("cframe validation");

const encoded = encodeArgs({ label: "Hi", onClick: () => {} });
if (encoded.values.label !== "Hi" || encoded.errors.length !== 1 || encoded.errors[0].path !== "onClick" || encoded.errors[0].reason !== "unsupported") {
	throw new Error("field error");
}

const painted = parseDatatype({ type: "color" }, formatDatatype(color));
if (!painted.ok || painted.value.R !== 0.1) throw new Error("color editor");
const tooBright = parseDatatype({ type: "color" }, "2, 0, 0");
if (tooBright.ok || tooBright.reason !== "color") throw new Error("color editor reject");
const placed = parseDatatype({ type: "vector3" }, "1, 2, 3");
if (!placed.ok || placed.value.Z !== 3) throw new Error("vector editor");
const gapped = parseDatatype({ type: "udim" }, "0.5, 8");
if (!gapped.ok || gapped.value.Offset !== 8) throw new Error("udim editor");
const spanned = parseDatatype({ type: "udim2" }, "0.5, 1, 1, -2");
if (!spanned.ok || spanned.value.Y.Offset !== -2) throw new Error("udim2 editor");
const picked = parseDatatype({ type: "EnumItem", enumType: "Font" }, "SourceSans");
if (!picked.ok || picked.value !== font) throw new Error("enum editor");
const missingFont = parseDatatype({ type: "EnumItem", enumType: "Font" }, "Nope");
if (missingFont.ok || missingFont.reason !== "enum") throw new Error("enum editor reject");
const icon = parseDatatype({ type: "asset" }, "123");
if (!icon.ok || icon.value !== 123) throw new Error("asset editor");
const badIcon = parseDatatype({ type: "asset" }, "-1");
if (badIcon.ok || badIcon.reason !== "asset") throw new Error("asset editor reject");
const moved = parseDatatype({ type: "cframe" }, "0, 1, 0");
if (!moved.ok || moved.value.Y !== 1) throw new Error("cframe editor");

const face = new Font("rbxasset://fonts/families/Gotham.json", regular, normal);
const decodedFace = roundTrip(face);
if (decodedFace.Family !== face.Family || decodedFace.Weight !== regular || decodedFace.Style !== normal) {
	throw new Error("font");
}
const gradient = new ColorSequence([
	new ColorSequenceKeypoint(0, new Color3(1, 0, 0)),
	new ColorSequenceKeypoint(1, new Color3(0, 0, 1)),
]);
const decodedGradient = roundTrip(gradient);
if (decodedGradient.Keypoints.length !== 2 || decodedGradient.Keypoints[0].Value.R !== 1) throw new Error("colorSequence");
const fade = new NumberSequence([
	new NumberSequenceKeypoint(0, 0, 0),
	new NumberSequenceKeypoint(1, 1, 0),
]);
const decodedFade = roundTrip(fade);
if (decodedFade.Keypoints.length !== 2 || decodedFade.Keypoints[1].Value !== 1) throw new Error("numberSequence");

const brick = new BrickColor("Bright red");
const decodedBrick = roundTrip(brick);
if (decodedBrick.Name !== "Bright red" || decodedBrick.Number !== 21) throw new Error("brickColor");
const paintedBrick = parseDatatype({ type: "brickColor" }, formatDatatype(brick));
if (!paintedBrick.ok || paintedBrick.value.Name !== "Bright red") throw new Error("brickColor editor");
const badBrick = parseDatatype({ type: "brickColor" }, "Nope");
if (badBrick.ok || badBrick.reason !== "brickColor") throw new Error("brickColor editor reject");

console.log("arg codec ok");
