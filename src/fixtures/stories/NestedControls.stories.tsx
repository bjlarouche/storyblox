import React from "@rbxts/react";

const onClick = () => {};

export default {
	title: "Layout/Nested Args",
	preview: { kind: "gui", width: 320, height: 48, background: new Color3(0.12, 0.14, 0.18) },
	args: {
		items: ["a", "b"],
		counts: [1, 2],
		shape: { kind: "circle", radius: 4 },
		meta: { note: "hello", tint: new Color3(1, 0, 0) },
		lookup: { alias: "a" },
		pair: ["left", 2],
		onClick,
	},
	argTypes: {
		items: { type: "array", item: { type: "string" } },
		counts: { type: "array", item: { type: "number" } },
		shape: {
			type: "union",
			tag: "kind",
			variants: {
				circle: { radius: { type: "number" } },
				square: { size: { type: "number" } },
			},
		},
		meta: {
			type: "object",
			fields: {
				note: { type: "string" },
				tint: { type: "color" },
			},
		},
		lookup: { type: "dictionary", item: { type: "string" } },
		pair: { type: "tuple", items: [{ type: "string" }, { type: "number" }] },
		onClick: { type: "readonly" },
	},
	render: (
		args: {
			items: Array<string>;
			counts: Array<number>;
			shape: { kind: string; radius?: number; size?: number };
			meta: { note: string; tint: Color3 };
			lookup: { [key: string]: string };
			pair: [string, number];
			onClick: () => void;
		},
		context?: { theme?: { type?: string } },
	) => (
		<textlabel
			Text={`n=${args.items.size()} first=${args.items[0]} count=${args.counts[0]} kind=${args.shape.kind} note=${args.meta.note} tint=${args.meta.tint.R} alias=${args.lookup.alias} pair=${args.pair[0]} click=${typeOf(args.onClick)} theme=${context?.theme?.type}`}
			Size={new UDim2(1, 0, 0, 48)}
			BackgroundTransparency={1}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
