import React, { useState } from "@rbxts/react";
import { Alert, Button, Chip, EmptyListHint, Input, ScrollView, Skeleton, Stack, Stepper, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface TrailProps {
	steps: string[];
	activeStep: number;
	orientation?: "horizontal" | "vertical";
	onStep?: (index: number) => void;
}

const Trail = Stepper as unknown as (props: TrailProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const STEPS = ["Who", "Where", "Hold"];
const PLACES = ["Cove", "Pier", "Gate"];

function Pass(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [step, setStep] = useState(0);
	const [who, setWho] = useState("");
	const [place, setPlace] = useState(PLACES[0]);

	const body =
		step === 0 ? (
			<Input text={who} placeholder="Name" onTextChanged={setWho} />
		) : step === 1 ? (
			<Stack direction="row" gap={1} sx={STACK}>
				{PLACES.map((name) => (
					<Chip key={name} label={name} selected={name === place} variant={name === place ? "filled" : "outlined"} onActivated={() => setPlace(name)} />
				))}
			</Stack>
		) : (
			<Typography text={`${who} holds ${place}`} sx={SHRINK} />
		);

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Pass unavailable" message="The desk could not open this pass." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No pass is open." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Trail steps={STEPS} activeStep={step} orientation={narrow ? "vertical" : "horizontal"} onStep={setStep} />
				{body}
				{step < 2 ? (
					<Button text="Continue" size="small" variant="contained" disabled={step === 0 && who.size() === 0} onLeftClick={() => setStep(step + 1)} />
				) : undefined}
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Pass" variant="h5" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Pass",
	description: "A short pass that can return to a reached step.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Pass {...args} />,
};
