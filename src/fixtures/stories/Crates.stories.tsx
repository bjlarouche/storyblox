import React from "@rbxts/react";
import { Accordion, Alert, EmptyListHint, ScrollView, Skeleton, Stack, Typography, useTheme } from "@rbxts/uiblox";
import { useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	phase: "ready" | "loading" | "empty" | "error";
}

interface CrateProps {
	title: string;
	note?: string;
	children?: React.ReactNode;
}

const Crate = Accordion as unknown as (props: CrateProps) => React.Element;
const SHRINK = { Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY, ZIndex: 1 };
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const CRATES = [
	{ title: "Salt", note: "Two sacks", detail: "Kept dry" },
	{ title: "Oil", note: "One tin", detail: "Cap is on" },
	{ title: "Line", note: "A coil", detail: "Stowed on the peg" },
];

function Crates(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [phase, setPhase] = useArg<Args["phase"]>(args.phase);

	const board =
		phase === "error" ? (
			<Alert severity="error" title="Crates unavailable" message="The desk could not open this store." onClose={() => setPhase("ready")} />
		) : phase === "loading" ? (
			<Stack direction="column" gap={1} sx={STACK}>
				{[0, 1, 2].map((index) => (
					<Skeleton key={index} variant="text" width={narrow ? 220 : 280} height={24} />
				))}
			</Stack>
		) : phase === "empty" ? (
			<EmptyListHint text="No crate is posted." height={72} />
		) : (
			<Stack direction="column" gap={1} sx={STACK}>
				{CRATES.map((crate) => (
					<Crate key={crate.title} title={crate.title} note={crate.note}>
						<Typography text={crate.detail} sx={SHRINK} />
					</Crate>
				))}
			</Stack>
		);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				<Stack direction="column" gap={1} sx={STACK}>
					<Typography text="Crates" variant="h5" sx={SHRINK} />
					{board}
				</Stack>
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Crates",
	description: "Shut crates that keep a short count on the header.",
	args: { viewport: "desktop", phase: "ready" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		phase: { type: "enum", options: ["ready", "loading", "empty", "error"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Crates {...args} />,
};
