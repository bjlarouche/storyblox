export const PROTOCOL_VERSION = 1;
export const MAX_REQUEST_ID = 64;
export const MAX_BRIDGE_ARGS = 64;

const COMMANDS: { [command: string]: boolean } = {
	getStatus: false,
	listStories: false,
	selectStory: false,
	setArgs: true,
	resetArgs: true,
	runCase: true,
	getCaptureBounds: true,
};

export interface BridgeRequest {
	protocolVersion: number;
	requestId: string;
	command: string;
	storyId?: string;
	expectedGeneration?: number;
	payload?: { [key: string]: unknown };
}

export type BridgeCheck = { ok: true; request: BridgeRequest } | { ok: false; requestId?: string; error: string };

function plainValue(value: unknown) {
	const kind = typeOf(value);
	return kind === "string" || kind === "number" || kind === "boolean";
}

export function checkRequest(value: unknown, generation: number, storyId: string | undefined): BridgeCheck {
	if (typeOf(value) !== "table") return { ok: false, error: "request" };
	const request = value as Partial<BridgeRequest>;
	const id = request.requestId;
	if (typeOf(id) !== "string" || (id as string).size() === 0 || (id as string).size() > MAX_REQUEST_ID) {
		return { ok: false, error: "requestId" };
	}
	const requestId = id as string;
	if (request.protocolVersion !== PROTOCOL_VERSION) return { ok: false, requestId, error: "protocolVersion" };
	const command = request.command;
	if (typeOf(command) !== "string" || COMMANDS[command as string] === undefined) {
		return { ok: false, requestId, error: "command" };
	}
	if (request.payload !== undefined && typeOf(request.payload) !== "table") return { ok: false, requestId, error: "payload" };
	if (COMMANDS[command as string]) {
		if (request.expectedGeneration !== generation) return { ok: false, requestId, error: "stale" };
		if (request.storyId !== undefined && request.storyId !== storyId) return { ok: false, requestId, error: "stale" };
	}
	const payload = (request.payload ?? {}) as { [key: string]: unknown };
	if (command === "selectStory" && typeOf(payload.storyId) !== "string") return { ok: false, requestId, error: "payload" };
	if (command === "runCase" && typeOf(payload.name) !== "string") return { ok: false, requestId, error: "payload" };
	if (command === "setArgs") {
		if (typeOf(payload.args) !== "table") return { ok: false, requestId, error: "payload" };
		let count = 0;
		for (const [, arg] of pairs(payload.args as object)) {
			count += 1;
			if (count > MAX_BRIDGE_ARGS) return { ok: false, requestId, error: "payload" };
			if (!plainValue(arg)) return { ok: false, requestId, error: "unsupported value" };
		}
	}
	return { ok: true, request: request as BridgeRequest };
}
