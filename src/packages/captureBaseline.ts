export interface CaptureSummary {
	story: string;
	theme: "dark" | "light";
	guiObjects?: number;
	textObjects?: number;
	issues?: { [key: string]: number };
	error?: string;
}

function themeName(value: unknown): "dark" | "light" | undefined {
	if (value === "dark" || value === "Dark") return "dark";
	if (value === "light" || value === "Light") return "light";
	return undefined;
}

function issueCounts(value: unknown): { [key: string]: number } {
	const counts: { [key: string]: number } = {};
	if (typeOf(value) !== "table") return counts;
	const list = value as Array<{ kind?: unknown }>;
	if (list[0] !== undefined && typeOf(list[0]) === "table") {
		for (const issue of list) {
			if (typeOf(issue) !== "table" || typeOf(issue.kind) !== "string") continue;
			const kind = issue.kind as string;
			counts[kind] = (counts[kind] ?? 0) + 1;
		}
		return counts;
	}
	for (const [key, count] of pairs(value as object)) {
		if (typeOf(count) === "number") counts[key as string] = count as number;
	}
	return counts;
}

export function summarizeCapture(raw: unknown): CaptureSummary {
	const row = typeOf(raw) === "table" ? (raw as { [key: string]: unknown }) : {};
	const story = typeOf(row.story) === "string" ? (row.story as string) : typeOf(row.storyId) === "string" ? (row.storyId as string) : "";
	const theme = themeName(row.theme) ?? "dark";
	if (story.size() === 0) return { story, theme, error: "story" };
	const ready = row.ready;
	if (typeOf(ready) === "string" && (ready as string).sub(1, story.size() + 1) !== `${story}@`) {
		return { story, theme, error: "not ready" };
	}
	if (row.ok === false || (typeOf(row.error) === "string" && (row.error as string).size() > 0)) {
		const message = typeOf(row.error) === "string" ? (row.error as string) : "not ok";
		return { story, theme, error: message };
	}
	const stats = typeOf(row.stats) === "table" ? (row.stats as { [key: string]: unknown }) : row;
	const guiObjects = stats.guiObjects;
	const textObjects = stats.textObjects;
	if (typeOf(guiObjects) !== "number" || (guiObjects as number) < 1 || typeOf(textObjects) !== "number" || (textObjects as number) < 0) {
		return { story, theme, error: "empty stats" };
	}
	return {
		story,
		theme,
		guiObjects: guiObjects as number,
		textObjects: textObjects as number,
		issues: issueCounts(stats.issues),
	};
}

function summaryKey(row: CaptureSummary): string {
	return `${row.story}@${row.theme}`;
}

function indexRows(rows: CaptureSummary[]): { [key: string]: CaptureSummary } {
	const map: { [key: string]: CaptureSummary } = {};
	for (const row of rows) map[summaryKey(row)] = row;
	return map;
}

function sortedKeys(map: { [key: string]: unknown }): string[] {
	const keys = new Array<string>();
	for (const [key] of pairs(map)) keys.push(key as string);
	keys.sort();
	return keys;
}

function issueCount(row: CaptureSummary, kind: string): number {
	const value = row.issues?.[kind];
	return typeOf(value) === "number" ? (value as number) : 0;
}

export function diffCaptureBaseline(expected: CaptureSummary[], actual: CaptureSummary[]): string[] {
	const left = indexRows(expected);
	const right = indexRows(actual);
	const seen: { [key: string]: boolean } = {};
	for (const key of sortedKeys(left)) seen[key] = true;
	for (const key of sortedKeys(right)) seen[key] = true;
	const lines = new Array<string>();
	for (const key of sortedKeys(seen)) {
		const before = left[key];
		const after = right[key];
		if (before === undefined) {
			lines.push(`${key} extra`);
			continue;
		}
		if (after === undefined) {
			lines.push(`${key} missing`);
			continue;
		}
		if ((before.error ?? "") !== (after.error ?? "")) {
			lines.push(`${key} error ${before.error ?? ""} -> ${after.error ?? ""}`);
		}
		if (before.guiObjects !== after.guiObjects) {
			lines.push(`${key} guiObjects ${before.guiObjects ?? ""} -> ${after.guiObjects ?? ""}`);
		}
		if (before.textObjects !== after.textObjects) {
			lines.push(`${key} textObjects ${before.textObjects ?? ""} -> ${after.textObjects ?? ""}`);
		}
		const kinds: { [key: string]: boolean } = {};
		if (before.issues !== undefined) for (const [kind] of pairs(before.issues)) kinds[kind as string] = true;
		if (after.issues !== undefined) for (const [kind] of pairs(after.issues)) kinds[kind as string] = true;
		for (const kind of sortedKeys(kinds)) {
			const from = issueCount(before, kind);
			const to = issueCount(after, kind);
			if (from !== to) lines.push(`${key} issues.${kind} ${from} -> ${to}`);
		}
	}
	return lines;
}
