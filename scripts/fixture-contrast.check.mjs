import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const divider = readFileSync(join(root, "src/fixtures/stories/Divider.stories.tsx"), "utf8");
const datatypes = readFileSync(join(root, "src/fixtures/stories/Datatypes.stories.tsx"), "utf8");

if (divider.includes("220, 220, 220")) throw new Error("Divider labels must not hard-code gray 220");
if (!divider.includes("text.secondary")) throw new Error("Divider labels must use text.secondary");
if (!divider.includes("useTheme")) throw new Error("Divider demo must useTheme");

if (!datatypes.includes("useTheme")) throw new Error("Data Types must useTheme");
if (!datatypes.includes("text.primary")) throw new Error("Data Types must use text.primary");
if (/TextColor3=\{Color3/.test(datatypes)) throw new Error("Data Types must not hard-code TextColor3");

console.log("fixture contrast ok");
