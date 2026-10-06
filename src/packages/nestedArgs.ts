export interface ArgRecord {
	[key: string]: unknown;
}

type EditorMount = (value: unknown, onChange: (value: unknown) => void) => () => void;

const editors: { [name: string]: EditorMount } = {};

export function controlFaultPath(parent: string, segment: string) {
	return parent.size() === 0 ? segment : `${parent}.${segment}`;
}

export function readOnlyKind(
	value: unknown,
): "function" | "Instance" | "binding" | "RBXScriptSignal" | "thread" | undefined {
	const kind = typeOf(value);
	if (kind === "function") return "function";
	if (kind === "Instance") return "Instance";
	if (kind === "RBXScriptSignal") return "RBXScriptSignal";
	if (kind === "thread") return "thread";
	if (kind === "table" && typeOf((value as { getValue?: unknown }).getValue) === "function") return "binding";
	return undefined;
}

export function describeReadonly(value: unknown): string {
	const kind = typeOf(value);
	if (kind === "function") return "function";
	if (kind === "thread") return "thread";
	if (kind === "RBXScriptSignal") return "RBXScriptSignal";
	if (kind === "Instance") {
		const instance = value as { ClassName?: string; Name?: string };
		return `Instance ${instance.ClassName ?? ""} ${instance.Name ?? ""}`;
	}
	if (kind === "RBXScriptConnection") {
		const connected = (value as { Connected?: boolean }).Connected === true;
		return connected ? "RBXScriptConnection connected" : "RBXScriptConnection disconnected";
	}
	if (kind === "RaycastParams" || kind === "OverlapParams") {
		const params = value as { FilterType?: { Name?: string }; CollisionGroup?: string; MaxParts?: number; IgnoreWater?: boolean };
		const filter = typeOf(params.FilterType) === "EnumItem" ? params.FilterType!.Name : "";
		let text = `${kind} ${filter} group=${params.CollisionGroup ?? ""}`;
		if (kind === "OverlapParams") text += ` max=${params.MaxParts ?? ""}`;
		if (kind === "RaycastParams") text += ` water=${params.IgnoreWater === true}`;
		return text;
	}
	if (kind === "RaycastResult") {
		const result = value as { Distance?: number; Instance?: { Name?: string }; Material?: { Name?: string } };
		const material = typeOf(result.Material) === "EnumItem" ? result.Material!.Name : "";
		return `RaycastResult ${result.Instance?.Name ?? ""} ${material} d=${result.Distance ?? ""}`;
	}
	if (kind === "FloatCurveKey") {
		const key = value as { Time?: number; Value?: number };
		return `FloatCurveKey t=${key.Time ?? ""} v=${key.Value ?? ""}`;
	}
	if (kind === "Random") return "Random";
	if (kind === "buffer") return "buffer";
	if (kind === "Enum" || kind === "Enums") return kind;
	if (kind === "table" && typeOf((value as { getValue?: unknown }).getValue) === "function") return "binding";
	if (kind !== "nil") return kind;
	return "readonly";
}

function isList(value: unknown): value is Array<unknown> {
	return typeOf(value) === "table" && typeOf((value as { size?: unknown }).size) === "function";
}

export function copyTree(value: unknown): unknown {
	if (isList(value)) {
		const copy: Array<defined> = [];
		for (const item of value) copy.push(copyTree(item) as defined);
		return copy;
	}
	if (typeOf(value) !== "table" || readOnlyKind(value) !== undefined) return value;
	const copy: ArgRecord = {};
	for (const [key, child] of pairs(value as ArgRecord)) copy[key as string] = copyTree(child);
	return copy;
}

export function patchField(record: unknown, key: string, value: unknown): ArgRecord {
	const copy: ArgRecord = {};
	if (typeOf(record) === "table") {
		for (const [name, current] of pairs(record as ArgRecord)) copy[name as string] = current;
	}
	if (value === undefined) {
		const omitted: ArgRecord = {};
		for (const [name, current] of pairs(copy)) {
			if (name !== key) omitted[name as string] = current;
		}
		return omitted;
	}
	copy[key] = value;
	return copy;
}

export function resetBranch(current: unknown, defaults: unknown, key: string): ArgRecord {
	const source = typeOf(defaults) === "table" ? (defaults as ArgRecord)[key] : undefined;
	return patchField(current, key, copyTree(source));
}

function copyList<T extends defined>(items: Array<T>): Array<T> {
	const copy: Array<T> = [];
	for (const item of items) copy.push(item);
	return copy;
}

export function insertItem<T extends defined>(items: Array<T>, index: number, value: T): Array<T> {
	const copy = copyList(items);
	copy.insert(index, value);
	return copy;
}

export function removeItem<T extends defined>(items: Array<T>, index: number): Array<T> {
	const copy = copyList(items);
	copy.remove(index);
	return copy;
}

export function moveItem<T extends defined>(items: Array<T>, from: number, to: number): Array<T> {
	if (from === to) return copyList(items);
	const copy = copyList(items);
	const value = copy[from];
	copy.remove(from);
	copy.insert(to, value);
	return copy;
}

export function switchUnion(tag: string, variant: string, defaults: ArgRecord): ArgRecord {
	const switched = copyTree(defaults);
	if (typeOf(switched) !== "table") return { [tag]: variant };
	(switched as ArgRecord)[tag] = variant;
	return switched as ArgRecord;
}

export function registerControlEditor(name: string, mount: EditorMount): () => void {
	editors[name] = mount;
	return () => {
		if (editors[name] === mount) editors[name] = undefined as unknown as EditorMount;
	};
}

export function mountControlEditor(name: string, value: unknown, onChange: (value: unknown) => void): () => void {
	const mount = editors[name];
	if (mount === undefined) return () => {};
	return mount(value, onChange);
}
