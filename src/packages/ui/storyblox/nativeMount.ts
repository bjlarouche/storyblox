type Cleanup = () => void;

interface Owned {
	Destroy(): void;
}

interface Connection {
	Disconnect(): void;
}

interface Signal {
	Connect(handler: (...args: unknown[]) => void): Connection;
}

export interface NativeContext {
	args: unknown;
	target: unknown;
	theme: unknown;
	sceneRoot?: unknown;
	camera?: unknown;
	own: (instance: Owned) => void;
	connect: (signal: Signal, handler: (...args: unknown[]) => void) => Connection;
	onCleanup: (cleanup: Cleanup) => void;
	action: (name: string, ...values: unknown[]) => void;
	ready: () => void;
	cancelled: () => boolean;
}

export interface NativeAction {
	name: string;
	values: Array<unknown>;
}

export interface NativeHost {
	update?: (args: unknown) => void;
	destroy: () => void;
	ready: () => boolean;
	actions: Array<NativeAction>;
}

const MAX_ACTIONS = 32;

// The canvas destroys its host frame on remount. Unparent first so that destroy does not lock this container.
export function placeNativeHost(target: { Parent?: unknown }, parent: unknown) {
	const host = typeOf(parent) === "Instance" ? parent : undefined;
	pcall(() => {
		target.Parent = host;
	});
}

function createScope() {
	let jobs: Array<Cleanup> = [];
	return {
		add(job: Cleanup) {
			jobs.push(job);
		},
		dispose() {
			const pending = jobs;
			jobs = [];
			for (let index = pending.size() - 1; index >= 0; index--) {
				try {
					pending[index]();
				} catch {
					// keep going
				}
			}
		},
	};
}

export function mountNative(
	mount: (target: unknown, context: NativeContext) => unknown,
	target: unknown,
	args: unknown,
	theme: unknown,
	scene?: { sceneRoot: unknown; camera: unknown },
): NativeHost {
	const scope = createScope();
	const owned: Array<Owned> = [];
	const actions: Array<NativeAction> = [];
	let isReady = false;
	let cancelled = false;
	let userDestroy: Cleanup | undefined;

	const context: NativeContext = {
		args,
		target,
		theme,
		sceneRoot: scene?.sceneRoot,
		camera: scene?.camera,
		own: (instance) => {
			for (const item of owned) {
				if (item === instance) return;
			}
			owned.push(instance);
			scope.add(() => {
				try {
					instance.Destroy();
				} catch {
					// already destroyed with its parent
				}
			});
		},
		connect: (signal, handler) => {
			const connection = signal.Connect(handler);
			scope.add(() => connection.Disconnect());
			return connection;
		},
		onCleanup: (cleanup) => {
			scope.add(cleanup);
		},
		action: (name, ...values) => {
			actions.push({ name, values });
			if (actions.size() > MAX_ACTIONS) actions.shift();
		},
		ready: () => {
			isReady = true;
		},
		cancelled: () => cancelled,
	};

	let returned: unknown;
	try {
		returned = mount(target, context);
	} catch (failure) {
		cancelled = true;
		scope.dispose();
		throw failure;
	}

	let update: ((args: unknown) => void) | undefined;
	if (typeOf(returned) === "function") {
		userDestroy = returned as Cleanup;
	} else if (typeOf(returned) === "table") {
		const controller = returned as { update?: unknown; destroy?: unknown };
		if (typeOf(controller.update) === "function") {
			const apply = controller.update as (incoming: unknown) => void;
			update = (incoming: unknown) => apply(incoming);
		}
		if (typeOf(controller.destroy) === "function") {
			userDestroy = controller.destroy as Cleanup;
		}
	}

	let done = false;
	return {
		update,
		actions,
		ready: () => isReady,
		destroy: () => {
			if (done) return;
			done = true;
			cancelled = true;
			if (userDestroy !== undefined) {
				try {
					userDestroy();
				} catch {
					// scope still disposes
				}
			}
			scope.dispose();
		},
	};
}
