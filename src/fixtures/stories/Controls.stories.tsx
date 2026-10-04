import React from "@rbxts/react";

export default {
	title: "Fixture/Controls",
	args: { tone: "low", amount: 20 },
	argTypes: {
		tone: { type: "enum", options: ["low", "high"], control: "radio" },
		amount: { type: "number", control: "slider", min: 0, max: 100, step: 5 },
		count: { type: "number", optional: true },
		disabled: { type: "boolean", optional: true },
	},
	cases: {
		count: (env: {
			find: (name: string) => Instance | undefined;
			setArg: (name: string, value: unknown) => void;
			wait: () => void;
			expect: (ok: boolean, message: string) => void;
		}) => {
			const label = env.find("ControlsLabel") as TextLabel | undefined;
			env.expect(label !== undefined, "label");
			env.expect(label?.Text.find("count=absent", 1, true)[0] !== undefined, "count starts absent");
			env.setArg("count", 4);
			env.wait();
			env.expect(label?.Text.find("count=4", 1, true)[0] !== undefined, "count=4");
		},
	},
	render: (args: { tone?: string; amount?: number; count?: number; disabled?: boolean }) => (
		<textlabel
			key="ControlsLabel"
			Text={`tone=${args.tone ?? ""} amount=${args.amount ?? ""} count=${args.count === undefined ? "absent" : tostring(args.count)} disabled=${args.disabled === undefined ? "absent" : tostring(args.disabled)}`}
			Size={new UDim2(1, 0, 0, 24)}
			BackgroundTransparency={1}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
