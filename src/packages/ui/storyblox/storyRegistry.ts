export interface TitledStory {
	title: string;
}

export function upsertStory<T extends TitledStory>(stories: T[], story: T): T[] {
	const replaced = stories.filter((item) => item.title !== story.title);
	replaced.push(story);
	return replaced;
}

export function removeStory<T extends TitledStory>(stories: T[], title: string): T[] {
	return stories.filter((item) => item.title !== title);
}

export function keepSelection<T extends TitledStory>(current: T | undefined, incoming: T, preferred?: string) {
	if (preferred !== undefined) return preferred === incoming.title ? incoming : current;
	return current === undefined || current.title === incoming.title ? incoming : current;
}

export function createStorySession<T extends TitledStory>(update: (apply: (stories: T[]) => T[]) => void) {
	return {
		upsert(story: T) {
			update((stories) => upsertStory(stories, story));
		},
		remove(title: string) {
			update((stories) => removeStory(stories, title));
		},
	};
}
