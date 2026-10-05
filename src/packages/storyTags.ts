function trimTag(value: string): string {
	let start = 1;
	let finish = value.size();
	while (start <= finish && value.sub(start, start) === " ") start += 1;
	while (finish >= start && value.sub(finish, finish) === " ") finish -= 1;
	if (start > finish) return "";
	return value.sub(start, finish);
}

export function normalizeTags(value: unknown): string[] {
	if (typeOf(value) !== "table") return [];
	const tags = new Array<string>();
	for (const item of value as Array<unknown>) {
		if (typeOf(item) !== "string") continue;
		const tag = trimTag(item as string).lower();
		if (tag.size() > 0) tags.push(tag);
	}
	return tags;
}

export function parseTagList(value: string | undefined): string[] {
	if (value === undefined || value.size() === 0) return [];
	const tags = new Array<string>();
	const [spaced] = value.gsub(",", " ");
	for (const part of spaced.split(" ")) {
		const tag = trimTag(part).lower();
		if (tag.size() > 0) tags.push(tag);
	}
	return tags;
}

export function storyHasTag(tags: string[] | undefined, tag: string): boolean {
	const needle = trimTag(tag).lower();
	if (needle.size() === 0) return false;
	for (const item of normalizeTags(tags)) {
		if (item === needle) return true;
	}
	return false;
}

export function filterStoriesByTags<T extends { tags?: string[] }>(
	stories: T[],
	include: string[] | undefined,
	exclude: string[] | undefined,
): T[] {
	const kept = new Array<T>();
	const includeTags = include !== undefined ? normalizeTags(include) : undefined;
	const excludeTags = exclude !== undefined ? normalizeTags(exclude) : undefined;
	for (const story of stories) {
		const tags = story.tags;
		if (excludeTags !== undefined) {
			let blocked = false;
			for (const tag of excludeTags) {
				if (storyHasTag(tags, tag)) {
					blocked = true;
					break;
				}
			}
			if (blocked) continue;
		}
		if (includeTags !== undefined && includeTags.size() > 0) {
			let matched = false;
			for (const tag of includeTags) {
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
