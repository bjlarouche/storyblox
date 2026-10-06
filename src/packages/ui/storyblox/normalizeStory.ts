export interface ReactStoryShape {
	title: string;
	template: (...args: never[]) => unknown;
	component?: unknown;
	props?: unknown;
	id?: string;
	args?: unknown;
	argTypes?: unknown;
	preview?: unknown;
	tools?: unknown;
	cases?: unknown;
	description?: unknown;
	tags?: unknown;
	parameters?: unknown;
	globals?: unknown;
	features?: {
		actions: boolean;
		docs: boolean;
		interactions: boolean;
		outline: boolean;
		measure: boolean;
	};
}

export type NormalizedStory =
	| { kind: "react"; story: ReactStoryShape }
	| {
			kind: "native";
			title: string;
			mount: (target: unknown, context: unknown) => unknown;
			args?: unknown;
			argTypes?: unknown;
			preview?: unknown;
			tools?: unknown;
			cases?: unknown;
			description?: unknown;
			tags?: unknown;
			parameters?: unknown;
			globals?: unknown;
	  }
	| { kind: "reject"; reason: string };

export function matchesStoryName(name: string, suffix: string): boolean {
	return suffix.size() > 0 && name.size() >= suffix.size() && name.sub(-suffix.size()) === suffix;
}

export function titleFromModuleName(name: string, suffix: string): string {
	return `${name.sub(1, name.size() - suffix.size())}/Native`;
}

function isReactStory(value: unknown): value is ReactStoryShape {
	if (typeOf(value) !== "table") return false;
	const story = value as { title?: unknown; template?: unknown };
	return typeOf(story.title) === "string" && typeOf(story.template) === "function";
}

function argValueMatches(value: unknown, kind: unknown): boolean {
	if (kind === "string") return typeOf(value) === "string";
	if (kind === "boolean") return typeOf(value) === "boolean";
	if (kind === "number") return typeOf(value) === "number";
	if (kind === "enum") return typeOf(value) === "string";
	if (kind === "color") return typeOf(value) === "Color3";
	if (kind === "brickColor") return typeOf(value) === "BrickColor";
	if (kind === "vector2") return typeOf(value) === "Vector2";
	if (kind === "vector3") return typeOf(value) === "Vector3";
	if (kind === "udim") return typeOf(value) === "UDim";
	if (kind === "udim2") return typeOf(value) === "UDim2";
	if (kind === "font") return typeOf(value) === "Font";
	if (kind === "colorSequence") return typeOf(value) === "ColorSequence";
	if (kind === "numberSequence") return typeOf(value) === "NumberSequence";
	if (kind === "EnumItem") return typeOf(value) === "EnumItem";
	if (kind === "cframe") return typeOf(value) === "CFrame";
	if (kind === "rect") return typeOf(value) === "Rect";
	if (kind === "numberRange") return typeOf(value) === "NumberRange";
	if (kind === "ray") return typeOf(value) === "Ray";
	if (kind === "physicalProperties") return typeOf(value) === "PhysicalProperties";
	if (kind === "gradient") {
		if (typeOf(value) !== "table") return false;
		const gradient = value as { color?: unknown; transparency?: unknown; offset?: unknown; enabled?: unknown };
		return (
			typeOf(gradient.color) === "ColorSequence" &&
			typeOf(gradient.transparency) === "NumberSequence" &&
			typeOf(gradient.offset) === "Vector2" &&
			typeOf(gradient.enabled) === "boolean"
		);
	}
	if (kind === "asset") {
		return typeOf(value) === "number" && (value as number) === value && (value as number) >= 0 && (value as number) % 1 === 0;
	}
	if (kind === "object" || kind === "array" || kind === "dictionary" || kind === "union" || kind === "tuple") {
		return typeOf(value) === "table";
	}
	if (kind === "readonly") {
		const kindOf = typeOf(value);
		return kindOf === "function" || kindOf === "Instance" || kindOf === "table";
	}
	if (kind === "custom") return true;
	return false;
}

function argsMatch(args: unknown, argTypes: unknown): boolean {
	if (argTypes === undefined) return true;
	if (typeOf(argTypes) !== "table") return false;
	const values = typeOf(args) === "table" ? (args as { [key: string]: unknown }) : {};
	const specs = argTypes as { [key: string]: { type?: unknown } };
	for (const [key, spec] of pairs(specs)) {
		const value = values[key as string];
		if (value === undefined) continue;
		if (!argValueMatches(value, spec?.type)) return false;
	}
	return true;
}

function modernStory(value: unknown): ReactStoryShape | undefined {
	if (typeOf(value) !== "table") return undefined;
	const story = value as {
		id?: unknown;
		title?: unknown;
		args?: unknown;
		argTypes?: unknown;
		render?: unknown;
		preview?: unknown;
		tools?: unknown;
		cases?: unknown;
		description?: unknown;
		component?: unknown;
		template?: unknown;
		tags?: unknown;
		parameters?: unknown;
		globals?: unknown;
		decorators?: unknown;
		loaders?: unknown;
		features?: unknown;
	};
	if (typeOf(story.title) !== "string" || typeOf(story.render) !== "function") return undefined;
	if (typeOf(story.template) === "function") return undefined;
	if (!argsMatch(story.args, story.argTypes)) return undefined;
	const render = story.render as (args: unknown, context?: unknown) => unknown;
	const args = story.args;
	const decorators = decoratorsOf(story.decorators);
	const loaders = loadersOf(story.loaders);
	const globals = typeOf(story.globals) === "table" ? (story.globals as { [key: string]: unknown }) : undefined;
	const parameters =
		typeOf(story.parameters) === "table" ? (story.parameters as { [key: string]: unknown }) : undefined;
	return {
		id: typeOf(story.id) === "string" ? (story.id as string) : undefined,
		title: story.title as string,
		args,
		argTypes: story.argTypes,
		preview: story.preview,
		tools: story.tools,
		cases: story.cases,
		description: story.description,
		tags: typeOf(story.tags) === "table" ? story.tags : undefined,
		parameters,
		globals,
		features: featureFlags(story.features),
		props: args,
		component: story.component,
		template: (props: unknown, context: unknown) => {
			const value = props !== undefined ? props : args;
			const loaded = runLoaders(loaders, value, globals, parameters);
			const merged = mergeLoaded(value, loaded);
			const nextContext = attachLoaded(context, loaded);
			if (decorators.size() === 0) return render(merged, nextContext);
			let wrapped = (incoming: unknown) => render(incoming, nextContext);
			for (let index = decorators.size() - 1; index >= 0; index--) wrapped = decorators[index](wrapped);
			return wrapped(merged);
		},
	};
}

function loadersOf(
	value: unknown,
): Array<(context: { args: unknown; globals?: unknown; parameters?: unknown }) => unknown> {
	if (typeOf(value) !== "table") return [];
	const kept = new Array<(context: { args: unknown; globals?: unknown; parameters?: unknown }) => unknown>();
	for (const item of value as Array<unknown>) {
		if (typeOf(item) === "function") {
			kept.push(item as (context: { args: unknown; globals?: unknown; parameters?: unknown }) => unknown);
		}
	}
	return kept;
}

function runLoaders(
	loaders: Array<(context: { args: unknown; globals?: unknown; parameters?: unknown }) => unknown>,
	args: unknown,
	globals?: { [key: string]: unknown },
	parameters?: { [key: string]: unknown },
) {
	const loaded: { [key: string]: unknown } = {};
	for (const loader of loaders) {
		try {
			const chunk = loader({ args, globals, parameters });
			if (typeOf(chunk) !== "table") continue;
			for (const [key, value] of pairs(chunk as object)) loaded[key as string] = value;
		} catch {
			// skip failing loaders; render still proceeds with partial loaded data
		}
	}
	return loaded;
}

function mergeLoaded(args: unknown, loaded: { [key: string]: unknown }) {
	const merged: { [key: string]: unknown } = {};
	if (typeOf(args) === "table") {
		for (const [key, value] of pairs(args as object)) merged[key as string] = value;
	}
	for (const [key, value] of pairs(loaded)) merged[key] = value;
	return merged;
}

function attachLoaded(context: unknown, loaded: { [key: string]: unknown }) {
	const base = typeOf(context) === "table" ? (context as { [key: string]: unknown }) : {};
	const attached: { [key: string]: unknown } = {};
	for (const [key, value] of pairs(base)) attached[key] = value;
	attached.loaded = loaded;
	return attached;
}

function featureFlags(value: unknown) {
	const features = typeOf(value) === "table" ? (value as { [key: string]: unknown }) : {};
	return {
		actions: features.actions === true,
		docs: features.docs === true,
		interactions: features.interactions === true,
		outline: features.outline === true,
		measure: features.measure === true,
	};
}

function decoratorsOf(value: unknown): Array<(inner: (args: unknown) => unknown) => (args: unknown) => unknown> {
	if (typeOf(value) !== "table") return [];
	const kept: Array<(inner: (args: unknown) => unknown) => (args: unknown) => unknown> = [];
	for (const item of value as Array<unknown>) {
		if (typeOf(item) === "function") {
			kept.push(item as (inner: (args: unknown) => unknown) => (args: unknown) => unknown);
		}
	}
	return kept;
}

export function normalizeExport(mod: unknown, moduleName: string, suffix: string): NormalizedStory {
	if (!matchesStoryName(moduleName, suffix)) {
		return { kind: "reject", reason: "suffix" };
	}
	if (typeOf(mod) === "function") {
		return { kind: "native", title: titleFromModuleName(moduleName, suffix), mount: mod as (target: unknown) => unknown };
	}
	if (typeOf(mod) !== "table") {
		return { kind: "reject", reason: "export" };
	}
	const exported = mod as { default?: unknown; renderer?: unknown; mount?: unknown; title?: unknown };
	if (typeOf(exported.default) === "table") {
		const candidate = exported.default as { template?: unknown; render?: unknown };
		if (typeOf(candidate.template) === "function" && typeOf(candidate.render) === "function") {
			return { kind: "reject", reason: "ambiguous" };
		}
	}
	const modern = modernStory(exported.default);
	const react = isReactStory(exported.default) ? exported.default : undefined;
	const native = exported.renderer === "native" && typeOf(exported.mount) === "function";
	if ((react || modern) && (native || typeOf(exported.mount) === "function" || typeOf(exported.renderer) === "string")) {
		return { kind: "reject", reason: "ambiguous" };
	}
	if (modern === undefined && typeOf(exported.default) === "table") {
		const candidate = exported.default as { title?: unknown; render?: unknown; argTypes?: unknown };
		if (typeOf(candidate.title) === "string" && typeOf(candidate.render) === "function" && candidate.argTypes !== undefined) {
			if (!argsMatch((exported.default as { args?: unknown }).args, candidate.argTypes)) {
				return { kind: "reject", reason: "args" };
			}
		}
	}
	if (modern) return { kind: "react", story: modern };
	if (react) return { kind: "react", story: react };
	if (exported.renderer === "native" && typeOf(exported.mount) !== "function") {
		return { kind: "reject", reason: "export" };
	}
	if (native) {
		if (typeOf(exported.title) !== "string") return { kind: "reject", reason: "title" };
		const described = exported as {
			args?: unknown;
			argTypes?: unknown;
			preview?: unknown;
			tools?: unknown;
			cases?: unknown;
			description?: unknown;
			tags?: unknown;
			parameters?: unknown;
			globals?: unknown;
		};
		if (!argsMatch(described.args, described.argTypes)) return { kind: "reject", reason: "args" };
		return {
			kind: "native",
			title: exported.title as string,
			mount: exported.mount as (target: unknown) => unknown,
			args: described.args,
			argTypes: described.argTypes,
			preview: described.preview,
			tools: described.tools,
			cases: described.cases,
			description: described.description,
			tags: typeOf(described.tags) === "table" ? described.tags : undefined,
			parameters: typeOf(described.parameters) === "table" ? described.parameters : undefined,
			globals: typeOf(described.globals) === "table" ? described.globals : undefined,
		};
	}
	return { kind: "reject", reason: "export" };
}
