String.prototype.size = function () {
	return this.length;
};
globalThis.typeOf = (value) => (value !== null && typeof value === "object" ? "table" : typeof value);
globalThis.pairs = (value) => Object.entries(value);

const { checkRequest, MAX_BRIDGE_ARGS } = await import("../src/packages/bridgeProtocol.ts");

const base = { protocolVersion: 1, requestId: "r1" };
const expectError = (value, error, label) => {
	const result = checkRequest(value, 3, "Fixture/Controls");
	if (result.ok || result.error !== error) throw new Error(`${label}: ${JSON.stringify(result)}`);
	return result;
};

expectError("nope", "request", "not a table");
expectError({ ...base, requestId: "" }, "requestId", "empty id");
expectError({ ...base, requestId: "x".repeat(65) }, "requestId", "long id");
if (expectError({ ...base, protocolVersion: 2, command: "getStatus" }, "protocolVersion", "version").requestId !== "r1") {
	throw new Error("error keeps requestId");
}
expectError({ ...base, command: "executeCode" }, "command", "unknown command");
expectError({ ...base, command: "setArgs", expectedGeneration: 2, payload: { args: {} } }, "stale", "old generation");
expectError({ ...base, command: "runCase", payload: { name: "count" } }, "stale", "missing generation");
expectError(
	{ ...base, command: "runCase", storyId: "Other/Story", expectedGeneration: 3, payload: { name: "count" } },
	"stale",
	"other story",
);
expectError({ ...base, command: "selectStory" }, "payload", "select without story");
expectError({ ...base, command: "runCase", expectedGeneration: 3 }, "payload", "case without name");
expectError({ ...base, command: "setArgs", expectedGeneration: 3, payload: { args: { f: {} } } }, "unsupported value", "table arg");
const many = {};
for (let index = 0; index <= MAX_BRIDGE_ARGS; index++) many[`a${index}`] = index;
expectError({ ...base, command: "setArgs", expectedGeneration: 3, payload: { args: many } }, "payload", "too many args");

for (const request of [
	{ ...base, command: "getStatus" },
	{ ...base, command: "listStories" },
	{ ...base, command: "selectStory", payload: { storyId: "Fixture/Controls" } },
	{ ...base, command: "setArgs", expectedGeneration: 3, storyId: "Fixture/Controls", payload: { args: { count: 4, on: true } } },
	{ ...base, command: "resetArgs", expectedGeneration: 3 },
	{ ...base, command: "runCase", expectedGeneration: 3, payload: { name: "count" } },
	{ ...base, command: "getCaptureBounds", expectedGeneration: 3 },
]) {
	const result = checkRequest(request, 3, "Fixture/Controls");
	if (!result.ok) throw new Error(`${request.command}: ${result.error}`);
}

console.log("bridge protocol ok");
