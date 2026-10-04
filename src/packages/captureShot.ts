export interface CaptureShot {
	backend: "studio-window";
	windowId: number;
	name: string;
	pixelWidth: number;
	pixelHeight: number;
	pointWidth: number;
	pointHeight: number;
	scale: number;
	file: string;
}

export function captureShot(input: {
	backend: string;
	windowId: number;
	name: string;
	pixelWidth: number;
	pixelHeight: number;
	pointWidth: number;
	pointHeight: number;
}): CaptureShot | { error: string } {
	if (input.backend !== "studio-window") return { error: "backend" };
	if (input.windowId <= 0 || input.name.size() === 0) return { error: "window" };
	if (input.pixelWidth <= 0 || input.pixelHeight <= 0 || input.pointWidth <= 0 || input.pointHeight <= 0) return { error: "size" };
	return {
		backend: "studio-window",
		windowId: input.windowId,
		name: input.name,
		pixelWidth: input.pixelWidth,
		pixelHeight: input.pixelHeight,
		pointWidth: input.pointWidth,
		pointHeight: input.pointHeight,
		scale: input.pixelWidth / input.pointWidth,
		file: `captures/${input.name}.png`,
	};
}
