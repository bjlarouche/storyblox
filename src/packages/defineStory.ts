export interface ControlSpec {
	type: "string" | "boolean" | "number";
}

export const controls = {
	string: (): ControlSpec => ({ type: "string" }),
	boolean: (): ControlSpec => ({ type: "boolean" }),
	number: (): ControlSpec => ({ type: "number" }),
};

export interface ModernStory<T> {
	id?: string;
	title: string;
	args?: T;
	argTypes?: { [key: string]: ControlSpec };
	render: (args: T) => unknown;
	preview?: { kind: string; width: number; height: number };
	component?: unknown;
}

export function defineStory<T>(story: ModernStory<T>): ModernStory<T> {
	return story;
}

export interface ClaimedId {
	id: string;
	title: string;
}

export function claimStoryId(seen: ClaimedId[], id: string | undefined, title: string): boolean {
	if (id === undefined || id.size() === 0) return true;
	const owner = seen.find((item) => item.id === id);
	if (owner !== undefined && owner.title !== title) return false;
	if (owner === undefined) seen.push({ id, title });
	return true;
}

export function releaseStoryId(seen: ClaimedId[], title: string): ClaimedId[] {
	return seen.filter((item) => item.title !== title);
}
