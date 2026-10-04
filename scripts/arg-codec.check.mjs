const kinds = new WeakMap();
globalThis.typeOf = (value) => {
	if (value !== null && typeof value === "object" && kinds.has(value)) return kinds.get(value);
	if (typeof value === "object" && value !== null) return "table";
	return typeof value;
};
globalThis.math = { huge: Infinity };
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
globalThis.Enum = { Font: { SourceSans: font } };

const { encodeValue, encodeArgs, decodeValue } = await import("../src/packages/argCodec.ts");

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

console.log("arg codec ok");
