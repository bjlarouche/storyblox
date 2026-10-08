export interface StoryAction {
	name: string;
	values: Array<unknown>;
}

export function createActionLog(cap = 32) {
	const events: Array<StoryAction> = [];
	return {
		events,
		record(name: string, ...values: unknown[]) {
			events.push({ name, values });
			if (events.size() > cap) events.shift();
		},
		reset() {
			while (events.size() > 0) events.pop();
		},
	};
}

export function runSetup(setup: (tools: { onCleanup: (job: () => void) => void }) => void): () => void {
	const jobs: Array<() => void> = [];
	const dispose = () => {
		for (let index = jobs.size() - 1; index >= 0; index--) {
			try {
				jobs[index]();
			} catch {
				// keep going
			}
		}
		while (jobs.size() > 0) jobs.pop();
	};
	try {
		setup({
			onCleanup: (job) => jobs.push(job),
		});
	} catch (error) {
		dispose();
		throw error;
	}
	return dispose;
}

function bindValue(
	value: unknown,
	path: string,
	record: (name: string, ...values: unknown[]) => void,
	seen: Array<defined>,
): unknown {
	if (typeOf(value) === "function") {
		if (path.size() === 0) return value;
		const fn = value as (...incoming: unknown[]) => unknown;
		return (...incoming: unknown[]) => {
			record(path, ...incoming);
			return fn(...incoming);
		};
	}
	if (typeOf(value) !== "table") return value;
	for (const item of seen) {
		if (item === value) return value;
	}
	seen.push(value as defined);
	const bound: { [key: string]: unknown } = {};
	let changed = false;
	for (const [key, child] of pairs(value as object)) {
		const name = tostring(key);
		const childPath = path.size() === 0 ? name : `${path}.${name}`;
		const wrapped = bindValue(child, childPath, record, seen);
		bound[key as string] = wrapped;
		if (wrapped !== child) changed = true;
	}
	return changed ? bound : value;
}

export function bindActionArgs(args: unknown, record: (name: string, ...values: unknown[]) => void) {
	return bindValue(args, "", record, new Array<defined>());
}

export function wrapStory(
	render: (args: unknown) => unknown,
	decorators: Array<(inner: (args: unknown) => unknown) => (args: unknown) => unknown>,
) {
	let wrapped = render;
	for (let index = decorators.size() - 1; index >= 0; index--) wrapped = decorators[index](wrapped);
	return wrapped;
}
