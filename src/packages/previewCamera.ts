export const ORBIT_STEP = math.pi / 8;
export const CAMERA_PITCH = math.atan2(5, 10);
export const CAMERA_DISTANCE = math.sqrt(5 * 5 + 10 * 10);

export const DRAG_RADIANS_PER_PIXEL = 0.01;

export function dragYaw(yaw: number, dx: number) {
	if (dx !== dx) return yaw;
	return yaw - dx * DRAG_RADIANS_PER_PIXEL;
}

export function orbitOffset(yaw: number, pitch: number, distance: number) {
	const dist = distance > 0 && distance === distance ? distance : 10;
	const safeYaw = yaw === yaw ? yaw : 0;
	const safePitch = pitch === pitch ? pitch : 0;
	const raised = math.sin(safePitch) * dist;
	const planar = math.cos(safePitch) * dist;
	return { x: math.sin(safeYaw) * planar, y: raised, z: math.cos(safeYaw) * planar };
}
