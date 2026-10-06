export interface ControlSpec {
	type:
		| "string"
		| "boolean"
		| "number"
		| "enum"
		| "color"
		| "brickColor"
		| "vector2"
		| "vector3"
		| "udim"
		| "udim2"
		| "EnumItem"
		| "asset"
		| "cframe"
		| "font"
		| "colorSequence"
		| "numberSequence"
		| "object"
		| "array"
		| "dictionary"
		| "union"
		| "custom"
		| "readonly";
	options?: string[];
	control?: "radio" | "slider" | "switch";
	min?: number;
	max?: number;
	step?: number;
	optional?: boolean;
	disabled?: boolean;
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
	switch: (): ControlSpec => ({ type: "boolean", control: "switch" }),
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
	brickColor: (): ControlSpec => ({ type: "brickColor" }),
	vector2: (): ControlSpec => ({ type: "vector2" }),
	vector3: (): ControlSpec => ({ type: "vector3" }),
	udim: (): ControlSpec => ({ type: "udim" }),
	udim2: (): ControlSpec => ({ type: "udim2" }),
	enumItem: (enumType: string, options?: string[]): ControlSpec => ({ type: "EnumItem", enumType, options }),
	font: (): ControlSpec => ({ type: "font" }),
	colorSequence: (): ControlSpec => ({ type: "colorSequence" }),
	numberSequence: (): ControlSpec => ({ type: "numberSequence" }),
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

export interface StoryFeatures {
	actions?: boolean;
	docs?: boolean;
	interactions?: boolean;
	outline?: boolean;
	measure?: boolean;
}

export function storyFeatures(features?: StoryFeatures) {
	return {
		actions: features?.actions === true,
		docs: features?.docs === true,
		interactions: features?.interactions === true,
		outline: features?.outline === true,
		measure: features?.measure === true,
	};
}

export interface ModernStory<T> {
	id?: string;
	title: string;
	description?: string;
	args?: T;
	argTypes?: { [key: string]: ControlSpec };
	render: (args: T, context?: { theme?: unknown; globals?: { [key: string]: unknown }; parameters?: { [key: string]: unknown } }) => unknown;
	preview?: {
		kind: string;
		preset?: "phone" | "tablet" | "desktop" | "console";
		width?: number;
		height?: number;
		orientation?: "portrait" | "landscape";
		background?: Color3;
	};
	tools?: StoryTools;
	tags?: string[];
	parameters?: { [key: string]: unknown };
	globals?: { [key: string]: unknown };
	decorators?: Array<(inner: (args: T) => unknown) => (args: T) => unknown>;
	features?: StoryFeatures;
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
