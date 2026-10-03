export type Cleanup = () => void;

export function createCleanupGate() {
	let current: Cleanup | undefined;
	return {
		replace(incoming?: Cleanup) {
			const previous = current;
			current = incoming;
			previous?.();
		},
		dispose() {
			const fn = current;
			current = undefined;
			fn?.();
		},
	};
}

export function readTemplateResult(element: unknown, cleanup: unknown): { element: unknown; cleanup?: Cleanup } {
	if (cleanup !== undefined && typeOf(cleanup) !== "function") {
		throw "template cleanup must be a function";
	}
	return { element, cleanup: cleanup as Cleanup | undefined };
}
