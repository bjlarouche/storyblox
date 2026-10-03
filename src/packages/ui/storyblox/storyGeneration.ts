export function nextGeneration(current: number): number {
	return current + 1;
}

export function acceptGeneration(token: number, latest: number, failed: boolean): boolean {
	return token === latest && !failed;
}
