export interface ControlSpec {
	type:
		| "string"
		| "boolean"
		| "number"
		| "enum"
		| "color"
		| "vector2"
		| "vector3"
		| "udim"
		| "udim2"
		| "EnumItem"
		| "asset"
		| "cframe"
		| "object"
		| "array"
		| "dictionary"
		| "union"
		| "custom"
		| "readonly";
	options?: string[];
	control?: "radio" | "slider";
	min?: number;
	max?: number;
	step?: number;
	optional?: boolean;
	enumType?: string;
	fields?: { [key: string]: ControlSpec };
	item?: ControlSpec;
	tag?: string;
	variants?: { [key: string]: { [key: string]: ControlSpec } };
	editor?: string;
	description?: string;
}

export const controls = {
	string: (): ControlSpec => ({ type: "string" }),
	boolean: (): ControlSpec => ({ type: "boolean" }),
	number: (): ControlSpec => ({ type: "number" }),
	enum: (options: string[]): ControlSpec => ({ type: "enum", options }),
	radio: (options: string[]): ControlSpec => ({ type: "enum", options, control: "radio" }),
	slider: (min: number, max: number, step?: number): ControlSpec => ({
		type: "number",
		control: "slider",
		min,
		max,
		step,
	}),
	color: (): ControlSpec => ({ type: "color" }),
	vector2: (): ControlSpec => ({ type: "vector2" }),
	vector3: (): ControlSpec => ({ type: "vector3" }),
	udim: (): ControlSpec => ({ type: "udim" }),
	udim2: (): ControlSpec => ({ type: "udim2" }),
	enumItem: (enumType: string, options: string[]): ControlSpec => ({ type: "EnumItem", enumType, options }),
	asset: (): ControlSpec => ({ type: "asset" }),
	cframe: (): ControlSpec => ({ type: "cframe" }),
	object: (fields: { [key: string]: ControlSpec }): ControlSpec => ({ type: "object", fields }),
	array: (item: ControlSpec): ControlSpec => ({ type: "array", item }),
	dictionary: (item: ControlSpec): ControlSpec => ({ type: "dictionary", item }),
	union: (tag: string, variants: { [key: string]: { [key: string]: ControlSpec } }): ControlSpec => ({
		type: "union",
		tag,
		variants,
	}),
	custom: (editor: string): ControlSpec => ({ type: "custom", editor }),
	readonly: (): ControlSpec => ({ type: "readonly" }),
};

export interface StoryTool {
	id: string;
	label: string;
	icon?: string;
	active?: boolean;
	onClick: () => void;
}

export interface StoryToolHost {
	orbit: () => void;
	resetCamera: () => void;
}

export type StoryTools = StoryTool[] | ((host: StoryToolHost) => StoryTool[]);

export function resolveStoryTools(tools: StoryTools | undefined, host: StoryToolHost): StoryTool[] {
	if (tools === undefined) return [];
	if (typeOf(tools) === "function") {
		const resolved = (tools as (host: StoryToolHost) => StoryTool[])(host);
		return typeOf(resolved) === "table" ? resolved : [];
	}
	return tools as StoryTool[];
}

export interface ModernStory<T> {
	id?: string;
	title: string;
	description?: string;
	args?: T;
	argTypes?: { [key: string]: ControlSpec };
	render: (args: T) => unknown;
	preview?: {
		kind: string;
		preset?: "phone" | "tablet" | "desktop" | "console";
		width?: number;
		height?: number;
		background?: Color3;
	};
	tools?: StoryTools;
	component?: unknown;
}

export function defineStory<T>(story: ModernStory<T>): ModernStory<T> {
	return story;
}

export interface ClaimedId {
	id: string;
	title: string;
}

export function claimStoryId(seen: ClaimedId[], id: string | undefined, title: string): boolean {
	if (id === undefined || id.size() === 0) return true;
	const owner = seen.find((item) => item.id === id);
	if (owner !== undefined && owner.title !== title) return false;
	if (owner === undefined) seen.push({ id, title });
	return true;
}

export function releaseStoryId(seen: ClaimedId[], title: string): ClaimedId[] {
	return seen.filter((item) => item.title !== title);
}
