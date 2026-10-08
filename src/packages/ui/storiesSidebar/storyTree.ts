export interface StoryNode {
	title: string;
	onClick: () => void;
}

export interface StoryLeaf {
	title: string;
	onClick: () => void;
	icon: string;
}

export interface StoryBranch {
	title: string;
	leaves: StoryLeaf[];
	branches?: StoryBranch[];
	icon?: string;
}

export interface StoryIcons {
	folder: string;
	story: string;
	starred: string;
}

export function sortByTitle<T extends { title: string }>(items: T[]) {
	for (let i = 1; i < items.size(); i++) {
		const item = items[i];
		let j = i;
		while (j > 0 && items[j - 1].title > item.title) {
			items[j] = items[j - 1];
			j -= 1;
		}
		items[j] = item;
	}
}

function ensureBranch(branches: StoryBranch[], title: string): StoryBranch {
	const found = branches.find((branch) => branch.title === title);
	if (found !== undefined) return found;
	const created: StoryBranch = { title, leaves: [] };
	branches.push(created);
	return created;
}

export function parseFavorites(saved: string | undefined) {
	if (saved === undefined || saved.size() === 0) return new Array<string>();
	return saved.split(",").filter((title) => title.size() > 0);
}

export function toggleFavorite(current: string[], title: string) {
	const chosen = current.filter((item) => item !== title);
	if (chosen.size() === current.size()) chosen.push(title);
	return chosen;
}

export function adoptTree<T extends { title: string; branches: unknown[] }>(current: T | undefined, incoming: T): T {
	if (current === undefined) return incoming;
	current.title = incoming.title;
	current.branches = incoming.branches;
	return current;
}

export function favoriteBranch(stories: StoryNode[], titles: string[], icons: StoryIcons): StoryBranch | undefined {
	const leaves: StoryLeaf[] = [];
	for (const title of titles) {
		const story = stories.find((item) => item.title === title);
		if (story !== undefined) leaves.push({ title, onClick: story.onClick, icon: icons.story });
	}
	if (leaves.size() === 0) return undefined;
	return { title: "Starred", leaves, icon: icons.starred };
}

export function orderedStoryTitles(branches: StoryBranch[]): string[] {
	const titles = new Array<string>();
	const walk = (nodes: StoryBranch[], prefix: string) => {
		for (const branch of nodes) {
			const path = prefix.size() === 0 ? branch.title : `${prefix}/${branch.title}`;
			for (const leaf of branch.leaves) titles.push(`${path}/${leaf.title}`);
			if (branch.branches !== undefined && branch.branches.size() > 0) walk(branch.branches, path);
		}
	};
	walk(branches, "");
	return titles;
}

export function stepStoryTitle(titles: string[], current: string | undefined, delta: number): string | undefined {
	if (titles.size() === 0 || delta === 0) return undefined;
	let index = -1;
	if (current !== undefined) {
		for (let cursor = 0; cursor < titles.size(); cursor++) {
			if (titles[cursor] === current) {
				index = cursor;
				break;
			}
		}
	}
	const start = index >= 0 ? index : delta > 0 ? -1 : 0;
	let cursor = start + delta;
	if (cursor < 0) cursor = titles.size() - 1;
	else if (cursor >= titles.size()) cursor = 0;
	return titles[cursor];
}

function looseTitle(title: string) {
	if (title.size() === 0) return false;
	const parts = title.split("/");
	return parts.size() < 2 || parts[0].size() === 0;
}

export function navStoryTitles(stories: Array<{ title: string }>): string[] {
	const icons = { folder: "", story: "", starred: "" };
	const nodes = new Array<StoryNode>();
	const loose = new Array<{ title: string }>();
	for (const story of stories) {
		nodes.push({ title: story.title, onClick: () => {} });
		if (looseTitle(story.title)) loose.push(story);
	}
	sortByTitle(loose);
	const titles = orderedStoryTitles(storyBranches(nodes, icons));
	for (const story of loose) titles.push(story.title);
	return titles;
}

export function storyBranches(stories: StoryNode[], icons: StoryIcons): StoryBranch[] {
	const roots: StoryBranch[] = [];

	for (const story of stories) {
		const parts = story.title.split("/");
		if (parts.size() < 2 || parts[0].size() === 0) continue;

		let level = roots;
		const last = parts.size() - 1;
		for (let index = 0; index < last; index++) {
			const branch = ensureBranch(level, parts[index]);
			if (index === last - 1) {
				branch.leaves.push({
					title: parts[index + 1],
					onClick: story.onClick,
					icon: icons.story,
				});
			} else {
				if (branch.branches === undefined) branch.branches = [];
				level = branch.branches;
			}
		}
	}

	const paint = (branches: StoryBranch[]) => {
		sortByTitle(branches);
		for (const branch of branches) {
			branch.icon = icons.folder;
			sortByTitle(branch.leaves);
			if (branch.branches !== undefined && branch.branches.size() > 0) paint(branch.branches);
		}
	};
	paint(roots);
	return roots;
}
