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

export function enumItems(enumType?: string, options?: unknown): EnumItem[] {
	const items = new Array<EnumItem>();
	if (typeOf(enumType) === "string") {
		// Type as Enum so roblox-ts emits enumObj:GetEnumItems() (dot call drops self).
		const enumObj = (Enum as unknown as { [key: string]: Enum | undefined })[enumType as string];
		if (enumObj !== undefined) {
			for (const item of enumObj.GetEnumItems()) items.push(item);
		}
	}
	if (typeOf(options) !== "table" || (options as Array<unknown>).size() === 0) return items;
	const names = new Array<string>();
	for (const option of options as Array<unknown>) {
		if (typeOf(option) === "string") names.push(option as string);
	}
	if (names.size() === 0) return items;
	const filtered = new Array<EnumItem>();
	for (const item of items) {
		for (const name of names) {
			if (item.Name === name) {
				filtered.push(item);
				break;
			}
		}
	}
	return filtered.size() > 0 ? filtered : items;
}

export function enumItemOptions(enumType?: string, options?: unknown): Array<{ label: string; value: string }> {
	const items = enumItems(enumType, options);
	if (items.size() > 0) {
		const chosen = new Array<{ label: string; value: string }>();
		for (const item of items) chosen.push({ label: item.Name, value: item.Name });
		return chosen;
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

export function assetText(value: unknown): string {
	if (typeOf(value) === "number") return tostring(value);
	if (typeOf(value) === "string") return value as string;
	return "";
}

export function assetId(text: string): number | undefined {
	let digits = text;
	if (digits.sub(1, 13) === "rbxassetid://") digits = digits.sub(14);
	const id = commitNumberText(digits);
	if (id === undefined || id < 0 || id % 1 !== 0) return undefined;
	return id;
}
