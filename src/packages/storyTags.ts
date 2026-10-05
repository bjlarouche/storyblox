export function normalizeTags(value: unknown): string[] {
	if (typeOf(value) !== "table") return [];
	const tags = new Array<string>();
	for (const item of value as Array<unknown>) {
		if (typeOf(item) === "string" && (item as string).size() > 0) tags.push(item as string);
	}
	return tags;
}

export function parseTagList(value: string | undefined): string[] {
	if (value === undefined || value.size() === 0) return [];
	const tags = new Array<string>();
	for (const part of value.split(",")) {
		const tag = part;
		if (tag.size() > 0) tags.push(tag);
	}
	return tags;
}

export function storyHasTag(tags: string[] | undefined, tag: string): boolean {
	if (tags === undefined || tag.size() === 0) return false;
	for (const item of tags) {
		if (item === tag) return true;
	}
	return false;
}

export function filterStoriesByTags<T extends { tags?: string[] }>(
	stories: T[],
	include: string[] | undefined,
	exclude: string[] | undefined,
): T[] {
	const kept = new Array<T>();
	for (const story of stories) {
		const tags = story.tags;
		if (exclude !== undefined) {
			let blocked = false;
			for (const tag of exclude) {
				if (storyHasTag(tags, tag)) {
					blocked = true;
					break;
				}
			}
			if (blocked) continue;
		}
		if (include !== undefined && include.size() > 0) {
			let matched = false;
			for (const tag of include) {
				if (storyHasTag(tags, tag)) {
					matched = true;
					break;
				}
			}
			if (!matched) continue;
		}
		kept.push(story);
	}
	return kept;
}
