export interface GalleryRow {
	component: string;
	name: string;
	theme: string;
	pointer: string;
	width: number;
}

export function planGallery(rows: GalleryRow[]) {
	const seen: { [name: string]: boolean } = {};
	const files = new Array<{
		name: string;
		component: string;
		theme: string;
		pointer: string;
		width: number;
		file: string;
		needsPointer: boolean;
	}>();
	for (const row of rows) {
		if (seen[row.name]) return { error: "duplicate" as const };
		seen[row.name] = true;
		files.push({
			name: row.name,
			component: row.component,
			theme: row.theme,
			pointer: row.pointer,
			width: row.width,
			file: `captures/gallery/${row.name}.png`,
			needsPointer: row.pointer !== "rest",
		});
	}
	return { count: files.size(), files };
}
