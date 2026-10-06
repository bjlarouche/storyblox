export interface Thenable {
	then?: (onOk: (value: unknown) => void, onErr: (reason: unknown) => void) => unknown;
	andThen?: (self: unknown, onOk: (value: unknown) => void, onErr: (reason: unknown) => void) => unknown;
}

export function isThenable(value: unknown): value is Thenable {
	if (value === undefined || typeOf(value) !== "table") return false;
	const called = value as Thenable;
	return typeOf(called.then) === "function" || typeOf(called.andThen) === "function";
}

export interface LoaderBatch {
	loaded: { [key: string]: unknown };
	pending: Thenable[];
	error?: string;
}

export function collectLoaders(
	loaders: Array<(context: { args: unknown; globals?: unknown; parameters?: unknown }) => unknown>,
	args: unknown,
	globals?: { [key: string]: unknown },
	parameters?: { [key: string]: unknown },
): LoaderBatch {
	const loaded: { [key: string]: unknown } = {};
	const pending = new Array<Thenable>();
	for (const loader of loaders) {
		try {
			const chunk = loader({ args, globals, parameters });
			if (isThenable(chunk)) {
				pending.push(chunk);
				continue;
			}
			if (typeOf(chunk) !== "table") continue;
			for (const [key, value] of pairs(chunk as object)) loaded[key as string] = value;
		} catch (error) {
			return { loaded, pending, error: tostring(error) };
		}
	}
	return { loaded, pending };
}

function mergeChunk(loaded: { [key: string]: unknown }, chunk: unknown) {
	if (typeOf(chunk) !== "table" || isThenable(chunk)) return;
	for (const [key, value] of pairs(chunk as object)) loaded[key as string] = value;
}

export function settleLoaders(
	batch: LoaderBatch,
	current: () => boolean,
	onReady: (loaded: { [key: string]: unknown }) => void,
	onError: (message: string) => void,
) {
	const loaded = batch.loaded;
	let index = 0;
	const step = () => {
		if (!current()) return;
		if (index >= batch.pending.size()) {
			onReady(loaded);
			return;
		}
		const item = batch.pending[index];
		index += 1;
		const onOk = (value: unknown) => {
			if (!current()) return;
			mergeChunk(loaded, value);
			step();
		};
		const onErr = (reason: unknown) => {
			if (!current()) return;
			onError(tostring(reason));
		};
		const andThen = item.andThen;
		if (andThen !== undefined) {
			try {
				andThen(item, onOk, onErr);
			} catch (error) {
				onErr(error);
			}
			return;
		}
		const resume = item.then;
		if (resume === undefined) {
			onError("loader thenable missing");
			return;
		}
		try {
			resume(onOk, onErr);
		} catch (error) {
			onErr(error);
		}
	};
	step();
}
