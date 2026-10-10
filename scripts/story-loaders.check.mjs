globalThis.typeOf = (value) => {
	if (value === null || value === undefined) return "nil";
	if (typeof value === "function") return "function";
	if (typeof value === "object") return "table";
	return typeof value;
};
globalThis.pairs = (record) => Object.entries(record);
globalThis.tostring = (value) => String(value);
Array.prototype.size = function () {
	return this.length;
};

const { collectLoaders, settleLoaders, isThenable } = await import("../src/packages/storyLoaders.ts");
const { revealStoryLoad, acceptStoryLoad, STORY_LOAD_REVEAL } = await import("../src/packages/storyLoad.ts");

if (revealStoryLoad(0.05, true) !== false) throw new Error("spinner waits");
if (revealStoryLoad(STORY_LOAD_REVEAL, true) !== true) throw new Error("spinner reveals");
if (revealStoryLoad(1, false) !== false) throw new Error("spinner hides when idle");
if (acceptStoryLoad(2, 2) !== true || acceptStoryLoad(2, 3) !== false) throw new Error("stale load");

if (isThenable({ then: () => {} }) !== true) throw new Error("thenable");
if (isThenable({ greeting: "hi" }) !== false) throw new Error("plain table");

const sync = collectLoaders([() => ({ greeting: "hello" })], { label: "world" });
if (sync.error !== undefined || sync.pending.length !== 0 || sync.loaded.greeting !== "hello") {
	throw new Error("sync loader");
}

const failed = collectLoaders(
	[
		() => {
			throw new Error("boom");
		},
	],
	{},
);
if (failed.error === undefined || !String(failed.error).includes("boom")) throw new Error("loader throw");

let alive = true;
const asyncBatch = collectLoaders(
	[() => ({ greeting: "hello" }), () => ({ then: (ok) => ok({ label: "async" }) })],
	{},
);
if (asyncBatch.pending.length !== 1) throw new Error("pending loader");
let ready;
settleLoaders(
	asyncBatch,
	() => alive,
	(loaded) => {
		ready = loaded;
	},
	(message) => {
		throw new Error(message);
	},
);
if (ready?.greeting !== "hello" || ready?.label !== "async") throw new Error(`settled ${JSON.stringify(ready)}`);

alive = true;
let rejected = "";
settleLoaders(
	collectLoaders([() => ({ then: (_ok, err) => err("nope") })], {}),
	() => true,
	() => {
		throw new Error("rejected loader resolved");
	},
	(message) => {
		rejected = message;
	},
);
if (!rejected.includes("nope")) throw new Error("loader rejection");

let viaAndThen = "";
settleLoaders(
	collectLoaders([() => ({ andThen: (_self, ok) => ok({ via: "andThen" }) })], {}),
	() => true,
	(loaded) => {
		viaAndThen = String(loaded.via);
	},
	(message) => {
		throw new Error(message);
	},
);
if (viaAndThen !== "andThen") throw new Error("andThen loader");

let exploded = "";
settleLoaders(
	collectLoaders(
		[
			() => ({
				then: () => {
					throw new Error("explode");
				},
			}),
		],
		{},
	),
	() => true,
	() => {
		throw new Error("throwing loader resolved");
	},
	(message) => {
		exploded = message;
	},
);
if (!exploded.includes("explode")) throw new Error("thenable throw");

let open = true;
let stale = false;
settleLoaders(
	collectLoaders([
		() => ({
			then: (ok) => {
				open = false;
				ok({ late: true });
			},
		}),
	], {}),
	() => open,
	() => {
		stale = true;
	},
	() => {
		stale = true;
	},
);
if (stale) throw new Error("stale loader ran");

console.log("story loaders ok");
