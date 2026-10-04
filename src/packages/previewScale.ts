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
