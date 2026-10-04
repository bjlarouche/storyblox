export interface ArgValues {
	[key: string]: unknown;
}

export function copyArgs(args: unknown): ArgValues {
	const copy: ArgValues = {};
	if (typeOf(args) !== "table") return copy;
	for (const [key, value] of pairs(args as ArgValues)) {
		copy[key as string] = value;
	}
	return copy;
}

export function patchArg(args: ArgValues, key: string, value: unknown): ArgValues {
	const patched = copyArgs(args);
	patched[key] = value;
	return patched;
}

export function omitArg(args: ArgValues, key: string): ArgValues {
	const omitted: ArgValues = {};
	for (const [name, value] of pairs(args)) {
		if (name !== key) omitted[name as string] = value;
	}
	return omitted;
}

export function applyArg(args: ArgValues, key: string, value: unknown): ArgValues {
	if (value === undefined) return omitArg(args, key);
	return patchArg(args, key, value);
}

export function commitNumberText(text: string): number | undefined {
	if (text.size() === 0) return undefined;
	const value = tonumber(text);
	if (typeOf(value) !== "number") return undefined;
	if (value !== value || value === math.huge || value === -math.huge) return undefined;
	return value;
}
