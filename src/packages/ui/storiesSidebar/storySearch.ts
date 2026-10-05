export interface StorySearchHit {
	title: string;
	leaf: string;
	breadcrumb: string;
}

export function splitStoryTitle(title: string): { leaf: string; breadcrumb: string } {
	const parts = title.split("/");
	if (parts.size() <= 1) return { leaf: title, breadcrumb: "" };
	const leaf = parts[parts.size() - 1];
	const breadcrumb = title.sub(1, title.size() - leaf.size() - 1);
	return { leaf, breadcrumb };
}

export function storyMatches(title: string, query: string): boolean {
	if (query.size() === 0) return true;
	const haystack = title.upper();
	const needle = query.upper();
	if (needle.size() > haystack.size()) return false;
	const last = haystack.size() - needle.size() + 1;
	for (let index = 1; index <= last; index++) {
		if (haystack.sub(index, index + needle.size() - 1) === needle) return true;
	}
	return false;
}

export function searchStories(titles: string[], query: string): StorySearchHit[] {
	const hits = new Array<StorySearchHit>();
	if (query.size() === 0) return hits;
	for (const title of titles) {
		if (!storyMatches(title, query)) continue;
		const { leaf, breadcrumb } = splitStoryTitle(title);
		hits.push({ title, leaf, breadcrumb });
	}
	return hits;
}

export function stepSearchIndex(current: number, delta: number, count: number): number {
	if (count <= 0) return 0;
	const stepped = current + delta;
	if (stepped < 0) return count - 1;
	if (stepped >= count) return 0;
	return stepped;
}
