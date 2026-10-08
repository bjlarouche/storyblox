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

export function bindActionArgs(args: unknown, record: (name: string, ...values: unknown[]) => void) {
	if (typeOf(args) !== "table") return args;
	const bound: { [key: string]: unknown } = {};
	for (const [key, value] of pairs(args as object)) {
		if (typeOf(value) === "function") {
			const fn = value as (...incoming: unknown[]) => unknown;
			bound[key as string] = (...incoming: unknown[]) => {
				record(key as string, ...incoming);
				return fn(...incoming);
			};
		} else {
			bound[key as string] = value;
		}
	}
	return bound;
}

export function wrapStory(
	render: (args: unknown) => unknown,
	decorators: Array<(inner: (args: unknown) => unknown) => (args: unknown) => unknown>,
) {
	let wrapped = render;
	for (let index = decorators.size() - 1; index >= 0; index--) wrapped = decorators[index](wrapped);
	return wrapped;
}
