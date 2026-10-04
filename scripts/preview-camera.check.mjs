globalThis.math = {
	pi: Math.PI,
	sin: Math.sin,
	cos: Math.cos,
	atan2: Math.atan2,
	sqrt: Math.sqrt,
};

const { orbitOffset, ORBIT_STEP, CAMERA_PITCH, CAMERA_DISTANCE } = await import("../src/packages/previewCamera.ts");

function near(actual, expected) {
	return Math.abs(actual - expected) < 1e-6;
}

const home = orbitOffset(0, CAMERA_PITCH, CAMERA_DISTANCE);
if (!near(home.x, 0) || !near(home.y, 5) || !near(home.z, 10)) throw new Error("home camera");
const turned = orbitOffset(ORBIT_STEP, CAMERA_PITCH, CAMERA_DISTANCE);
if (near(turned.x, home.x)) throw new Error("orbit yaw");
if (orbitOffset(0 / 0, CAMERA_PITCH, CAMERA_DISTANCE).x !== home.x) throw new Error("bad yaw");

console.log("preview camera ok");
