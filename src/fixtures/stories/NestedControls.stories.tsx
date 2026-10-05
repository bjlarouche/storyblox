import React from "@rbxts/react";

const onClick = () => {};

export default {
	title: "Layout/Nested Args",
	preview: { kind: "gui", width: 320, height: 48, background: new Color3(0.12, 0.14, 0.18) },
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
	render: (
		args: { items: Array<string>; shape: { kind: string }; meta: { note: string }; onClick: () => void },
		context?: { theme?: { type?: string } },
	) => (
		<textlabel
			Text={`n=${args.items.size()} first=${args.items[0]} kind=${args.shape.kind} note=${args.meta.note} click=${typeOf(args.onClick)} theme=${context?.theme?.type}`}
			Size={new UDim2(1, 0, 0, 24)}
			BackgroundTransparency={1}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
