export interface CodecError {
	path: string;
	reason: string;
}

export interface EncodedArgs {
	values: { [key: string]: unknown };
	errors: Array<CodecError>;
}

interface Vector {
	X: number;
	Y: number;
	Z?: number;
}

interface Tagged {
	kind: string;
	[key: string]: unknown;
}

function finite(value: unknown): value is number {
	return typeOf(value) === "number" && (value as number) === value && value !== math.huge && value !== -math.huge;
}

function fail(path: string, reason: string): { ok: false; error: CodecError } {
	return { ok: false, error: { path, reason } };
}

function unit(value: unknown) {
	return finite(value) && (value as number) >= 0 && (value as number) <= 1;
}

function vector(value: Vector, path: string, axes: "xy" | "xyz"): { ok: true; value: Tagged } | { ok: false; error: CodecError } {
	if (!finite(value.X) || !finite(value.Y)) return fail(path, "vector");
	if (axes === "xy") return { ok: true, value: { kind: "vector2", x: value.X, y: value.Y } };
	if (!finite(value.Z)) return fail(path, "vector");
	return { ok: true, value: { kind: "vector3", x: value.X, y: value.Y, z: value.Z } };
}

export function encodeValue(
	value: unknown,
	path: string,
	spec?: { type?: string },
): { ok: true; value: unknown } | { ok: false; error: CodecError } {
	if (spec?.type === "asset") {
		if (!finite(value) || (value as number) < 0 || (value as number) % 1 !== 0) return fail(path, "asset");
		return { ok: true, value: { kind: "asset", id: value } };
	}
	if (spec?.type === "gradient") {
		if (typeOf(value) !== "table") return fail(path, "gradient");
		const gradient = value as {
			color?: unknown;
			transparency?: unknown;
			rotation?: unknown;
			offset?: Vector;
			enabled?: unknown;
		};
		const color = encodeValue(gradient.color, `${path}.color`);
		if (!color.ok) return color;
		const transparency = encodeValue(gradient.transparency, `${path}.transparency`);
		if (!transparency.ok) return transparency;
		const offset = gradient.offset;
		if (typeOf(offset) !== "Vector2" || !finite(gradient.rotation) || typeOf(gradient.enabled) !== "boolean") {
			return fail(path, "gradient");
		}
		const offsetX = (offset as Vector).X;
		const offsetY = (offset as Vector).Y;
		if (!finite(offsetX) || !finite(offsetY)) return fail(path, "gradient");
		return {
			ok: true,
			value: {
				kind: "gradient",
				color: color.value,
				transparency: transparency.value,
				rotation: gradient.rotation,
				offsetX,
				offsetY,
				enabled: gradient.enabled,
			},
		};
	}
	const kind = typeOf(value);
	if (kind === "string" || kind === "boolean") return { ok: true, value };
	if (kind === "number") {
		if (!finite(value)) return fail(path, "number");
		return { ok: true, value };
	}
	if (kind === "Color3") {
		const color = value as { R: number; G: number; B: number };
		if (!unit(color.R) || !unit(color.G) || !unit(color.B)) return fail(path, "color");
		return { ok: true, value: { kind: "color", r: color.R, g: color.G, b: color.B } };
	}
	if (kind === "BrickColor") {
		const brick = value as { Name?: unknown; Number?: unknown };
		if (typeOf(brick.Name) !== "string" || (brick.Name as string).size() === 0) return fail(path, "brickColor");
		if (!finite(brick.Number) || (brick.Number as number) < 0 || (brick.Number as number) % 1 !== 0) {
			return fail(path, "brickColor");
		}
		return { ok: true, value: { kind: "brickColor", name: brick.Name, number: brick.Number } };
	}
	if (kind === "Vector2") return vector(value as Vector, path, "xy");
	if (kind === "Vector3") return vector(value as Vector, path, "xyz");
	if (kind === "UDim") {
		const udim = value as { Scale: number; Offset: number };
		if (!finite(udim.Scale) || !finite(udim.Offset)) return fail(path, "udim");
		return { ok: true, value: { kind: "udim", scale: udim.Scale, offset: udim.Offset } };
	}
	if (kind === "UDim2") {
		const udim = value as { X: { Scale: number; Offset: number }; Y: { Scale: number; Offset: number } };
		if (!finite(udim.X?.Scale) || !finite(udim.X?.Offset) || !finite(udim.Y?.Scale) || !finite(udim.Y?.Offset)) {
			return fail(path, "udim");
		}
		return {
			ok: true,
			value: {
				kind: "udim2",
				xScale: udim.X.Scale,
				xOffset: udim.X.Offset,
				yScale: udim.Y.Scale,
				yOffset: udim.Y.Offset,
			},
		};
	}
	if (kind === "EnumItem") {
		const item = value as { Name?: unknown; EnumType?: { Name?: unknown } };
		if (typeOf(item.Name) !== "string" || typeOf(item.EnumType?.Name) !== "string") return fail(path, "enum");
		return { ok: true, value: { kind: "enum", enumType: item.EnumType?.Name, name: item.Name } };
	}
	if (kind === "Font") {
		const face = value as { Family?: unknown; Weight?: { Name?: unknown }; Style?: { Name?: unknown } };
		if (typeOf(face.Family) !== "string") return fail(path, "font");
		if (typeOf(face.Weight?.Name) !== "string" || typeOf(face.Style?.Name) !== "string") return fail(path, "font");
		return {
			ok: true,
			value: { kind: "font", family: face.Family, weight: face.Weight?.Name, style: face.Style?.Name },
		};
	}
	if (kind === "ColorSequence") {
		const stops: Array<{ t: number; r: number; g: number; b: number }> = [];
		for (const key of (value as { Keypoints: Array<{ Time: number; Value: { R: number; G: number; B: number } }> })
			.Keypoints) {
			if (!finite(key.Time) || !unit(key.Value.R) || !unit(key.Value.G) || !unit(key.Value.B)) {
				return fail(path, "colorSequence");
			}
			stops.push({ t: key.Time, r: key.Value.R, g: key.Value.G, b: key.Value.B });
		}
		if (stops.size() < 2) return fail(path, "colorSequence");
		return { ok: true, value: { kind: "colorSequence", stops } };
	}
	if (kind === "NumberSequence") {
		const stops: Array<{ t: number; v: number; e: number }> = [];
		for (const key of (value as { Keypoints: Array<{ Time: number; Value: number; Envelope: number }> }).Keypoints) {
			if (!finite(key.Time) || !finite(key.Value) || !finite(key.Envelope)) return fail(path, "numberSequence");
			stops.push({ t: key.Time, v: key.Value, e: key.Envelope });
		}
		if (stops.size() < 2) return fail(path, "numberSequence");
		return { ok: true, value: { kind: "numberSequence", stops } };
	}
	if (kind === "CFrame") {
		const frame = value as { X: number; Y: number; Z: number; LookVector?: Vector; UpVector?: Vector };
		if (!finite(frame.X) || !finite(frame.Y) || !finite(frame.Z)) return fail(path, "cframe");
		const tagged: Tagged = { kind: "cframe", x: frame.X, y: frame.Y, z: frame.Z };
		if (frame.LookVector !== undefined) {
			const look = frame.LookVector;
			if (!finite(look.X) || !finite(look.Y) || !finite(look.Z)) return fail(path, "cframe");
			if (look.X === 0 && look.Y === 0 && look.Z === 0) return fail(path, "cframe");
			tagged.lookX = look.X;
			tagged.lookY = look.Y;
			tagged.lookZ = look.Z;
			const up = frame.UpVector;
			if (up !== undefined) {
				if (!finite(up.X) || !finite(up.Y) || !finite(up.Z)) return fail(path, "cframe");
				tagged.upX = up.X;
				tagged.upY = up.Y;
				tagged.upZ = up.Z;
			}
		}
		return { ok: true, value: tagged };
	}
	if (kind === "Rect") {
		const rect = value as { Min: Vector; Max: Vector };
		if (!finite(rect.Min?.X) || !finite(rect.Min?.Y) || !finite(rect.Max?.X) || !finite(rect.Max?.Y)) {
			return fail(path, "rect");
		}
		return {
			ok: true,
			value: { kind: "rect", minX: rect.Min.X, minY: rect.Min.Y, maxX: rect.Max.X, maxY: rect.Max.Y },
		};
	}
	if (kind === "NumberRange") {
		const range = value as { Min: number; Max: number };
		if (!finite(range.Min) || !finite(range.Max)) return fail(path, "numberRange");
		return { ok: true, value: { kind: "numberRange", min: range.Min, max: range.Max } };
	}
	if (kind === "Ray") {
		const ray = value as { Origin: Vector; Direction: Vector };
		if (
			!finite(ray.Origin?.X) ||
			!finite(ray.Origin?.Y) ||
			!finite(ray.Origin?.Z) ||
			!finite(ray.Direction?.X) ||
			!finite(ray.Direction?.Y) ||
			!finite(ray.Direction?.Z)
		) {
			return fail(path, "ray");
		}
		return {
			ok: true,
			value: {
				kind: "ray",
				ox: ray.Origin.X,
				oy: ray.Origin.Y,
				oz: ray.Origin.Z,
				dx: ray.Direction.X,
				dy: ray.Direction.Y,
				dz: ray.Direction.Z,
			},
		};
	}
	if (kind === "PhysicalProperties") {
		const props = value as {
			Density: number;
			Friction: number;
			Elasticity: number;
			FrictionWeight: number;
			ElasticityWeight: number;
		};
		if (
			!finite(props.Density) ||
			!finite(props.Friction) ||
			!finite(props.Elasticity) ||
			!finite(props.FrictionWeight) ||
			!finite(props.ElasticityWeight)
		) {
			return fail(path, "physicalProperties");
		}
		return {
			ok: true,
			value: {
				kind: "physicalProperties",
				density: props.Density,
				friction: props.Friction,
				elasticity: props.Elasticity,
				frictionWeight: props.FrictionWeight,
				elasticityWeight: props.ElasticityWeight,
			},
		};
	}
	if (kind === "Region3") {
		const bounds = region3Bounds(value as Region3);
		if (bounds === undefined) return fail(path, "region3");
		return {
			ok: true,
			value: {
				kind: "region3",
				minX: bounds.min.X,
				minY: bounds.min.Y,
				minZ: bounds.min.Z,
				maxX: bounds.max.X,
				maxY: bounds.max.Y,
				maxZ: bounds.max.Z,
			},
		};
	}
	if (kind === "Region3int16") {
		const region = value as Region3int16;
		const min = vector3int16Value(region.Min.X, region.Min.Y, region.Min.Z);
		const max = vector3int16Value(region.Max.X, region.Max.Y, region.Max.Z);
		if (min === undefined || max === undefined) return fail(path, "region3int16");
		return {
			ok: true,
			value: { kind: "region3int16", minX: min.X, minY: min.Y, minZ: min.Z, maxX: max.X, maxY: max.Y, maxZ: max.Z },
		};
	}
	if (kind === "Vector2int16") {
		const vector = value as Vector2int16;
		if (vector2int16Value(vector.X, vector.Y) === undefined) return fail(path, "vector2int16");
		return { ok: true, value: { kind: "vector2int16", x: vector.X, y: vector.Y } };
	}
	if (kind === "Vector3int16") {
		const vector = value as Vector3int16;
		if (vector3int16Value(vector.X, vector.Y, vector.Z) === undefined) return fail(path, "vector3int16");
		return { ok: true, value: { kind: "vector3int16", x: vector.X, y: vector.Y, z: vector.Z } };
	}
	if (kind === "Axes") {
		const axes = value as Axes;
		return {
			ok: true,
			value: {
				kind: "axes",
				x: axes.X === true,
				y: axes.Y === true,
				z: axes.Z === true,
				top: axes.Top === true,
				bottom: axes.Bottom === true,
				left: axes.Left === true,
				right: axes.Right === true,
				front: axes.Front === true,
				back: axes.Back === true,
			},
		};
	}
	if (kind === "Faces") {
		const faces = value as Faces;
		return {
			ok: true,
			value: {
				kind: "faces",
				top: faces.Top === true,
				bottom: faces.Bottom === true,
				left: faces.Left === true,
				right: faces.Right === true,
				front: faces.Front === true,
				back: faces.Back === true,
			},
		};
	}
	if (kind === "DateTime") {
		const unix = (value as DateTime).UnixTimestamp;
		if (!finite(unix) || unix % 1 !== 0) return fail(path, "dateTime");
		return { ok: true, value: { kind: "dateTime", unix } };
	}
	if (kind === "TweenInfo") {
		const info = value as TweenInfo;
		if (!finite(info.Time) || !finite(info.DelayTime) || !finite(info.RepeatCount) || typeOf(info.Reverses) !== "boolean") {
			return fail(path, "tweenInfo");
		}
		if (typeOf(info.EasingStyle) !== "EnumItem" || typeOf(info.EasingDirection) !== "EnumItem") return fail(path, "tweenInfo");
		return {
			ok: true,
			value: {
				kind: "tweenInfo",
				time: info.Time,
				style: info.EasingStyle.Name,
				direction: info.EasingDirection.Name,
				repeatCount: info.RepeatCount,
				reverses: info.Reverses,
				delayTime: info.DelayTime,
			},
		};
	}
	if (kind === "DockWidgetPluginGuiInfo") {
		const info = value as DockWidgetPluginGuiInfo;
		if (typeOf(info.InitialDockState) !== "EnumItem" || typeOf(info.InitialEnabled) !== "boolean") return fail(path, "dockWidget");
		if (!finite(info.FloatingXSize) || !finite(info.FloatingYSize) || !finite(info.MinWidth) || !finite(info.MinHeight)) {
			return fail(path, "dockWidget");
		}
		return {
			ok: true,
			value: {
				kind: "dockWidget",
				dock: info.InitialDockState.Name,
				enabled: info.InitialEnabled,
				override: info.InitialEnabledShouldOverrideRestore === true,
				floatX: info.FloatingXSize,
				floatY: info.FloatingYSize,
				minWidth: info.MinWidth,
				minHeight: info.MinHeight,
			},
		};
	}
	if (kind === "PathWaypoint") {
		const point = value as PathWaypoint;
		if (!finite(point.Position?.X) || !finite(point.Position?.Y) || !finite(point.Position?.Z)) return fail(path, "pathWaypoint");
		if (typeOf(point.Action) !== "EnumItem" || typeOf(point.Label) !== "string") return fail(path, "pathWaypoint");
		return {
			ok: true,
			value: {
				kind: "pathWaypoint",
				x: point.Position.X,
				y: point.Position.Y,
				z: point.Position.Z,
				action: point.Action.Name,
				label: point.Label,
			},
		};
	}
	if (kind === "table") {
		const record = value as {
			color?: unknown;
			transparency?: unknown;
			rotation?: unknown;
			offset?: unknown;
			enabled?: unknown;
		};
		if (
			typeOf(record.color) === "ColorSequence" &&
			typeOf(record.transparency) === "NumberSequence" &&
			typeOf(record.offset) === "Vector2" &&
			typeOf(record.enabled) === "boolean"
		) {
			return encodeValue(value, path, { type: "gradient" });
		}
	}
	return fail(path, "unsupported");
}

export function encodeArgs(args: unknown): EncodedArgs {
	const values: { [key: string]: unknown } = {};
	const errors: Array<CodecError> = [];
	if (typeOf(args) !== "table") return { values, errors: [{ path: "", reason: "args" }] };
	for (const [key, value] of pairs(args as { [key: string]: unknown })) {
		const encoded = encodeValue(value, key as string);
		if (encoded.ok) values[key as string] = encoded.value;
		else errors.push(encoded.error);
	}
	return { values, errors };
}

export function decodeValue(tagged: unknown): unknown {
	if (typeOf(tagged) !== "table") return tagged;
	const value = tagged as Tagged;
	if (value.kind === "color") return new Color3(value.r as number, value.g as number, value.b as number);
	if (value.kind === "brickColor") {
		if (!finite(value.number) || (value.number as number) % 1 !== 0) return undefined;
		const named = new BrickColor(value.number as number);
		if (typeOf(value.name) === "string" && named.Name !== value.name) return undefined;
		return named;
	}
	if (value.kind === "vector2") return new Vector2(value.x as number, value.y as number);
	if (value.kind === "vector3") return new Vector3(value.x as number, value.y as number, value.z as number);
	if (value.kind === "udim") return new UDim(value.scale as number, value.offset as number);
	if (value.kind === "udim2") {
		return new UDim2(value.xScale as number, value.xOffset as number, value.yScale as number, value.yOffset as number);
	}
	if (value.kind === "enum") {
		const enumType = (Enum as unknown as { [key: string]: { [key: string]: unknown } })[value.enumType as string];
		const item = enumType?.[value.name as string];
		if (item === undefined) return undefined;
		return item;
	}
	if (value.kind === "asset") return value.id;
	if (value.kind === "font") {
		const weight = (Enum.FontWeight as unknown as { [key: string]: Enum.FontWeight })[value.weight as string];
		const style = (Enum.FontStyle as unknown as { [key: string]: Enum.FontStyle })[value.style as string];
		if (weight === undefined || style === undefined) return undefined;
		return new Font(value.family as string, weight, style);
	}
	if (value.kind === "colorSequence") {
		const stops = value.stops as Array<{ t: number; r: number; g: number; b: number }>;
		return new ColorSequence(stops.map((stop) => new ColorSequenceKeypoint(stop.t, new Color3(stop.r, stop.g, stop.b))));
	}
	if (value.kind === "numberSequence") {
		const stops = value.stops as Array<{ t: number; v: number; e: number }>;
		return new NumberSequence(stops.map((stop) => new NumberSequenceKeypoint(stop.t, stop.v, stop.e)));
	}
	if (value.kind === "cframe") {
		const x = value.x as number;
		const y = value.y as number;
		const z = value.z as number;
		if (value.lookX === undefined) return new CFrame(x, y, z);
		const at = new Vector3(x, y, z);
		const target = new Vector3(x + (value.lookX as number), y + (value.lookY as number), z + (value.lookZ as number));
		const up = value.upX === undefined ? undefined : new Vector3(value.upX as number, value.upY as number, value.upZ as number);
		return CFrame.lookAt(at, target, up);
	}
	if (value.kind === "rect") {
		return new Rect(value.minX as number, value.minY as number, value.maxX as number, value.maxY as number);
	}
	if (value.kind === "numberRange") {
		return new NumberRange(value.min as number, value.max as number);
	}
	if (value.kind === "ray") {
		return new Ray(
			new Vector3(value.ox as number, value.oy as number, value.oz as number),
			new Vector3(value.dx as number, value.dy as number, value.dz as number),
		);
	}
	if (value.kind === "physicalProperties") {
		return new PhysicalProperties(
			value.density as number,
			value.friction as number,
			value.elasticity as number,
			value.frictionWeight as number,
			value.elasticityWeight as number,
		);
	}
	if (value.kind === "region3") {
		return region3FromBounds(
			new Vector3(value.minX as number, value.minY as number, value.minZ as number),
			new Vector3(value.maxX as number, value.maxY as number, value.maxZ as number),
		);
	}
	if (value.kind === "region3int16") {
		const min = vector3int16Value(value.minX as number, value.minY as number, value.minZ as number);
		const max = vector3int16Value(value.maxX as number, value.maxY as number, value.maxZ as number);
		if (min === undefined || max === undefined) return undefined;
		return region3int16Value(min, max);
	}
	if (value.kind === "vector2int16") return vector2int16Value(value.x as number, value.y as number);
	if (value.kind === "vector3int16") return vector3int16Value(value.x as number, value.y as number, value.z as number);
	if (value.kind === "axes") {
		return axesValue({
			X: value.x === true,
			Y: value.y === true,
			Z: value.z === true,
			Top: value.top === true,
			Bottom: value.bottom === true,
			Left: value.left === true,
			Right: value.right === true,
			Front: value.front === true,
			Back: value.back === true,
		});
	}
	if (value.kind === "faces") {
		return facesValue({
			Top: value.top === true,
			Bottom: value.bottom === true,
			Left: value.left === true,
			Right: value.right === true,
			Front: value.front === true,
			Back: value.back === true,
		});
	}
	if (value.kind === "dateTime") return dateTimeValue(value.unix as number);
	if (value.kind === "tweenInfo") {
		return tweenInfoValue(
			value.time as number,
			value.style as string,
			value.direction as string,
			value.repeatCount as number,
			value.reverses === true,
			value.delayTime as number,
		);
	}
	if (value.kind === "dockWidget") {
		return dockWidgetValue(
			value.dock as string,
			value.enabled === true,
			value.override === true,
			value.floatX as number,
			value.floatY as number,
			value.minWidth as number,
			value.minHeight as number,
		);
	}
	if (value.kind === "pathWaypoint") {
		return pathWaypointValue(new Vector3(value.x as number, value.y as number, value.z as number), value.action as string, value.label as string);
	}
	if (value.kind === "gradient") {
		return {
			color: decodeValue(value.color),
			transparency: decodeValue(value.transparency),
			rotation: value.rotation as number,
			offset: new Vector2(value.offsetX as number, value.offsetY as number),
			enabled: value.enabled as boolean,
		};
	}
	return tagged;
}

function readNumber(text: string): number | undefined {
	if (text.size() === 0) return undefined;
	const value = tonumber(text);
	if (!finite(value)) return undefined;
	return value;
}

function readList(text: string): Array<number> | undefined {
	const numbers: Array<number> = [];
	let token = "";
	const push = () => {
		if (token.size() === 0) return false;
		const value = readNumber(token);
		token = "";
		if (value === undefined) return false;
		numbers.push(value);
		return true;
	};
	for (let index = 1; index <= text.size(); index++) {
		const char = text.sub(index, index);
		if (char === ",") {
			if (!push()) return undefined;
		} else if (char !== " ") {
			token += char;
		}
	}
	if (token.size() > 0 && !push()) return undefined;
	return numbers;
}

export function formatDatatype(value: unknown): string {
	const encoded = encodeValue(value, "");
	if (!encoded.ok) return "";
	const tagged = encoded.value;
	if (typeOf(tagged) !== "table") return tostring(tagged);
	const record = tagged as Tagged;
	if (record.kind === "color") return `${record.r}, ${record.g}, ${record.b}`;
	if (record.kind === "brickColor") return record.name as string;
	if (record.kind === "vector2") return `${record.x}, ${record.y}`;
	if (record.kind === "vector3") return `${record.x}, ${record.y}, ${record.z}`;
	if (record.kind === "udim") return `${record.scale}, ${record.offset}`;
	if (record.kind === "udim2") return `${record.xScale}, ${record.xOffset}, ${record.yScale}, ${record.yOffset}`;
	if (record.kind === "enum") return tostring(record.name);
	if (record.kind === "asset") return tostring(record.id);
	if (record.kind === "font") return `${record.family} ${record.weight} ${record.style}`;
	if (record.kind === "colorSequence") return tostring((record.stops as Array<unknown>).size());
	if (record.kind === "numberSequence") return tostring((record.stops as Array<unknown>).size());
	if (record.kind === "cframe") {
		let text = `${record.x}, ${record.y}, ${record.z}`;
		if (record.lookX !== undefined) text += `, ${record.lookX}, ${record.lookY}, ${record.lookZ}`;
		if (record.upX !== undefined) text += `, ${record.upX}, ${record.upY}, ${record.upZ}`;
		return text;
	}
	if (record.kind === "rect") return `${record.minX}, ${record.minY}, ${record.maxX}, ${record.maxY}`;
	if (record.kind === "numberRange") return `${record.min}, ${record.max}`;
	if (record.kind === "ray") {
		return `${record.ox}, ${record.oy}, ${record.oz}, ${record.dx}, ${record.dy}, ${record.dz}`;
	}
	if (record.kind === "physicalProperties") {
		return `${record.density}, ${record.friction}, ${record.elasticity}, ${record.frictionWeight}, ${record.elasticityWeight}`;
	}
	if (record.kind === "region3" || record.kind === "region3int16") {
		return `${record.minX}, ${record.minY}, ${record.minZ}, ${record.maxX}, ${record.maxY}, ${record.maxZ}`;
	}
	if (record.kind === "vector2int16") return `${record.x}, ${record.y}`;
	if (record.kind === "vector3int16") return `${record.x}, ${record.y}, ${record.z}`;
	if (record.kind === "dateTime") return tostring(record.unix);
	if (record.kind === "gradient") return "gradient";
	return "";
}

export function parseDatatype(
	spec: { type?: string; enumType?: string },
	text: string,
): { ok: true; value: unknown } | { ok: false; reason: string } {
	const kind = spec.type;
	if (kind === "EnumItem") {
		if (typeOf(spec.enumType) !== "string") return { ok: false, reason: "enum" };
		const enumName = spec.enumType as string;
		const enumType = (Enum as unknown as { [key: string]: { [key: string]: unknown } })[enumName];
		const item = enumType?.[text];
		if (item === undefined || typeOf(item) !== "EnumItem") return { ok: false, reason: "enum" };
		return { ok: true, value: item };
	}
	if (kind === "brickColor") {
		if (text.size() === 0) return { ok: false, reason: "brickColor" };
		const brick = new BrickColor(text as never);
		if (brick.Name !== text) return { ok: false, reason: "brickColor" };
		return { ok: true, value: brick };
	}
	if (kind === "asset") {
		const encoded = encodeValue(readNumber(text), "value", { type: "asset" });
		if (!encoded.ok) return { ok: false, reason: encoded.error.reason };
		return { ok: true, value: decodeValue(encoded.value) };
	}
	const numbers = readList(text);
	if (numbers === undefined) return { ok: false, reason: kind ?? "unsupported" };
	let value: unknown;
	if (kind === "color" && numbers.size() === 3) value = new Color3(numbers[0], numbers[1], numbers[2]);
	else if (kind === "vector2" && numbers.size() === 2) value = new Vector2(numbers[0], numbers[1]);
	else if (kind === "vector3" && numbers.size() === 3) value = new Vector3(numbers[0], numbers[1], numbers[2]);
	else if (kind === "udim" && numbers.size() === 2) value = new UDim(numbers[0], numbers[1]);
	else if (kind === "udim2" && numbers.size() === 4) value = new UDim2(numbers[0], numbers[1], numbers[2], numbers[3]);
	else if (kind === "cframe" && numbers.size() === 3) value = new CFrame(numbers[0], numbers[1], numbers[2]);
	else if (kind === "cframe" && (numbers.size() === 6 || numbers.size() === 9)) {
		const at = new Vector3(numbers[0], numbers[1], numbers[2]);
		const target = new Vector3(numbers[0] + numbers[3], numbers[1] + numbers[4], numbers[2] + numbers[5]);
		const up = numbers.size() === 9 ? new Vector3(numbers[6], numbers[7], numbers[8]) : undefined;
		value = CFrame.lookAt(at, target, up);
	} else if (kind === "rect" && numbers.size() === 4) value = new Rect(numbers[0], numbers[1], numbers[2], numbers[3]);
	else if (kind === "numberRange" && numbers.size() === 2) value = new NumberRange(numbers[0], numbers[1]);
	else if (kind === "ray" && numbers.size() === 6) {
		value = new Ray(new Vector3(numbers[0], numbers[1], numbers[2]), new Vector3(numbers[3], numbers[4], numbers[5]));
	} else if (kind === "physicalProperties" && numbers.size() === 5) {
		value = new PhysicalProperties(numbers[0], numbers[1], numbers[2], numbers[3], numbers[4]);
	} else if (kind === "region3" && numbers.size() === 6) {
		value = region3FromBounds(new Vector3(numbers[0], numbers[1], numbers[2]), new Vector3(numbers[3], numbers[4], numbers[5]));
	} else if (kind === "region3int16" && numbers.size() === 6) {
		const min = vector3int16Value(numbers[0], numbers[1], numbers[2]);
		const max = vector3int16Value(numbers[3], numbers[4], numbers[5]);
		value = min !== undefined && max !== undefined ? region3int16Value(min, max) : undefined;
	} else if (kind === "vector2int16" && numbers.size() === 2) value = vector2int16Value(numbers[0], numbers[1]);
	else if (kind === "vector3int16" && numbers.size() === 3) value = vector3int16Value(numbers[0], numbers[1], numbers[2]);
	else if (kind === "dateTime" && numbers.size() === 1) value = dateTimeValue(numbers[0]);
	else return { ok: false, reason: kind ?? "unsupported" };
	if (value === undefined) return { ok: false, reason: kind ?? "unsupported" };
	const encoded = encodeValue(value, "value");
	if (!encoded.ok) return { ok: false, reason: encoded.error.reason };
	return { ok: true, value };
}

const AXIS_NAMES = ["X", "Y", "Z"];
const FACE_NAMES = ["Top", "Bottom", "Left", "Right", "Front", "Back"];

function finite3(value: { X: number; Y: number; Z: number } | undefined) {
	return value !== undefined && finite(value.X) && finite(value.Y) && finite(value.Z);
}

function near(left: number, right: number) {
	return math.abs(left - right) <= 1e-3;
}

function attempt<T extends defined>(produce: () => T): T | undefined {
	const [ok, value] = pcall(produce);
	if (!ok) return undefined;
	return value as T;
}

function enumNamed(enumName: string, itemName: string): EnumItem | undefined {
	const enumType = (Enum as unknown as { [key: string]: { [key: string]: EnumItem } })[enumName];
	const item = enumType?.[itemName];
	if (item === undefined || typeOf(item) !== "EnumItem") return undefined;
	return item;
}

export function region3Bounds(region: Region3): { min: Vector3; max: Vector3 } | undefined {
	const center = region.CFrame?.Position;
	const size = region.Size;
	if (!finite3(center) || !finite3(size)) return undefined;
	return {
		min: new Vector3(center.X - size.X / 2, center.Y - size.Y / 2, center.Z - size.Z / 2),
		max: new Vector3(center.X + size.X / 2, center.Y + size.Y / 2, center.Z + size.Z / 2),
	};
}

export function region3FromBounds(min: Vector3, max: Vector3): Region3 | undefined {
	if (!finite3(min) || !finite3(max)) return undefined;
	const region = attempt(() => new Region3(min, max));
	if (region === undefined || typeOf(region) !== "Region3") return undefined;
	const bounds = region3Bounds(region);
	if (bounds === undefined) return undefined;
	const again = attempt(() => new Region3(bounds.min, bounds.max));
	const check = again !== undefined ? region3Bounds(again) : undefined;
	if (
		check === undefined ||
		!near(bounds.min.X, check.min.X) ||
		!near(bounds.min.Y, check.min.Y) ||
		!near(bounds.min.Z, check.min.Z) ||
		!near(bounds.max.X, check.max.X) ||
		!near(bounds.max.Y, check.max.Y) ||
		!near(bounds.max.Z, check.max.Z)
	) {
		return undefined;
	}
	return region;
}

function int16(value: number): number | undefined {
	if (!finite(value) || value % 1 !== 0 || value < -32768 || value > 32767) return undefined;
	return value;
}

export function vector2int16Value(x: number, y: number): Vector2int16 | undefined {
	const ix = int16(x);
	const iy = int16(y);
	if (ix === undefined || iy === undefined) return undefined;
	const vector = attempt(() => new Vector2int16(ix, iy));
	if (vector === undefined || typeOf(vector) !== "Vector2int16" || vector.X !== ix || vector.Y !== iy) return undefined;
	return vector;
}

export function vector3int16Value(x: number, y: number, z: number): Vector3int16 | undefined {
	const ix = int16(x);
	const iy = int16(y);
	const iz = int16(z);
	if (ix === undefined || iy === undefined || iz === undefined) return undefined;
	const vector = attempt(() => new Vector3int16(ix, iy, iz));
	if (
		vector === undefined ||
		typeOf(vector) !== "Vector3int16" ||
		vector.X !== ix ||
		vector.Y !== iy ||
		vector.Z !== iz
	) {
		return undefined;
	}
	return vector;
}

export function region3int16Value(min: Vector3int16, max: Vector3int16): Region3int16 | undefined {
	const region = attempt(() => new Region3int16(min, max));
	if (region === undefined || typeOf(region) !== "Region3int16") return undefined;
	if (
		region.Min.X !== min.X ||
		region.Min.Y !== min.Y ||
		region.Min.Z !== min.Z ||
		region.Max.X !== max.X ||
		region.Max.Y !== max.Y ||
		region.Max.Z !== max.Z
	) {
		return undefined;
	}
	return region;
}

function flagValue(enumName: string, names: Array<string>, flags: { [key: string]: boolean }, produce: (picked: Array<EnumItem>) => unknown, kind: string) {
	const picked = new Array<EnumItem>();
	for (const name of names) {
		if (flags[name] !== true) continue;
		const item = enumNamed(enumName, name);
		if (item === undefined) return undefined;
		picked.push(item);
	}
	const value = attempt(() => produce(picked) as defined);
	if (value === undefined || typeOf(value) !== kind) return undefined;
	const record = value as { [key: string]: boolean };
	for (const name of names) {
		if (record[name] !== (flags[name] === true)) return undefined;
	}
	return value;
}

export function axesValue(flags: { [key: string]: boolean }) {
	const picked = new Array<Enum.Axis | Enum.NormalId>();
	for (const name of AXIS_NAMES) {
		if (flags[name] !== true) continue;
		const item = enumNamed("Axis", name);
		if (item === undefined) return undefined;
		picked.push(item as Enum.Axis);
	}
	for (const name of FACE_NAMES) {
		if (flags[name] !== true) continue;
		const item = enumNamed("NormalId", name);
		if (item === undefined) return undefined;
		picked.push(item as Enum.NormalId);
	}
	const axes = attempt(() => new Axes(...picked));
	if (axes === undefined || typeOf(axes) !== "Axes") return undefined;
	const record = axes as unknown as { [key: string]: boolean };
	for (const name of AXIS_NAMES) {
		if (record[name] !== (flags[name] === true)) return undefined;
	}
	for (const name of FACE_NAMES) {
		if (record[name] !== (flags[name] === true)) return undefined;
	}
	return axes;
}

export function facesValue(flags: { [key: string]: boolean }) {
	const faces = flagValue("NormalId", FACE_NAMES, flags, (picked) => new Faces(...(picked as Array<Enum.NormalId>)), "Faces");
	return faces as Faces | undefined;
}

export function dateTimeValue(unix: number): DateTime | undefined {
	if (!finite(unix) || unix % 1 !== 0) return undefined;
	const value = attempt(() => DateTime.fromUnixTimestamp(unix));
	if (value === undefined || typeOf(value) !== "DateTime" || value.UnixTimestamp !== unix) return undefined;
	return value;
}

export function tweenInfoValue(
	time: number,
	styleName: string,
	directionName: string,
	repeatCount: number,
	reverses: boolean,
	delayTime: number,
): TweenInfo | undefined {
	if (!finite(time) || time < 0 || !finite(delayTime) || delayTime < 0) return undefined;
	if (!finite(repeatCount) || repeatCount < 0 || repeatCount % 1 !== 0 || typeOf(reverses) !== "boolean") return undefined;
	const style = enumNamed("EasingStyle", styleName);
	const direction = enumNamed("EasingDirection", directionName);
	if (style === undefined || direction === undefined) return undefined;
	const info = attempt(() => new TweenInfo(time, style as Enum.EasingStyle, direction as Enum.EasingDirection, repeatCount, reverses, delayTime));
	if (info === undefined || typeOf(info) !== "TweenInfo") return undefined;
	if (info.Time !== time || info.RepeatCount !== repeatCount || info.Reverses !== reverses || info.DelayTime !== delayTime) return undefined;
	if (info.EasingStyle.Name !== styleName || info.EasingDirection.Name !== directionName) return undefined;
	return info;
}

export function dockWidgetValue(
	dock: string,
	enabled: boolean,
	overrideRestore: boolean,
	floatX: number,
	floatY: number,
	minWidth: number,
	minHeight: number,
): DockWidgetPluginGuiInfo | undefined {
	if (!finite(floatX) || !finite(floatY) || !finite(minWidth) || !finite(minHeight)) return undefined;
	if (floatX < 0 || floatY < 0 || minWidth < 0 || minHeight < 0) return undefined;
	if (typeOf(enabled) !== "boolean" || typeOf(overrideRestore) !== "boolean") return undefined;
	const state = enumNamed("InitialDockState", dock);
	if (state === undefined) return undefined;
	const info = attempt(
		() => new DockWidgetPluginGuiInfo(state as Enum.InitialDockState, enabled, overrideRestore, floatX, floatY, minWidth, minHeight),
	);
	if (info === undefined || typeOf(info) !== "DockWidgetPluginGuiInfo") return undefined;
	if (info.InitialDockState.Name !== dock || info.InitialEnabled !== enabled || info.InitialEnabledShouldOverrideRestore !== overrideRestore) {
		return undefined;
	}
	if (info.FloatingXSize !== floatX || info.FloatingYSize !== floatY || info.MinWidth !== minWidth || info.MinHeight !== minHeight) {
		return undefined;
	}
	return info;
}

export function pathWaypointValue(position: Vector3, actionName: string, label: string): PathWaypoint | undefined {
	if (!finite3(position) || typeOf(label) !== "string") return undefined;
	const action = enumNamed("PathWaypointAction", actionName);
	if (action === undefined) return undefined;
	const point = attempt(() => new PathWaypoint(position, action as Enum.PathWaypointAction, label));
	if (point === undefined || typeOf(point) !== "PathWaypoint") return undefined;
	if (point.Action.Name !== actionName || point.Label !== label) return undefined;
	if (!near(point.Position.X, position.X) || !near(point.Position.Y, position.Y) || !near(point.Position.Z, position.Z)) return undefined;
	return point;
}
