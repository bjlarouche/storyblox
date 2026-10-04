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
