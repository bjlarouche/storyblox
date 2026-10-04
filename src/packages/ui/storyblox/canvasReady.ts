/** Bounds test from plugin/smoke.luau: a sized element sitting inside the canvas. */
export function insideCanvas(
	originX: number,
	originY: number,
	boundsX: number,
	boundsY: number,
	x: number,
	y: number,
	width: number,
	height: number,
) {
	if (width <= 0 || height <= 0) return false;
	const px = x - originX;
	const py = y - originY;
	return px >= 0 && py >= 0 && px < boundsX && py < boundsY;
}
