const { insideCanvas } = await import("../src/packages/ui/storyblox/canvasReady.ts");

if (!insideCanvas(0, 0, 100, 100, 10, 10, 20, 20)) throw new Error("inside element was rejected");
if (insideCanvas(0, 0, 100, 100, 10, 10, 0, 20)) throw new Error("zero-size element counted");
if (insideCanvas(0, 0, 100, 100, 100, 10, 5, 5)) throw new Error("element on the far edge counted");
if (insideCanvas(10, 10, 50, 50, 0, 0, 5, 5)) throw new Error("element outside the origin counted");
console.log("canvas ready ok");
