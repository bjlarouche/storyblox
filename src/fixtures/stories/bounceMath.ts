export interface BounceState {
	x: number;
	y: number;
	vx: number;
	vy: number;
}

export interface BounceLeg {
	x: number;
	y: number;
	vx: number;
	vy: number;
	duration: number;
	hitX: number;
	hitY: number;
}

const EPS = 1e-4;

export function seedState(seed: number, width: number, height: number, radius: number): BounceState {
	const angle = ((seed % 12) / 12) * math.pi * 2 + math.pi / 6;
	const vx = math.cos(angle);
	const vy = math.sin(angle);
	const spanX = math.max(width - radius * 2, 0);
	const spanY = math.max(height - radius * 2, 0);
	const x = radius + spanX * (0.25 + (0.5 * ((seed * 17) % 100)) / 100);
	const y = radius + spanY * (0.2 + (0.6 * ((seed * 31) % 100)) / 100);
	return clampState({ x, y, vx, vy }, width, height, radius);
}

export function clampState(state: BounceState, width: number, height: number, radius: number): BounceState {
	const minX = radius;
	const maxX = math.max(width - radius, radius);
	const minY = radius;
	const maxY = math.max(height - radius, radius);
	return {
		x: math.clamp(state.x, minX, maxX),
		y: math.clamp(state.y, minY, maxY),
		vx: state.vx,
		vy: state.vy,
	};
}

export function nextLeg(state: BounceState, width: number, height: number, radius: number, speed: number): BounceLeg {
	const clamped = clampState(state, width, height, radius);
	if (speed <= 0 || width < radius * 2 + EPS || height < radius * 2 + EPS) {
		return {
			x: clamped.x,
			y: clamped.y,
			vx: clamped.vx,
			vy: clamped.vy,
			duration: 0,
			hitX: 0,
			hitY: 0,
		};
	}

	const minX = radius;
	const maxX = width - radius;
	const minY = radius;
	const maxY = height - radius;
	const tx =
		clamped.vx > EPS
			? (maxX - clamped.x) / (clamped.vx * speed)
			: clamped.vx < -EPS
				? (minX - clamped.x) / (clamped.vx * speed)
				: math.huge;
	const ty =
		clamped.vy > EPS
			? (maxY - clamped.y) / (clamped.vy * speed)
			: clamped.vy < -EPS
				? (minY - clamped.y) / (clamped.vy * speed)
				: math.huge;

	if (tx <= EPS && ty <= EPS) {
		return {
			x: clamped.x,
			y: clamped.y,
			vx: -clamped.vx,
			vy: -clamped.vy,
			duration: 0,
			hitX: 1,
			hitY: 1,
		};
	}

	let best: number;
	let hitX = 0;
	let hitY = 0;
	if (math.abs(tx - ty) <= EPS) {
		best = math.min(tx, ty);
		hitX = clamped.vx > 0 ? 1 : clamped.vx < 0 ? -1 : 0;
		hitY = clamped.vy > 0 ? 1 : clamped.vy < 0 ? -1 : 0;
	} else if (tx < ty) {
		best = tx;
		hitX = clamped.vx > 0 ? 1 : -1;
	} else {
		best = ty;
		hitY = clamped.vy > 0 ? 1 : -1;
	}

	if (best === math.huge || best <= EPS) {
		return {
			x: clamped.x,
			y: clamped.y,
			vx: hitX !== 0 ? -clamped.vx : clamped.vx,
			vy: hitY !== 0 ? -clamped.vy : clamped.vy,
			duration: 0,
			hitX,
			hitY,
		};
	}

	return {
		x: clamped.x + clamped.vx * speed * best,
		y: clamped.y + clamped.vy * speed * best,
		vx: hitX !== 0 ? -clamped.vx : clamped.vx,
		vy: hitY !== 0 ? -clamped.vy : clamped.vy,
		duration: best,
		hitX,
		hitY,
	};
}
