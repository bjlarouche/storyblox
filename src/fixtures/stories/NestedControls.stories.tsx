import React from "@rbxts/react";

const onClick = () => {};

export default {
	title: "Fixture/Nested",
	args: {
		items: ["a", "b"],
		shape: { kind: "circle" },
		meta: { note: "hello" },
		onClick,
	},
	argTypes: {
		items: { type: "array", item: { type: "string" } },
		shape: {
			type: "union",
			tag: "kind",
			variants: {
				circle: { radius: { type: "number" } },
				square: { size: { type: "number" } },
			},
		},
		meta: { type: "object", fields: { note: { type: "string" } } },
		onClick: { type: "readonly" },
	},
	render: (args: { items: Array<string>; shape: { kind: string }; meta: { note: string }; onClick: () => void }) => (
		<textlabel
			Text={`n=${args.items.size()} first=${args.items[0]} kind=${args.shape.kind} note=${args.meta.note} click=${typeOf(args.onClick)}`}
			Size={new UDim2(1, 0, 0, 24)}
			BackgroundTransparency={1}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
