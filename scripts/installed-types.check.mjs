/**
 * Installed @rbxts/types datatype inventory, separate from ControlSpec coverage.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const types = readFileSync(join(root, "node_modules/@rbxts/types/include/roblox.d.ts"), "utf8");
const defineStory = readFileSync(join(root, "src/packages/defineStory.ts"), "utf8");
const argCodec = readFileSync(join(root, "src/packages/argCodec.ts"), "utf8");
const controls = readFileSync(join(root, "src/packages/ui/template/components/Controls.tsx"), "utf8");
const fields = readFileSync(join(root, "src/packages/ui/template/valueFields.tsx"), "utf8");
const nested = readFileSync(join(root, "src/packages/nestedArgs.ts"), "utf8");
const fixture = readFileSync(join(root, "src/fixtures/stories/ValueTypes.stories.tsx"), "utf8");
const datatypes = readFileSync(join(root, "src/fixtures/stories/Datatypes.stories.tsx"), "utf8");
const wired = `${controls}\n${fields}\n${defineStory}`;

const ledger = {
	nil: { class: "unsupported", reason: "absence, not a control value" },
	boolean: { class: "edit", control: "boolean" },
	string: { class: "edit", control: "string" },
	number: { class: "edit", control: "number" },
	table: { class: "nested", reason: "object array dictionary union tuple" },
	userdata: { class: "unsupported", reason: "untyped userdata" },
	function: { class: "readonly", reason: "not a control value" },
	thread: { class: "readonly", reason: "not a control value" },
	vector: { class: "covered", reason: "Luau vector; use vector3" },
	buffer: { class: "unsupported", reason: "binary buffer" },
	Axes: { class: "edit", control: "axes" },
	BrickColor: { class: "edit", control: "brickColor" },
	CFrame: { class: "edit", control: "cframe" },
	Color3: { class: "edit", control: "color" },
	ColorSequence: { class: "edit", control: "colorSequence" },
	ColorSequenceKeypoint: { class: "covered", reason: "edited inside colorSequence" },
	DateTime: { class: "edit", control: "dateTime" },
	DockWidgetPluginGuiInfo: { class: "edit", control: "dockWidget" },
	Enum: { class: "unsupported", reason: "enum container; use EnumItem" },
	EnumItem: { class: "edit", control: "EnumItem" },
	Enums: { class: "unsupported", reason: "enum container; use EnumItem" },
	Faces: { class: "edit", control: "faces" },
	FloatCurveKey: { class: "readonly", reason: "constructor cannot restore tangents" },
	Font: { class: "edit", control: "font" },
	Instance: { class: "readonly", reason: "mutable instance; not a control value" },
	NumberRange: { class: "edit", control: "numberRange" },
	NumberSequence: { class: "edit", control: "numberSequence" },
	NumberSequenceKeypoint: { class: "covered", reason: "edited inside numberSequence" },
	OverlapParams: { class: "readonly", reason: "filter list holds Instances" },
	PathWaypoint: { class: "edit", control: "pathWaypoint" },
	PhysicalProperties: { class: "edit", control: "physicalProperties" },
	Random: { class: "unsupported", reason: "mutable RNG; seed is not readable" },
	Ray: { class: "edit", control: "ray" },
	RaycastParams: { class: "readonly", reason: "filter list holds Instances" },
	RaycastResult: { class: "readonly", reason: "result holds a BasePart" },
	RBXScriptConnection: { class: "readonly", reason: "runtime connection" },
	RBXScriptSignal: { class: "readonly", reason: "not a control value" },
	Rect: { class: "edit", control: "rect" },
	Region3: { class: "edit", control: "region3" },
	Region3int16: { class: "edit", control: "region3int16" },
	TweenInfo: { class: "edit", control: "tweenInfo" },
	UDim: { class: "edit", control: "udim" },
	UDim2: { class: "edit", control: "udim2" },
	Vector2: { class: "edit", control: "vector2" },
	Vector2int16: { class: "edit", control: "vector2int16" },
	Vector3: { class: "edit", control: "vector3" },
	Vector3int16: { class: "edit", control: "vector3int16" },
	CatalogSearchParams: { class: "unsupported", reason: "not a typeOf result; mutable query object" },
	ClipEvaluator: { class: "unsupported", reason: "runtime evaluator; no readable fields" },
	OpenCloudModel: { class: "unsupported", reason: "no readable fields" },
	Path2DControlPoint: { class: "unsupported", reason: "not a typeOf result" },
	RotationCurveKey: { class: "unsupported", reason: "not a typeOf result" },
	Secret: { class: "unsupported", reason: "secret content is not readable" },
	SharedTable: { class: "unsupported", reason: "mutable cross-vm table; may hold Instances" },
	TextChatMessage: { class: "unsupported", reason: "runtime chat object; no readable fields" },
	QFont: { class: "unsupported", reason: "studio Qt internal" },
	QDir: { class: "unsupported", reason: "studio Qt internal" },
};

function block(name) {
	const match = types.match(new RegExp(`interface ${name}(?: extends [^{]+)? \\{([\\s\\S]*?)\\n\\}`));
	if (!match) throw new Error(`missing ${name} in roblox.d.ts`);
	const found = [];
	for (const line of match[1].split("\n")) {
		const item = line.match(/^\t([A-Za-z0-9]+):/);
		if (item) found.push(item[1]);
	}
	return found;
}

export function assertInstalledTypes() {
	const installed = new Set([...block("CheckablePrimitives"), ...block("CheckableTypes")]);
	for (const match of types.matchAll(/_nominal_([A-Za-z0-9]+)/g)) installed.add(match[1]);
	installed.add("QFont");
	installed.add("QDir");

	let edit = 0;
	let covered = 0;
	let readonly = 0;
	let unsupported = 0;
	let nestedCount = 0;
	for (const name of installed) {
		const row = ledger[name];
		if (row === undefined) throw new Error(`installed datatype ${name} is not categorized`);
		if (row.reason !== undefined && row.reason.length === 0) throw new Error(`${name} missing rationale`);
		if (row.class === "edit") {
			edit += 1;
			if (!defineStory.includes(`"${row.control}"`)) throw new Error(`ControlSpec missing ${name}`);
			if (!wired.includes(`"${row.control}"`) && !wired.includes(`kind === "${row.control}"`)) {
				throw new Error(`editor missing ${name}`);
			}
			const codecKind = row.control === "EnumItem" ? "enum" : row.control === "boolean" || row.control === "string" || row.control === "number" ? null : row.control;
			if (codecKind !== null && !argCodec.includes(`"${codecKind}"`) && !argCodec.includes(`kind: "${codecKind}"`)) {
				throw new Error(`codec missing ${name}`);
			}
			if (
				codecKind !== null &&
				!fixture.includes(`type: "${row.control}"`) &&
				!datatypes.includes(`type: "${row.control}"`)
			) {
				throw new Error(`fixture missing ${name}`);
			}
		} else if (row.class === "covered") {
			covered += 1;
			if (!row.reason) throw new Error(`${name} covered without parent`);
		} else if (row.class === "readonly") {
			readonly += 1;
			if (!nested.includes(`"${name}"`) && name !== "function" && name !== "thread") {
				throw new Error(`readonly inspector missing ${name}`);
			}
			if (name === "function" && !nested.includes('kind === "function"')) throw new Error("readonly inspector missing function");
			if (name === "thread" && !nested.includes('kind === "thread"')) throw new Error("readonly inspector missing thread");
		} else if (row.class === "unsupported") {
			unsupported += 1;
			if (!row.reason) throw new Error(`${name} missing rationale`);
		} else if (row.class === "nested") {
			nestedCount += 1;
			for (const kind of ["object", "array", "dictionary", "union", "tuple"]) {
				if (!defineStory.includes(`"${kind}"`)) throw new Error(`nested control missing ${kind}`);
			}
		} else throw new Error(`bad class for ${name}`);
	}
	for (const name of Object.keys(ledger)) {
		if (!installed.has(name)) throw new Error(`ledger has unknown datatype ${name}`);
	}
	console.log(`installed types ok edit=${edit} covered=${covered} nested=${nestedCount} readonly=${readonly} unsupported=${unsupported}`);
}

const isMain = process.argv[1]?.endsWith("installed-types.check.mjs");
if (isMain) assertInstalledTypes();
