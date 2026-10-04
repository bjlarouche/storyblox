export interface ReactStoryShape {
	title: string;
	template: (...args: never[]) => unknown;
	component?: unknown;
	props?: unknown;
}

export type NormalizedStory =
	| { kind: "react"; story: ReactStoryShape }
	| { kind: "native"; title: string; mount: (target: unknown, context: unknown) => unknown }
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
	const react = isReactStory(exported.default) ? exported.default : undefined;
	const native = exported.renderer === "native" && typeOf(exported.mount) === "function";
	if (react && (native || typeOf(exported.mount) === "function" || typeOf(exported.renderer) === "string")) {
		return { kind: "reject", reason: "ambiguous" };
	}
	if (react) return { kind: "react", story: react };
	if (exported.renderer === "native" && typeOf(exported.mount) !== "function") {
		return { kind: "reject", reason: "export" };
	}
	if (native) {
		if (typeOf(exported.title) !== "string") return { kind: "reject", reason: "title" };
		return {
			kind: "native",
			title: exported.title as string,
			mount: exported.mount as (target: unknown) => unknown,
		};
	}
	return { kind: "reject", reason: "export" };
}
