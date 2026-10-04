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
