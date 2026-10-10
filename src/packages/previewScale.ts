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
};

export const PREVIEW_PRESETS = ["phone", "tablet", "desktop"];

const PRESET_LABELS: { [name: string]: string } = {
	phone: "Phone",
	tablet: "Tablet",
	desktop: "Desktop",
};

export function sizeChoice(picked: string | undefined, storyPreview: unknown) {
	if (picked === "phone" || picked === "tablet" || picked === "desktop") return picked;
	if (picked === "responsive") return "responsive";
	if (picked === "story" && previewSize(storyPreview) !== undefined) return "story";
	if (picked === "story") return "responsive";
	return previewSize(storyPreview) !== undefined ? "story" : "responsive";
}

export function sizeChoiceLabel(choice: string) {
	if (choice === "responsive") return "Responsive";
	if (choice === "story") return "Story";
	return PRESET_LABELS[choice] ?? "Size";
}

export function sizeChoiceActive(picked: string | undefined, storyPreview: unknown) {
	const choice = sizeChoice(picked, storyPreview);
	const natural = previewSize(storyPreview) !== undefined ? "story" : "responsive";
	return choice !== natural;
}

export function storySizeLabel(storyPreview: unknown) {
	const size = previewSize(storyPreview);
	if (size === undefined) return undefined;
	return `Story ${math.floor(size.width)}×${math.floor(size.height)}`;
}

export function presetMenuLabel(name: string) {
	const size = PRESETS[name];
	const title = PRESET_LABELS[name];
	if (size === undefined || title === undefined) return name;
	return `${title} ${size.width}×${size.height}`;
}

export function activePreview(storyPreview: unknown, picked: string | undefined) {
	const choice = sizeChoice(picked, storyPreview);
	if (choice === "responsive") return undefined;
	if (choice === "story") return storyPreview;
	return { preset: choice };
}

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

export const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 3, 4];

export function stepZoom(current: number, direction: number) {
	let index = -1;
	for (let i = 0; i < ZOOM_STEPS.size(); i++) {
		if (math.abs(ZOOM_STEPS[i] - current) < 0.001) index = i;
	}
	if (index >= 0) {
		const step = index + direction;
		if (step < 0 || step >= ZOOM_STEPS.size()) return current;
		return ZOOM_STEPS[step];
	}
	if (direction >= 0) {
		for (let i = 0; i < ZOOM_STEPS.size(); i++) {
			if (ZOOM_STEPS[i] > current) return ZOOM_STEPS[i];
		}
		return ZOOM_STEPS[ZOOM_STEPS.size() - 1];
	}
	for (let i = ZOOM_STEPS.size() - 1; i >= 0; i--) {
		if (ZOOM_STEPS[i] < current) return ZOOM_STEPS[i];
	}
	return ZOOM_STEPS[0];
}

export function zoomPresetId(current: number) {
	for (let i = 0; i < ZOOM_STEPS.size(); i++) {
		if (math.abs(ZOOM_STEPS[i] - current) < 0.001) return `${math.round(ZOOM_STEPS[i] * 100)}`;
	}
	return undefined;
}

export const GRID_CELL = 8;

export function gridLineCount(length: number, cell: number) {
	if (length <= 0 || cell <= 0 || length !== length || cell !== cell) return 0;
	return math.max(0, math.floor(length / cell) - 1);
}
