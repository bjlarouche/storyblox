export type Category = "Body" | "Clothing" | "Hair" | "Hats" | "Animations";
export type Slot = "skin" | "face" | "shirt" | "pants" | "hair" | "hat" | "pose";

export interface Piece {
	id: string;
	name: string;
	category: Category;
	slot: Slot;
	color: Color3;
	assetId: number;
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

export const CATEGORIES: Array<{ label: string; value: Category }> = [
	{ label: "Body", value: "Body" },
	{ label: "Clothing", value: "Clothing" },
	{ label: "Hair", value: "Hair" },
	{ label: "Hats", value: "Hats" },
	{ label: "Animations", value: "Animations" },
];

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);
const SLOTS: Array<Slot> = ["skin", "face", "shirt", "pants", "hair", "hat", "pose"];
const BLOCKHEAD = 6340101;

export const PIECES: Array<Piece> = [
	{ id: "warm", name: "Warm", category: "Body", slot: "skin", color: rgb(232, 176, 144), assetId: 0 },
	{ id: "fair", name: "Fair", category: "Body", slot: "skin", color: rgb(255, 214, 186), assetId: 0 },
	{ id: "tan", name: "Tan", category: "Body", slot: "skin", color: rgb(198, 140, 98), assetId: 0 },
	{ id: "olive", name: "Olive", category: "Body", slot: "skin", color: rgb(166, 124, 82), assetId: 0 },
	{ id: "brown", name: "Brown", category: "Body", slot: "skin", color: rgb(124, 78, 52), assetId: 0 },
	{ id: "deep", name: "Deep", category: "Body", slot: "skin", color: rgb(74, 48, 36), assetId: 0 },
	{ id: "smile", name: "Smile", category: "Body", slot: "face", color: rgb(40, 40, 46), assetId: 144075659 },
	{ id: "classic", name: "Classic", category: "Body", slot: "face", color: rgb(120, 120, 128), assetId: 86487700 },
	{ id: "silly", name: "Silly", category: "Body", slot: "face", color: rgb(176, 72, 68), assetId: 7699174 },
	{ id: "check", name: "Check It", category: "Body", slot: "face", color: rgb(72, 96, 140), assetId: 7074786 },
	{ id: "moto", name: "Motorcycle", category: "Clothing", slot: "shirt", color: rgb(36, 120, 196), assetId: 144076358 },
	{ id: "denim", name: "Denim jacket", category: "Clothing", slot: "shirt", color: rgb(90, 98, 112), assetId: 144076436 },
	{ id: "teal", name: "Teal shirt", category: "Clothing", slot: "shirt", color: rgb(32, 140, 148), assetId: 382537702 },
	{ id: "jersey", name: "Green jersey", category: "Clothing", slot: "shirt", color: rgb(46, 122, 86), assetId: 382538059 },
	{ id: "black", name: "Black jeans", category: "Clothing", slot: "pants", color: rgb(28, 28, 32), assetId: 382537569 },
	{ id: "green", name: "Green jeans", category: "Clothing", slot: "pants", color: rgb(46, 92, 64), assetId: 144076760 },
	{ id: "shorts", name: "Jean shorts", category: "Clothing", slot: "pants", color: rgb(52, 78, 128), assetId: 382537806 },
	{ id: "light", name: "Light jeans", category: "Clothing", slot: "pants", color: rgb(120, 148, 176), assetId: 398634487 },
	{ id: "bald", name: "None", category: "Hair", slot: "hair", color: rgb(196, 190, 182), assetId: 0 },
	{ id: "pal", name: "Pal", category: "Hair", slot: "hair", color: rgb(36, 28, 24), assetId: 63690008 },
	{ id: "charmer", name: "Charmer", category: "Hair", slot: "hair", color: rgb(92, 56, 32), assetId: 376548738 },
	{ id: "spiked", name: "Spiked", category: "Hair", slot: "hair", color: rgb(214, 176, 96), assetId: 376524487 },
	{ id: "updo", name: "Updo", category: "Hair", slot: "hair", color: rgb(168, 140, 196), assetId: 451220849 },
	{ id: "nohat", name: "None", category: "Hats", slot: "hat", color: rgb(196, 190, 182), assetId: 0 },
	{ id: "redcap", name: "Red cap", category: "Hats", slot: "hat", color: rgb(186, 42, 48), assetId: 48474313 },
	{ id: "rcap", name: "R cap", category: "Hats", slot: "hat", color: rgb(48, 72, 140), assetId: 417457461 },
	{ id: "visor", name: "Visor", category: "Hats", slot: "hat", color: rgb(32, 32, 36), assetId: 2646473721 },
	{ id: "hood", name: "Hood", category: "Hats", slot: "hat", color: rgb(92, 64, 48), assetId: 617605556 },
	{ id: "idle", name: "Idle", category: "Animations", slot: "pose", color: rgb(120, 144, 168), assetId: 507766388 },
	{ id: "wave", name: "Wave", category: "Animations", slot: "pose", color: rgb(64, 140, 196), assetId: 507770239 },
	{ id: "cheer", name: "Cheer", category: "Animations", slot: "pose", color: rgb(214, 164, 64), assetId: 507770677 },
	{ id: "sit", name: "Sit", category: "Animations", slot: "pose", color: rgb(92, 150, 112), assetId: 2506281703 },
];

export const STARTER: Equipped = {
	skin: "warm",
	face: "smile",
	shirt: "moto",
	pants: "black",
	hair: "pal",
	hat: "nohat",
	pose: "idle",
};

function pieceById(id: string) {
	for (const piece of PIECES) if (piece.id === id) return piece;
	error(`unknown piece ${id}`);
}

function accessory(assetId: number) {
	return assetId > 0 ? tostring(assetId) : "";
}

export function equippedFrom(patch: Partial<Equipped> | undefined): Equipped {
	const worn: Equipped = { ...STARTER };
	if (patch === undefined) return worn;
	for (const slot of SLOTS) {
		const id = patch[slot];
		if (typeOf(id) !== "string") continue;
		for (const piece of PIECES) {
			if (piece.slot === slot && piece.id === id) {
				worn[slot] = id;
				break;
			}
		}
	}
	return worn;
}

export function descriptionOf(equipped: Equipped) {
	const skin = pieceById(equipped.skin).color;
	const description = new Instance("HumanoidDescription");
	description.Head = BLOCKHEAD;
	description.HeadColor = skin;
	description.TorsoColor = skin;
	description.LeftArmColor = skin;
	description.RightArmColor = skin;
	description.LeftLegColor = skin;
	description.RightLegColor = skin;
	description.Face = pieceById(equipped.face).assetId;
	description.Shirt = pieceById(equipped.shirt).assetId;
	description.Pants = pieceById(equipped.pants).assetId;
	description.HairAccessory = accessory(pieceById(equipped.hair).assetId);
	description.HatAccessory = accessory(pieceById(equipped.hat).assetId);
	return description;
}

export function animationId(equipped: Equipped) {
	return pieceById(equipped.pose).assetId;
}
