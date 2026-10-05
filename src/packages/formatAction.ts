export interface ActionLine {
	name: string;
	values: Array<unknown>;
}

export function formatActionValue(value: unknown): string {
	const kind = typeOf(value);
	if (kind === "nil") return "nil";
	if (kind === "string") return value as string;
	if (kind === "number" || kind === "boolean") return `${value}`;
	if (kind === "Vector2") {
		const v = value as Vector2;
		return `Vector2(${v.X}, ${v.Y})`;
	}
	if (kind === "Vector3") {
		const v = value as Vector3;
		return `Vector3(${v.X}, ${v.Y}, ${v.Z})`;
	}
	if (kind === "Color3") {
		const v = value as Color3;
		return `Color3(${math.floor(v.R * 255)}, ${math.floor(v.G * 255)}, ${math.floor(v.B * 255)})`;
	}
	if (kind === "EnumItem") return tostring(value);
	if (kind === "Instance") return (value as Instance).GetFullName();
	if (kind === "function") return "function";
	if (kind === "table") return "table";
	return kind;
}

export function formatActionLine(event: ActionLine): string {
	if (event.values.size() === 0) return event.name;
	const parts = new Array<string>();
	for (const value of event.values) parts.push(formatActionValue(value));
	return `${event.name}(${parts.join(", ")})`;
}
