export type Category = "Body" | "Clothing" | "Hair" | "Hats" | "Animations";
export type Slot = "skin" | "face" | "shirt" | "pants" | "hair" | "hat" | "pose";

export interface Piece {
	id: string;
	name: string;
	category: Category;
	slot: Slot;
	kind: string;
	color: Color3;
}

export interface Equipped {
	skin: string;
	face: string;
	shirt: string;
	pants: string;
	hair: string;
	hat: string;
	pose: string;
}

export interface Look {
	skin: Color3;
	face: string;
	shirt: Color3;
	pants: Color3;
	hair: string;
	hairColor: Color3;
	hat: string;
	hatColor: Color3;
	pose: string;
}

export interface Block {
	id: string;
	size: Vector3;
	cf: CFrame;
	color: Color3;
	shape?: Enum.PartType;
	material?: Enum.Material;
}

export const CATEGORIES: Array<{ label: string; value: Category }> = [
	{ label: "Body", value: "Body" },
	{ label: "Clothing", value: "Clothing" },
	{ label: "Hair", value: "Hair" },
	{ label: "Hats", value: "Hats" },
	{ label: "Animations", value: "Animations" },
];

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

export const PIECES: Array<Piece> = [
	{ id: "warm", name: "Warm", category: "Body", slot: "skin", kind: "skin", color: rgb(232, 176, 144) },
	{ id: "fair", name: "Fair", category: "Body", slot: "skin", kind: "skin", color: rgb(255, 214, 186) },
	{ id: "tan", name: "Tan", category: "Body", slot: "skin", kind: "skin", color: rgb(198, 140, 98) },
	{ id: "olive", name: "Olive", category: "Body", slot: "skin", kind: "skin", color: rgb(166, 124, 82) },
	{ id: "brown", name: "Brown", category: "Body", slot: "skin", kind: "skin", color: rgb(124, 78, 52) },
	{ id: "deep", name: "Deep", category: "Body", slot: "skin", kind: "skin", color: rgb(74, 48, 36) },
	{ id: "smile", name: "Smile", category: "Body", slot: "face", kind: "smile", color: rgb(40, 40, 46) },
	{ id: "neutral", name: "Neutral", category: "Body", slot: "face", kind: "neutral", color: rgb(120, 120, 128) },
	{ id: "wide", name: "Wide", category: "Body", slot: "face", kind: "wide", color: rgb(176, 72, 68) },
	{ id: "hoodie", name: "Blue hoodie", category: "Clothing", slot: "shirt", kind: "shirt", color: rgb(36, 120, 196) },
	{ id: "tee", name: "White tee", category: "Clothing", slot: "shirt", kind: "shirt", color: rgb(236, 236, 232) },
	{ id: "jacket", name: "Black jacket", category: "Clothing", slot: "shirt", kind: "shirt", color: rgb(32, 32, 36) },
	{ id: "red", name: "Red shirt", category: "Clothing", slot: "shirt", kind: "shirt", color: rgb(176, 48, 52) },
	{ id: "knit", name: "Green knit", category: "Clothing", slot: "shirt", kind: "shirt", color: rgb(46, 122, 86) },
	{ id: "black", name: "Black pants", category: "Clothing", slot: "pants", kind: "pants", color: rgb(28, 28, 32) },
	{ id: "khaki", name: "Khaki pants", category: "Clothing", slot: "pants", kind: "pants", color: rgb(176, 148, 96) },
	{ id: "jeans", name: "Blue jeans", category: "Clothing", slot: "pants", kind: "pants", color: rgb(52, 78, 128) },
	{
		id: "shorts",
		name: "Gray shorts",
		category: "Clothing",
		slot: "pants",
		kind: "pants",
		color: rgb(120, 124, 128),
	},
	{ id: "bald", name: "None", category: "Hair", slot: "hair", kind: "none", color: rgb(196, 190, 182) },
	{ id: "short", name: "Short dark", category: "Hair", slot: "hair", kind: "short", color: rgb(36, 28, 24) },
	{ id: "tall", name: "Tall black", category: "Hair", slot: "hair", kind: "tall", color: rgb(20, 18, 18) },
	{ id: "side", name: "Side brown", category: "Hair", slot: "hair", kind: "side", color: rgb(92, 56, 32) },
	{ id: "bun", name: "Blonde bun", category: "Hair", slot: "hair", kind: "bun", color: rgb(214, 176, 96) },
	{ id: "nohat", name: "None", category: "Hats", slot: "hat", kind: "none", color: rgb(196, 190, 182) },
	{ id: "cap", name: "Red cap", category: "Hats", slot: "hat", kind: "cap", color: rgb(186, 42, 48) },
	{ id: "beanie", name: "Beanie", category: "Hats", slot: "hat", kind: "beanie", color: rgb(48, 72, 140) },
	{ id: "brim", name: "Straw brim", category: "Hats", slot: "hat", kind: "brim", color: rgb(210, 170, 84) },
	{ id: "idle", name: "Idle", category: "Animations", slot: "pose", kind: "idle", color: rgb(120, 144, 168) },
	{ id: "wave", name: "Wave", category: "Animations", slot: "pose", kind: "wave", color: rgb(64, 140, 196) },
	{ id: "cheer", name: "Cheer", category: "Animations", slot: "pose", kind: "cheer", color: rgb(214, 164, 64) },
	{ id: "sit", name: "Sit", category: "Animations", slot: "pose", kind: "sit", color: rgb(92, 150, 112) },
];

export const STARTER: Equipped = {
	skin: "warm",
	face: "smile",
	shirt: "hoodie",
	pants: "black",
	hair: "short",
	hat: "nohat",
	pose: "idle",
};

function findPiece(id: string) {
	for (const piece of PIECES) if (piece.id === id) return piece;
	error(`unknown piece ${id}`);
}

export function lookOf(equipped: Equipped): Look {
	const skin = findPiece(equipped.skin);
	const face = findPiece(equipped.face);
	const shirt = findPiece(equipped.shirt);
	const pants = findPiece(equipped.pants);
	const hair = findPiece(equipped.hair);
	const hat = findPiece(equipped.hat);
	const pose = findPiece(equipped.pose);
	return {
		skin: skin.color,
		face: face.kind,
		shirt: shirt.color,
		pants: pants.color,
		hair: hair.kind,
		hairColor: hair.color,
		hat: hat.kind,
		hatColor: hat.color,
		pose: pose.kind,
	};
}

const SHOE = rgb(42, 36, 32);
const EYE = rgb(28, 26, 30);
const WOOD = rgb(118, 78, 50);
const CREAM = rgb(236, 226, 208);
const RING = rgb(186, 104, 96);
const WALL = rgb(228, 210, 184);
const FLAT = CFrame.Angles(0, 0, math.rad(90));

function block(
	id: string,
	size: Vector3,
	cf: CFrame,
	color: Color3,
	shape?: Enum.PartType,
	material?: Enum.Material,
): Block {
	return { id, size, cf, color, shape, material };
}

function hairLift(kind: string) {
	if (kind === "tall") return 1.05;
	if (kind === "bun") return 0.72;
	if (kind === "short" || kind === "side") return 0.32;
	return 0;
}

function leg(side: number, pose: string, hipY: number, pants: Color3) {
	const x = side * 0.48;
	const tag = side < 0 ? "r" : "l";
	if (pose !== "sit") {
		return [
			block(`${tag}ul`, new Vector3(0.86, 1.15, 0.86), new CFrame(x, 2.285, 0), pants),
			block(`${tag}ll`, new Vector3(0.74, 1.05, 0.74), new CFrame(x, 1.185, 0), pants),
			block(`${tag}ft`, new Vector3(0.84, 0.3, 1.15), new CFrame(x, 0.51, 0.1), SHOE),
		];
	}
	const thigh = new CFrame(x, hipY, 0).mul(CFrame.Angles(math.rad(-80), 0, 0));
	const knee = thigh.mul(new CFrame(0, -1.05, 0));
	const shin = knee.mul(CFrame.Angles(math.rad(70), 0, 0));
	return [
		block(`${tag}ul`, new Vector3(0.86, 1.05, 0.86), thigh.mul(new CFrame(0, -0.52, 0)), pants),
		block(`${tag}ll`, new Vector3(0.74, 0.95, 0.74), shin.mul(new CFrame(0, -0.48, 0)), pants),
		block(`${tag}ft`, new Vector3(0.84, 0.28, 1.1), shin.mul(new CFrame(0, -1.02, 0.1)), SHOE),
	];
}

function arm(side: number, pose: string, shoulderY: number, shirt: Color3, skin: Color3) {
	const tag = side < 0 ? "r" : "l";
	const origin = new Vector3(side * 1.38, shoulderY, 0);
	let shoulder = CFrame.identity;
	let elbow = CFrame.identity;
	if (pose === "wave" && side < 0) {
		shoulder = CFrame.Angles(0, 0, math.rad(-148));
		elbow = CFrame.Angles(0, 0, math.rad(36));
	} else if (pose === "cheer") {
		shoulder = CFrame.Angles(0, 0, math.rad(side < 0 ? -158 : 158));
	}
	const upper = new CFrame(origin).mul(shoulder);
	const bent = upper.mul(new CFrame(0, -1.12, 0)).mul(elbow);
	return [
		block(`${tag}ua`, new Vector3(0.72, 1.12, 0.72), upper.mul(new CFrame(0, -0.56, 0)), shirt),
		block(`${tag}la`, new Vector3(0.64, 0.92, 0.64), bent.mul(new CFrame(0, -0.46, 0)), shirt),
		block(`${tag}hd`, new Vector3(0.58, 0.34, 0.66), bent.mul(new CFrame(0, -1.02, 0)), skin),
	];
}

function face(kind: string, head: Vector3) {
	const z = head.Z + 0.68;
	const eye = kind === "wide" ? 0.28 : 0.2;
	const mouth =
		kind === "wide"
			? block("mouth", new Vector3(0.46, 0.28, 0.08), new CFrame(0, head.Y - 0.28, z), rgb(92, 36, 36))
			: kind === "neutral"
				? block("mouth", new Vector3(0.36, 0.08, 0.08), new CFrame(0, head.Y - 0.28, z), EYE)
				: block("mouth", new Vector3(0.5, 0.12, 0.08), new CFrame(0, head.Y - 0.32, z), EYE);
	return [
		block("eyeL", new Vector3(eye, eye, 0.08), new CFrame(-0.28, head.Y + 0.12, z), EYE),
		block("eyeR", new Vector3(eye, eye, 0.08), new CFrame(0.28, head.Y + 0.12, z), EYE),
		mouth,
	];
}

function hair(kind: string, color: Color3, head: Vector3) {
	const top = head.Y + 0.66;
	if (kind === "none") return new Array<Block>();
	if (kind === "tall") return [block("hair", new Vector3(1.15, 1.05, 1.15), new CFrame(0, top + 0.48, 0), color)];
	if (kind === "side") {
		return [
			block("hair", new Vector3(1.48, 0.36, 1.42), new CFrame(0, top + 0.12, 0), color),
			block("lock", new Vector3(0.38, 0.85, 0.42), new CFrame(0.72, top - 0.15, 0.1), color),
		];
	}
	if (kind === "bun") {
		return [
			block("hair", new Vector3(1.46, 0.32, 1.4), new CFrame(0, top + 0.1, 0), color),
			block("bun", new Vector3(0.7, 0.7, 0.7), new CFrame(0, top + 0.55, -0.1), color, Enum.PartType.Ball),
		];
	}
	return [block("hair", new Vector3(1.5, 0.38, 1.46), new CFrame(0, top + 0.14, 0), color)];
}

function hat(kind: string, color: Color3, head: Vector3, lift: number) {
	if (kind === "none") return new Array<Block>();
	const y = head.Y + 0.66 + lift;
	if (kind === "beanie") return [block("hat", new Vector3(1.46, 0.7, 1.46), new CFrame(0, y + 0.28, 0), color)];
	if (kind === "brim") {
		return [
			block("crown", new Vector3(1.15, 0.48, 1.15), new CFrame(0, y + 0.2, 0), color),
			block(
				"brim",
				new Vector3(0.1, 2.5, 2.5),
				new CFrame(0, y + 0.02, 0).mul(FLAT),
				color,
				Enum.PartType.Cylinder,
			),
		];
	}
	return [
		block("cap", new Vector3(1.5, 0.36, 1.4), new CFrame(0, y + 0.14, 0), color),
		block("visor", new Vector3(1.05, 0.1, 0.62), new CFrame(0, y + 0.02, 0.85), color),
	];
}

function push(into: Array<Block>, more: Array<Block>) {
	for (const item of more) into.push(item);
}

export function sceneBlocks(look: Look) {
	const sit = look.pose === "sit";
	const drop = sit ? 1.45 : 0;
	const lowerY = 3.21 - drop;
	const upperY = 4.27 - drop;
	const head = new Vector3(0, 5.76 - drop, 0);
	const shoulderY = 4.47 - drop;
	const parts = new Array<Block>();
	push(parts, [
		block("floor", new Vector3(30, 0.4, 24), new CFrame(0, -0.2, 1), WOOD, undefined, Enum.Material.Wood),
		block("ring", new Vector3(0.12, 7.4, 7.4), new CFrame(0, 0.06, 0).mul(FLAT), RING, Enum.PartType.Cylinder),
		block("pad", new Vector3(0.32, 5.5, 5.5), new CFrame(0, 0.2, 0).mul(FLAT), CREAM, Enum.PartType.Cylinder),
		block("back", new Vector3(24, 12, 0.45), new CFrame(0, 5.8, -8.5), WALL),
		block("wallL", new Vector3(0.45, 12, 18), new CFrame(-11, 5.8, 0), rgb(214, 194, 166)),
		block("wallR", new Vector3(0.45, 12, 18), new CFrame(11, 5.8, 0), rgb(214, 194, 166)),
		block("lower", new Vector3(1.85, 0.7, 0.98), new CFrame(0, lowerY, 0), look.pants),
		block("upper", new Vector3(2.05, 1.42, 1.05), new CFrame(0, upperY, 0), look.shirt),
		block("neck", new Vector3(0.55, 0.22, 0.55), new CFrame(0, upperY + 0.78, 0), look.skin),
		block("head", new Vector3(1.32, 1.32, 1.32), new CFrame(head), look.skin),
	]);
	push(parts, leg(-1, look.pose, lowerY, look.pants));
	push(parts, leg(1, look.pose, lowerY, look.pants));
	push(parts, arm(-1, look.pose, shoulderY, look.shirt, look.skin));
	push(parts, arm(1, look.pose, shoulderY, look.shirt, look.skin));
	push(parts, face(look.face, head));
	push(parts, hair(look.hair, look.hairColor, head));
	push(parts, hat(look.hat, look.hatColor, head, hairLift(look.hair)));
	return parts;
}
