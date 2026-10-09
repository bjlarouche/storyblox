const kinds = new WeakMap();
globalThis.typeOf = (value) => {
	if (value !== null && typeof value === "object" && kinds.has(value)) return kinds.get(value);
	if (typeof value === "object" && value !== null) return "table";
	return typeof value;
};
globalThis.math = { huge: Infinity, abs: Math.abs, round: Math.round, floor: Math.floor };
globalThis.pcall = (fn) => {
	try {
		return [true, fn()];
	} catch (error) {
		return [false, String(error)];
	}
};
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

const { encodeValue, encodeArgs, decodeValue, formatDatatype, parseDatatype, dockWidgetValue } = await import("../src/packages/argCodec.ts");

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

globalThis.Rect = class Rect {
	constructor(minX, minY, maxX, maxY) {
		this.Min = { X: minX, Y: minY };
		this.Max = { X: maxX, Y: maxY };
		this.Width = maxX - minX;
		kinds.set(this, "Rect");
	}
};
globalThis.NumberRange = class NumberRange {
	constructor(min, max) {
		this.Min = min;
		this.Max = max;
		kinds.set(this, "NumberRange");
	}
};

const rect = new Rect(0, 1, 10, 20);
const decodedRect = roundTrip(rect);
if (decodedRect.Min.X !== 0 || decodedRect.Max.Y !== 20) throw new Error("rect");
const parsedRect = parseDatatype({ type: "rect" }, formatDatatype(rect));
if (!parsedRect.ok || parsedRect.value.Max.X !== 10) throw new Error("rect editor");
const range = new NumberRange(0.25, 0.75);
const decodedRange = roundTrip(range);
if (decodedRange.Min !== 0.25 || decodedRange.Max !== 0.75) throw new Error("numberRange");
const parsedRange = parseDatatype({ type: "numberRange" }, formatDatatype(range));
if (!parsedRange.ok || parsedRange.value.Max !== 0.75) throw new Error("numberRange editor");

globalThis.Ray = class Ray {
	constructor(origin, direction) {
		this.Origin = origin;
		this.Direction = direction;
		kinds.set(this, "Ray");
	}
};
globalThis.PhysicalProperties = class PhysicalProperties {
	constructor(density, friction, elasticity, frictionWeight = 1, elasticityWeight = 1) {
		this.Density = density;
		this.Friction = friction;
		this.Elasticity = elasticity;
		this.FrictionWeight = frictionWeight;
		this.ElasticityWeight = elasticityWeight;
		kinds.set(this, "PhysicalProperties");
	}
};

const ray = new Ray(asType("Vector3", { X: 0, Y: 1, Z: 0 }), asType("Vector3", { X: 0, Y: 0, Z: -1 }));
const decodedRay = roundTrip(ray);
if (decodedRay.Origin.Y !== 1 || decodedRay.Direction.Z !== -1) throw new Error("ray");
const parsedRay = parseDatatype({ type: "ray" }, formatDatatype(ray));
if (!parsedRay.ok || parsedRay.value.Direction.Z !== -1) throw new Error("ray editor");
const physical = new PhysicalProperties(0.7, 0.3, 0.5, 1, 1);
const decodedPhysical = roundTrip(physical);
if (decodedPhysical.Density !== 0.7 || decodedPhysical.ElasticityWeight !== 1) throw new Error("physicalProperties");
const wash = {
	color: gradient,
	transparency: fade,
	rotation: 45,
	offset: asType("Vector2", { X: 0, Y: 0 }),
	enabled: true,
};
const encodedWash = encodeValue(wash, "wash", { type: "gradient" });
if (!encodedWash.ok || encodedWash.value.kind !== "gradient") throw new Error("gradient encode");
const decodedWash = decodeValue(encodedWash.value);
if (decodedWash.rotation !== 45 || decodedWash.enabled !== true || decodedWash.offset.X !== 0) {
	throw new Error("gradient decode");
}

function enumItem(name) {
	return asType("EnumItem", { Name: name });
}
globalThis.Enum.Axis = { X: enumItem("X"), Y: enumItem("Y"), Z: enumItem("Z") };
globalThis.Enum.NormalId = {
	Top: enumItem("Top"),
	Bottom: enumItem("Bottom"),
	Left: enumItem("Left"),
	Right: enumItem("Right"),
	Front: enumItem("Front"),
	Back: enumItem("Back"),
};
globalThis.Enum.EasingStyle = { Quad: enumItem("Quad"), Linear: enumItem("Linear") };
globalThis.Enum.EasingDirection = { Out: enumItem("Out") };
globalThis.Enum.InitialDockState = { Right: enumItem("Right") };
globalThis.Enum.PathWaypointAction = { Walk: enumItem("Walk") };

globalThis.Region3 = class Region3 {
	constructor(min, max) {
		this.CFrame = { Position: new Vector3((min.X + max.X) / 2, (min.Y + max.Y) / 2, (min.Z + max.Z) / 2) };
		this.Size = new Vector3(Math.abs(max.X - min.X), Math.abs(max.Y - min.Y), Math.abs(max.Z - min.Z));
		kinds.set(this, "Region3");
	}
};
globalThis.Vector2int16 = class Vector2int16 {
	constructor(x, y) {
		this.X = x;
		this.Y = y;
		kinds.set(this, "Vector2int16");
	}
};
globalThis.Vector3int16 = class Vector3int16 {
	constructor(x, y, z) {
		this.X = x;
		this.Y = y;
		this.Z = z;
		kinds.set(this, "Vector3int16");
	}
};
globalThis.Region3int16 = class Region3int16 {
	constructor(min, max) {
		this.Min = min;
		this.Max = max;
		kinds.set(this, "Region3int16");
	}
};
globalThis.Axes = class Axes {
	constructor(...parts) {
		for (const name of ["X", "Y", "Z", "Top", "Bottom", "Left", "Right", "Front", "Back"]) this[name] = false;
		for (const part of parts) this[part.Name] = true;
		kinds.set(this, "Axes");
	}
};
globalThis.Faces = class Faces {
	constructor(...parts) {
		for (const name of ["Top", "Bottom", "Left", "Right", "Front", "Back"]) this[name] = false;
		for (const part of parts) this[part.Name] = true;
		kinds.set(this, "Faces");
	}
};
globalThis.DateTime = {
	fromUnixTimestamp(unix) {
		if (!Number.isInteger(unix)) throw new Error("unix");
		const value = { UnixTimestamp: unix, ToIsoDate: () => "1970-01-01T00:00:00Z" };
		kinds.set(value, "DateTime");
		return value;
	},
};
globalThis.TweenInfo = class TweenInfo {
	constructor(time, style, direction, repeatCount, reverses, delayTime) {
		this.Time = time;
		this.EasingStyle = style;
		this.EasingDirection = direction;
		this.RepeatCount = repeatCount;
		this.Reverses = reverses;
		this.DelayTime = delayTime;
		kinds.set(this, "TweenInfo");
	}
};
globalThis.DockWidgetPluginGuiInfo = class DockWidgetPluginGuiInfo {
	constructor(dock, enabled, overrideRestore, floatX, floatY, minWidth, minHeight) {
		this.InitialDockState = dock;
		this.InitialEnabled = enabled;
		this.InitialEnabledShouldOverrideRestore = overrideRestore;
		this.FloatingXSize = floatX;
		this.FloatingYSize = floatY;
		this.MinWidth = minWidth;
		this.MinHeight = minHeight;
		kinds.set(this, "DockWidgetPluginGuiInfo");
	}
};
globalThis.PathWaypoint = class PathWaypoint {
	constructor(position, action, label) {
		this.Position = position;
		this.Action = action;
		this.Label = label;
		kinds.set(this, "PathWaypoint");
	}
};

const region = new Region3(new Vector3(0, 0, 0), new Vector3(4, 2, 4));
const decodedRegion = roundTrip(region);
if (decodedRegion.Size.X !== 4 || decodedRegion.Size.Y !== 2 || decodedRegion.CFrame.Position.X !== 2) throw new Error("region3");
const parsedRegion = parseDatatype({ type: "region3" }, formatDatatype(region));
if (!parsedRegion.ok || parsedRegion.value.Size.Z !== 4) throw new Error("region3 editor");
const fractional = asType("DateTime", { UnixTimestamp: 1.5 });
if (encodeValue(fractional, "when").ok) throw new Error("dateTime reject");
const when = DateTime.fromUnixTimestamp(0);
const decodedWhen = roundTrip(when);
if (decodedWhen.UnixTimestamp !== 0) throw new Error("dateTime");
const spin = new Axes(Enum.Axis.X, Enum.NormalId.Top);
const decodedSpin = roundTrip(spin);
if (decodedSpin.X !== true || decodedSpin.Top !== true || decodedSpin.Y !== false) throw new Error("axes");
const sides = new Faces(Enum.NormalId.Front);
const decodedSides = roundTrip(sides);
if (decodedSides.Front !== true || decodedSides.Back !== false) throw new Error("faces");
const ease = new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 1, false, 0);
const decodedEase = roundTrip(ease);
if (decodedEase.Time !== 0.3 || decodedEase.EasingStyle.Name !== "Quad" || decodedEase.RepeatCount !== 1) throw new Error("tweenInfo");
const dock = dockWidgetValue("Right", true, false, 200, 200, 100, 80);
if (dock === undefined) throw new Error("dockWidget");
const decodedDock = roundTrip(dock);
if (decodedDock.InitialDockState.Name !== "Right" || decodedDock.MinHeight !== 80) throw new Error("dockWidget");
const point = new PathWaypoint(new Vector3(1, 2, 3), Enum.PathWaypointAction.Walk, "lane");
const decodedPoint = roundTrip(point);
if (decodedPoint.Label !== "lane" || decodedPoint.Position.Y !== 2) throw new Error("pathWaypoint");
const nudge = new Vector2int16(1, -2);
if (roundTrip(nudge).Y !== -2) throw new Error("vector2int16");
if (vector2int16RoundTrip()) throw new Error("vector2int16 range");
const cells = new Region3int16(new Vector3int16(0, 0, 0), new Vector3int16(4, 2, 4));
const decodedCells = roundTrip(cells);
if (decodedCells.Max.Z !== 4) throw new Error("region3int16");

function vector2int16RoundTrip() {
	const encoded = encodeValue(new Vector2int16(40000, 0), "nudge");
	return encoded.ok;
}

console.log("arg codec ok");
