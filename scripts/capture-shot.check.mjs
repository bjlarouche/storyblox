String.prototype.size = function size() {
	return this.length;
};

const { captureShot } = await import("../src/packages/captureShot.ts");

const shot = captureShot({
	backend: "studio-window",
	windowId: 11345,
	name: "dock",
	pixelWidth: 3456,
	pixelHeight: 2160,
	pointWidth: 1728,
	pointHeight: 1080,
});
if (shot.error || shot.scale !== 2 || shot.file !== "captures/dock.png" || shot.backend !== "studio-window") {
	throw new Error("studio window shot");
}
if (!captureShot({ ...shot, backend: "viewport" }).error) throw new Error("viewport is not a window shot");
if (!captureShot({ ...shot, backend: "studio-window", pixelWidth: 0 }).error) throw new Error("empty shot");
console.log("capture shot ok");
