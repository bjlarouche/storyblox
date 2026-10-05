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

export function choiceOptions(options: unknown): Array<{ label: string; value: string }> {
	const chosen = new Array<{ label: string; value: string }>();
	if (typeOf(options) !== "table") return chosen;
	for (const option of options as Array<defined>) {
		if (typeOf(option) === "string") {
			chosen.push({ label: option as string, value: option as string });
			continue;
		}
		if (typeOf(option) !== "table") continue;
		const rec = option as { label?: unknown; value?: unknown };
		const value = typeOf(rec.value) === "string" ? (rec.value as string) : typeOf(rec.label) === "string" ? (rec.label as string) : "";
		const label = typeOf(rec.label) === "string" ? (rec.label as string) : value;
		chosen.push({ label: label.size() > 0 ? label : value, value });
	}
	return chosen;
}

export function enumItemOptions(enumType?: string, options?: unknown): Array<{ label: string; value: string }> {
	if (typeOf(enumType) === "string") {
		const enumObj = (Enum as unknown as { [key: string]: { GetEnumItems?: () => EnumItem[] } })[enumType as string];
		if (enumObj !== undefined && typeOf(enumObj.GetEnumItems) === "function") {
			const chosen = new Array<{ label: string; value: string }>();
			for (const item of enumObj.GetEnumItems!()) {
				chosen.push({ label: item.Name, value: item.Name });
			}
			if (chosen.size() > 0) return chosen;
		}
	}
	return choiceOptions(options);
}

export function commitNumberText(text: string): number | undefined {
	if (text.size() === 0) return undefined;
	const value = tonumber(text);
	if (typeOf(value) !== "number") return undefined;
	if (value !== value || value === math.huge || value === -math.huge) return undefined;
	return value;
}
