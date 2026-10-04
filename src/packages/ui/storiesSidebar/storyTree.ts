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
	component: string;
	story: string;
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

export function favoriteBranch(stories: StoryNode[], titles: string[], icons: StoryIcons): StoryBranch | undefined {
	const leaves: StoryLeaf[] = [];
	for (const title of titles) {
		const story = stories.find((item) => item.title === title);
		if (story !== undefined) leaves.push({ title, onClick: story.onClick, icon: icons.story });
	}
	if (leaves.size() === 0) return undefined;
	return { title: "Favorites", leaves, icon: icons.folder };
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
		for (const branch of branches) {
			const nested = branch.branches !== undefined && branch.branches.size() > 0;
			branch.icon = nested ? icons.folder : icons.component;
			if (nested && branch.branches !== undefined) paint(branch.branches);
		}
	};
	paint(roots);
	return roots;
}
