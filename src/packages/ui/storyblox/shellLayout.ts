export const NARROW_SHELL = 760;

export function narrowShell(width: number) {
	return width > 0 && width < NARROW_SHELL;
}
