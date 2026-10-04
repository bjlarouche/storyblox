export const MAX_CASE_FAILURES = 16;

export interface CaseResult {
	name: string;
	passed: boolean;
	failures: Array<string>;
}

export function createCaseClock() {
	let now = 0;
	let timers: Array<{ at: number; job: () => void }> = [];
	return {
		now: () => now,
		after: (delay: number, job: () => void) => {
			timers.push({ at: now + delay, job });
		},
		advance: (delta: number) => {
			now += delta;
			const due = timers.filter((timer) => timer.at <= now);
			timers = timers.filter((timer) => timer.at > now);
			due.sort((a, b) => a.at < b.at);
			for (const timer of due) timer.job();
		},
		cancel: () => {
			timers = [];
		},
	};
}

export function createSeed(seed: number) {
	let state = seed % 2147483647;
	if (state <= 0) state += 2147483646;
	return () => {
		state = (state * 16807) % 2147483647;
		return (state - 1) / 2147483646;
	};
}

export function runCase<E extends object>(
	name: string,
	body: (env: E & { expect: (ok: boolean, message: string) => void }) => void,
	env: E,
	cancelled: () => boolean,
): CaseResult {
	const failures: Array<string> = [];
	const record = (message: string) => {
		if (failures.size() < MAX_CASE_FAILURES) failures.push(message);
	};
	const expect = (ok: boolean, message: string) => {
		if (!ok) record(message);
	};
	try {
		body({ ...env, expect });
	} catch (error) {
		record(`threw: ${error}`);
	}
	if (cancelled()) record("cancelled");
	return { name, passed: failures.size() === 0, failures };
}
