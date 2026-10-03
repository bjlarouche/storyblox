import { readFileSync, writeFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
writeFileSync(
	new URL("../src/constants/version.generated.ts", import.meta.url),
	`export const VERSION = ${JSON.stringify(version)};\n`,
);
