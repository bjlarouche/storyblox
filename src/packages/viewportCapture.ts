export interface ViewportCaptureStatus {
	story: string;
	theme: "dark" | "light";
	ready?: string;
	error?: string;
	stats?: {
		guiObjects: number;
		textObjects: number;
		issues: Array<unknown>;
	};
}

export function validateViewportCapture(status: ViewportCaptureStatus) {
	if (status.story.size() === 0) return { ok: false as const, error: "story" };
	if (status.error !== undefined && status.error.size() > 0) return { ok: false as const, error: status.error };
	const prefix = `${status.story}@`;
	if (status.ready === undefined || status.ready.sub(1, prefix.size()) !== prefix) {
		return { ok: false as const, error: "not ready" };
	}
	if (status.stats === undefined) return { ok: false as const, error: "missing stats" };
	if (status.stats.guiObjects < 1 || status.stats.textObjects < 0)
		return { ok: false as const, error: "empty stats" };
	return { ok: true as const, issueCount: status.stats.issues.size() };
}

export function partitionViewportRows<T extends { needsPointer: boolean }>(rows: T[]) {
	return {
		editRows: rows.filter((row) => !row.needsPointer),
		playRows: rows.filter((row) => row.needsPointer),
	};
}
