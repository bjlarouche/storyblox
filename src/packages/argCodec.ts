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
