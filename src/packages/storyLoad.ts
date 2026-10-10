/** Reveal the canvas spinner only after this, so a fast story does not flash. */
export const STORY_LOAD_REVEAL = 0.12;

/**
 * A blocking module require never reaches this until it returns.
 * task.defer paints the canvas once before that work starts.
 */
export function revealStoryLoad(elapsed: number, pending: boolean) {
	return pending && elapsed >= STORY_LOAD_REVEAL;
}

export function acceptStoryLoad(token: number, current: number) {
	return token === current;
}
