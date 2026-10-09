export type CanvasLayout = "centered" | "padded" | "fullscreen";

export type ActionFilter = "off" | "all" | { names: string[] } | { prefix: string };

export function canvasLayout(parameters: unknown): CanvasLayout {
	if (typeOf(parameters) !== "table") return "padded";
	const layout = (parameters as { layout?: unknown }).layout;
	if (layout === "centered" || layout === "fullscreen" || layout === "padded") return layout;
	return "padded";
}

export function docsPage(parameters: unknown): string | false | undefined {
	if (typeOf(parameters) !== "table") return undefined;
	const docs = (parameters as { docs?: unknown }).docs;
	if (docs === false) return false;
	if (typeOf(docs) === "string") {
		const text = docs as string;
		return text.size() > 0 ? text : undefined;
	}
	if (typeOf(docs) !== "table") return undefined;
	const page = (docs as { page?: unknown }).page;
	if (typeOf(page) === "string" && (page as string).size() > 0) return page as string;
	return undefined;
}

function stringsOf(value: unknown): string[] | undefined {
	if (typeOf(value) !== "table") return undefined;
	const names = new Array<string>();
	for (const item of value as Array<unknown>) {
		if (typeOf(item) === "string" && (item as string).size() > 0) names.push(item as string);
	}
	return names;
}

export function actionFilter(parameters: unknown): ActionFilter {
	if (typeOf(parameters) !== "table") return "all";
	const actions = (parameters as { actions?: unknown }).actions;
	if (actions === false) return "off";
	if (typeOf(actions) !== "table") return "all";
	const spec = actions as { names?: unknown; prefix?: unknown };
	const names = stringsOf(spec.names);
	if (names !== undefined) return { names };
	if (typeOf(spec.prefix) === "string" && (spec.prefix as string).size() > 0) return { prefix: spec.prefix as string };
	return "all";
}

function tail(path: string): string {
	let start = 1;
	for (let index = 1; index <= path.size(); index++) {
		if (path.sub(index, index) === ".") start = index + 1;
	}
	return path.sub(start, path.size());
}

export function allowAction(filter: ActionFilter, path: string): boolean {
	if (filter === "off") return false;
	if (filter === "all") return true;
	if ("names" in filter) {
		for (const name of filter.names) {
			if (name === path) return true;
		}
		return false;
	}
	const name = tail(path);
	return name.size() >= filter.prefix.size() && name.sub(1, filter.prefix.size()) === filter.prefix;
}
