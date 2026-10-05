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
	} else return { ok: false, reason: kind ?? "unsupported" };
	const encoded = encodeValue(value, "value");
	if (!encoded.ok) return { ok: false, reason: encoded.error.reason };
	return { ok: true, value };
}
