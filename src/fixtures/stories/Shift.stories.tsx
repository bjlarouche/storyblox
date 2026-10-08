import React, { useState } from "@rbxts/react";
import { Alert, EmptyListHint, RadioGroup, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface ShiftChoice {
	label: string;
	value: string;
	hint?: string;
}

interface PickerProps {
	value: string;
	options: ShiftChoice[];
	onChange: (value: string) => void;
}

const Picker = RadioGroup as unknown as (props: PickerProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const SHIFTS: ShiftChoice[] = [
	{ label: "Dawn", value: "dawn", hint: "Gate only" },
	{ label: "Day", value: "day", hint: "Pier and gate" },
	{ label: "Dusk", value: "dusk", hint: "Shed closes" },
];

function Shift(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);
	const [value, setValue] = useState(SHIFTS[0].value);
	const picked = SHIFTS.find((shift) => shift.value === value) ?? SHIFTS[0];

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Shift unavailable" message="The desk could not open this round." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No shift is posted." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				<Picker value={value} options={SHIFTS} onChange={setValue} />
				<Typography text={`${picked.label} covers ${picked.hint}`} color="textSecondary" sx={SHRINK} />
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Shift" variant="h5" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Shift",
	description: "A shift choice with a note on each option.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Shift {...args} />,
};
