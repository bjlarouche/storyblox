export function previewScale(
	mode: "fit" | "actual",
	logicalWidth: number,
	logicalHeight: number,
	dockWidth: number,
	dockHeight: number,
) {
	if (mode === "actual") return 1;
	if (logicalWidth <= 0 || logicalHeight <= 0 || dockWidth <= 0 || dockHeight <= 0) return 1;
	const scale = math.min(dockWidth / logicalWidth, dockHeight / logicalHeight);
	if (scale !== scale || scale === math.huge || scale === -math.huge) return 1;
	return scale;
}

const PRESETS: { [name: string]: { width: number; height: number } } = {
	phone: { width: 390, height: 844 },
	tablet: { width: 1024, height: 768 },
	desktop: { width: 1920, height: 1080 },
	console: { width: 1920, height: 1080 },
};

export function previewSize(preview: unknown, orientation?: "portrait" | "landscape") {
	if (typeOf(preview) !== "table") return undefined;
	const described = preview as { preset?: unknown; width?: unknown; height?: unknown; orientation?: unknown };
	let size: { width: number; height: number } | undefined;
	if (typeOf(described.width) === "number" && typeOf(described.height) === "number") {
		size = { width: described.width as number, height: described.height as number };
	} else if (typeOf(described.preset) === "string") {
		size = PRESETS[described.preset as string];
	}
	if (size === undefined) return undefined;
	const mode =
		orientation ??
		(described.orientation === "portrait" || described.orientation === "landscape"
			? (described.orientation as "portrait" | "landscape")
			: undefined);
	if (mode === "landscape" && size.width < size.height) {
		return { width: size.height, height: size.width };
	}
	if (mode === "portrait" && size.width > size.height) {
		return { width: size.height, height: size.width };
	}
	return size;
}

export function flipOrientation(current: "portrait" | "landscape"): "portrait" | "landscape" {
	return current === "portrait" ? "landscape" : "portrait";
}

export const ZOOM_STEPS = [0.5, 1, 2];

export function stepZoom(current: number, direction: number) {
	let index = 1;
	for (let i = 0; i < ZOOM_STEPS.size(); i++) {
		if (ZOOM_STEPS[i] === current) index = i;
	}
	const step = index + direction;
	if (step < 0 || step >= ZOOM_STEPS.size()) return current;
	return ZOOM_STEPS[step];
}

export const GRID_CELL = 8;

export function gridLineCount(length: number, cell: number) {
	if (length <= 0 || cell <= 0 || length !== length || cell !== cell) return 0;
	return math.max(0, math.floor(length / cell) - 1);
}
