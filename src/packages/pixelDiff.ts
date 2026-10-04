export function pixelDiff(left: Array<number>, right: Array<number>) {
	if (left.size() !== right.size() || left.size() === 0) return { error: "size" as const };
	let changed = 0;
	for (let index = 0; index < left.size(); index++) {
		if (left[index] !== right[index]) changed += 1;
	}
	return { changed, total: left.size(), ratio: changed / left.size() };
}
