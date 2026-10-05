export type ControlStory = {
	title?: string;
	args?: unknown;
	props?: unknown;
	argTypes?: unknown;
	description?: unknown;
};

export function storyArgs(story?: ControlStory) {
	return story?.args ?? story?.props;
}

export function hasStoryControls(story?: ControlStory) {
	const types = story?.argTypes;
	if (typeOf(types) === "table") {
		for (const _ of pairs(types as object)) return true;
	}
	const args = storyArgs(story);
	if (typeOf(args) === "table") {
		for (const _ of pairs(args as object)) return true;
	}
	return false;
}

export function withStoryControls<T extends object>(story: ControlStory | undefined, patch: T) {
	const args = storyArgs(story);
	return {
		title: story?.title ?? "Error/Rendering",
		args,
		props: args,
		argTypes: story?.argTypes,
		description: story?.description,
		...patch,
	};
}
