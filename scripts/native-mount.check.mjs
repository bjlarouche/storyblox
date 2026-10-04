globalThis.typeOf = (value) => (typeof value === "object" && value !== null ? "table" : typeof value);
globalThis.pairs = (record) => Object.keys(record).map((key) => [key, record[key]]);
Array.prototype.size = function size() {
	return this.length;
};

const { mountNative } = await import("../src/packages/ui/storyblox/nativeMount.ts");
const { copyArgs, patchArg } = await import("../src/packages/ui/template/storyArgs.ts");

function instance(name) {
	return {
		Name: name,
		Parent: undefined,
		destroyed: false,
		Destroy() {
			this.destroyed = true;
			this.Parent = undefined;
		},
	};
}

const button = { text: "", id: {} };
const host = mountNative(
	(_target, context) => {
		button.text = `${context.args.label}:${context.args.enabled}:${context.args.count}`;
		context.ready();
		context.action("mount", context.args.label);
		return {
			update(args) {
				button.text = `${args.label}:${args.enabled}:${args.count}`;
			},
		};
	},
	instance("target"),
	{ label: "Native", enabled: true, count: 1 },
	{},
);
const id = button.id;
host.update({ label: "Hello", enabled: false, count: 2 });
if (button.id !== id || button.text !== "Hello:false:2" || !host.ready()) throw new Error("update identity");
if (host.actions[0].name !== "mount") throw new Error("action");

const owned = instance("owned");
let threw = false;
try {
	mountNative(
		(_target, context) => {
			context.own(owned);
			throw new Error("mount failed");
		},
		instance("target"),
		{},
		{},
	);
} catch {
	threw = true;
}
if (!threw || !owned.destroyed) throw new Error("mount cleanup");

const order = [];
const parent = instance("parent");
const child = instance("child");
child.Parent = parent;
parent.Destroy = function destroyParent() {
	this.destroyed = true;
	child.destroyed = true;
	child.Parent = undefined;
	child.Destroy = () => {
		throw new Error("child already destroyed");
	};
};
let disconnected = false;
const signal = {
	Connect() {
		return {
			Disconnect() {
				disconnected = true;
			},
		};
	},
};
const scoped = mountNative(
	(_target, context) => {
		context.own(parent);
		context.own(child);
		context.own(parent);
		context.connect(signal, () => {});
		context.onCleanup(() => order.push("a"));
		context.onCleanup(() => {
			order.push("b");
			throw new Error("b");
		});
		context.onCleanup(() => order.push("c"));
		return {
			destroy() {
				order.push(context.cancelled() ? "destroy" : "early");
			},
		};
	},
	instance("target"),
	{},
	{},
);
scoped.destroy();
scoped.destroy();
if (order.join(",") !== "destroy,c,b,a") throw new Error(`cleanup order ${order.join(",")}`);
if (!parent.destroyed || !child.destroyed || !disconnected) throw new Error("scope cleanup");

let updateDestroyed = false;
const failing = mountNative(
	() => ({
		update() {
			throw new Error("update failed");
		},
		destroy() {
			updateDestroyed = true;
		},
	}),
	instance("target"),
	{},
	{},
);
let updateThrew = false;
try {
	failing.update({});
} catch {
	updateThrew = true;
}
if (!updateThrew || updateDestroyed) throw new Error("update failure");
failing.destroy();
if (!updateDestroyed) throw new Error("destroy after update failure");

const legacy = mountNative(
	() => () => order.push("legacy"),
	instance("target"),
	{},
	{},
);
if (legacy.update !== undefined) throw new Error("legacy remount has no update");

const onClick = () => {};
const defaults = { label: "A", onClick };
const edited = patchArg(copyArgs(defaults), "label", "B");
const reset = copyArgs(defaults);
if (edited.label !== "B" || reset.label !== "A" || reset.onClick !== onClick) throw new Error("reset");
if (reset.enabled !== undefined || defaults.label !== "A") throw new Error("absence");

const absent = { seen: "missing" };
mountNative(
	(_target, context) => {
		absent.seen = context.args.count;
		return {
			update(args) {
				absent.seen = args.count;
			},
		};
	},
	instance("target"),
	{ label: "A" },
	{},
).update({ label: "B" });
if (absent.seen !== undefined) throw new Error("optional absence");

console.log("native mount ok");
