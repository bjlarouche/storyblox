export interface ReactStoryShape {
	title: string;
	template: (...args: never[]) => unknown;
	component?: unknown;
	props?: unknown;
	id?: string;
	args?: unknown;
	argTypes?: unknown;
	preview?: unknown;
}

export type NormalizedStory =
	| { kind: "react"; story: ReactStoryShape }
	| {
			kind: "native";
			title: string;
			mount: (target: unknown, context: unknown) => unknown;
			args?: unknown;
			argTypes?: unknown;
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
	if (kind === "vector2") return typeOf(value) === "Vector2";
	if (kind === "vector3") return typeOf(value) === "Vector3";
	if (kind === "udim") return typeOf(value) === "UDim";
	if (kind === "udim2") return typeOf(value) === "UDim2";
	if (kind === "EnumItem") return typeOf(value) === "EnumItem";
	if (kind === "cframe") return typeOf(value) === "CFrame";
	if (kind === "asset") {
		return typeOf(value) === "number" && (value as number) === value && (value as number) >= 0 && (value as number) % 1 === 0;
	}
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
		component?: unknown;
		template?: unknown;
	};
	if (typeOf(story.title) !== "string" || typeOf(story.render) !== "function") return undefined;
	if (typeOf(story.template) === "function") return undefined;
	if (!argsMatch(story.args, story.argTypes)) return undefined;
	const render = story.render as (args: unknown) => unknown;
	const args = story.args;
	return {
		id: typeOf(story.id) === "string" ? (story.id as string) : undefined,
		title: story.title as string,
		args,
		argTypes: story.argTypes,
		preview: story.preview,
		props: args,
		component: story.component,
		template: (props: unknown) => render(props !== undefined ? props : args),
	};
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
		const described = exported as { args?: unknown; argTypes?: unknown };
		if (!argsMatch(described.args, described.argTypes)) return { kind: "reject", reason: "args" };
		return {
			kind: "native",
			title: exported.title as string,
			mount: exported.mount as (target: unknown) => unknown,
			args: described.args,
			argTypes: described.argTypes,
		};
	}
	return { kind: "reject", reason: "export" };
}
