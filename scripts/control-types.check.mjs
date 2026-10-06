/**
 * CI coverage matrix for Storyblox ControlSpec + codec + Controls wiring.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const defineStory = readFileSync(join(root, "src/packages/defineStory.ts"), "utf8");
const argCodec = readFileSync(join(root, "src/packages/argCodec.ts"), "utf8");
const controls = readFileSync(join(root, "src/packages/ui/template/components/Controls.tsx"), "utf8");
const datatypes = readFileSync(join(root, "src/fixtures/stories/Datatypes.stories.tsx"), "utf8");

const matrix = [
	{ type: "string", status: "rich", codecKind: null, editor: 'type === "string"', fixture: false },
	{ type: "boolean", status: "rich", codecKind: null, editor: 'type === "boolean"', fixture: false },
	{ type: "number", status: "rich", codecKind: null, editor: 'type === "number"', fixture: false },
	{ type: "enum", status: "rich", codecKind: null, editor: 'type === "enum"', fixture: false },
	{ type: "color", status: "rich", codecKind: "color", editor: "ColorPicker", fixture: true },
	{ type: "brickColor", status: "rich", codecKind: "brickColor", editor: "BrickColorPicker", fixture: true },
	{ type: "vector2", status: "rich", codecKind: "vector2", editor: "VectorEditor", fixture: true },
	{ type: "vector3", status: "rich", codecKind: "vector3", editor: "VectorEditor", fixture: true },
	{ type: "udim", status: "rich", codecKind: "udim", editor: "UDimEditor", fixture: true },
	{ type: "udim2", status: "rich", codecKind: "udim2", editor: "UDimEditor", fixture: true },
	{ type: "EnumItem", status: "rich", codecKind: "enum", editor: "EnumPicker", fixture: true },
	{ type: "font", status: "rich", codecKind: "font", editor: "FontEditor", fixture: true },
	{ type: "colorSequence", status: "rich", codecKind: "colorSequence", editor: "ColorSequenceEditor", fixture: true },
	{ type: "numberSequence", status: "rich", codecKind: "numberSequence", editor: "NumberSequenceEditor", fixture: true },
	{ type: "asset", status: "rich", codecKind: "asset", editor: "AssetField", fixture: true },
	{ type: "cframe", status: "rich", codecKind: "cframe", editor: "CFrameEditor", fixture: true },
	{ type: "rect", status: "rich", codecKind: "rect", editor: "RectEditor", fixture: true },
	{ type: "numberRange", status: "rich", codecKind: "numberRange", editor: "NumberRangeEditor", fixture: true },
	{ type: "ray", status: "rich", codecKind: "ray", editor: "RayEditor", fixture: true },
	{ type: "physicalProperties", status: "rich", codecKind: "physicalProperties", editor: "PhysicalPropertiesEditor", fixture: true },
	{ type: "gradient", status: "rich", codecKind: "gradient", editor: "GradientEditor", fixture: true },
	{ type: "object", status: "nested", codecKind: null, editor: 'type === "object"', fixture: false },
	{ type: "array", status: "nested", codecKind: null, editor: 'type === "array"', fixture: false },
	{ type: "dictionary", status: "nested", codecKind: null, editor: 'type === "dictionary"', fixture: false },
	{ type: "union", status: "nested", codecKind: null, editor: 'type === "union"', fixture: false },
	{ type: "readonly", status: "readonly", codecKind: null, editor: 'type === "readonly"', fixture: false },
	{ type: "custom", status: "rich", codecKind: null, editor: 'type === "custom"', fixture: false },
];

const unsupported = [
	{ type: "Region3", reason: "readonly inspection only" },
	{ type: "Instance", reason: "readonly; not a control value" },
	{ type: "RBXScriptSignal", reason: "readonly; not a control value" },
	{ type: "thread", reason: "readonly; not a control value" },
	{ type: "function", reason: "readonly; not a control value" },
	{ type: "UIGradient", reason: "use gradient ControlSpec / GradientValue" },
];

let rich = 0;
let nested = 0;
let readonly = 0;

for (const row of matrix) {
	if (!defineStory.includes(`"${row.type}"`)) throw new Error(`ControlSpec missing ${row.type}`);
	if (row.codecKind !== null && !argCodec.includes(`"${row.codecKind}"`)) {
		throw new Error(`codec missing kind ${row.codecKind}`);
	}
	if (!controls.includes(row.editor)) throw new Error(`Controls missing ${row.type} (${row.editor})`);
	if (row.fixture && !datatypes.includes(`type: "${row.type}"`)) {
		throw new Error(`Datatypes fixture missing ${row.type}`);
	}
	if (row.status === "rich") rich += 1;
	else if (row.status === "nested") nested += 1;
	else if (row.status === "readonly") readonly += 1;
}

if (rich < 21) throw new Error(`expected >=21 rich types, got ${rich}`);
if (nested !== 4) throw new Error(`expected 4 nested types, got ${nested}`);
if (readonly !== 1) throw new Error(`expected 1 readonly type, got ${readonly}`);
if (unsupported.length < 5) throw new Error("unsupported list incomplete");

console.log(
	`control types ok rich=${rich} nested=${nested} readonly=${readonly} unsupported=${unsupported.length}`,
);
