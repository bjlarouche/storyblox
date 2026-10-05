import React, { useState } from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { CaseResult, runCase } from "packages/storyCases";
import InteractionsPanel from "packages/ui/template/components/InteractionsPanel";

function InteractionsDemo() {
	const { theme } = useTheme();
	const [results, setResults] = useState<CaseResult[]>([]);
	const [running, setRunning] = useState<string | undefined>();
	const [last, setLast] = useState<string | undefined>();
	const cases = ["passes", "fails"];

	const run = (name: string) => {
		setRunning(name);
		setLast(name);
		const result = runCase(
			name,
			(env) => {
				if (name === "passes") env.expect(true, "ok");
				else env.expect(false, "expected fail");
			},
			{},
			() => false,
		);
		setResults((current) => {
			const updated = new Array<CaseResult>();
			for (const item of current) updated.push(item);
			updated.push(result);
			return updated;
		});
		setRunning(undefined);
	};

	return (
		<frame Size={new UDim2(1, 0, 0, 180)} BorderSizePixel={0}>
			<InteractionsPanel
				theme={theme}
				cases={cases}
				results={results}
				running={running}
				onRun={run}
				onRerun={() => {
					if (last !== undefined) run(last);
				}}
			/>
		</frame>
	);
}

export default {
	title: "Shell/Interactions",
	description: "Run story interaction cases with pass/fail.",
	features: { interactions: true },
	cases: {
		passes: (env: { expect: (ok: boolean, message: string) => void }) => env.expect(true, "ok"),
		fails: (env: { expect: (ok: boolean, message: string) => void }) => env.expect(false, "expected fail"),
	},
	render: () => <InteractionsDemo />,
};
