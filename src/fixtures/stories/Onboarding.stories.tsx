import React, { useState } from "@rbxts/react";
import {
	Box,
	Button,
	Chip,
	DarkTheme,
	FormHelperText,
	Input,
	LightTheme,
	Paper,
	ScrollView,
	Stack,
	Stepper,
	Switch,
	ThemeProvider,
	Typography,
	useTheme,
} from "@rbxts/uiblox";

interface Args {
	viewport: "phone" | "desktop";
}

interface StepsProps {
	steps: string[];
	activeStep: number;
	orientation?: "horizontal" | "vertical";
	errorStep?: number;
}

const Steps = Stepper as unknown as (props: StepsProps) => React.Element;
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };
const VIEWPORT = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};
const LABELS = ["Welcome", "Name", "Preferences", "Look"];
const WORDS = ["Hello", "You", "Pick", "Tone", "Done"];
const PLACES = ["Coast", "Ridge", "Dock"];
const WASH = [
	Color3.fromRGB(196, 154, 108),
	Color3.fromRGB(120, 146, 168),
	Color3.fromRGB(126, 158, 126),
	Color3.fromRGB(168, 132, 110),
	Color3.fromRGB(92, 150, 162),
];

function panelWord(step: number, done: boolean) {
	if (done) return WORDS[4];
	return WORDS[step] ?? WORDS[0];
}

function Illustration(props: { step: number; done: boolean; tall: number }) {
	const word = panelWord(props.step, props.done);
	const wash = WASH[props.done ? 4 : props.step] ?? WASH[0];
	return (
		<Box
			sx={{
				Size: new UDim2(1, 0, 0, props.tall),
				AutomaticSize: Enum.AutomaticSize.None,
				radius: 2,
				p: 3,
				gradient: { colors: [wash, Color3.fromRGB(244, 240, 232)], rotation: 28 },
			}}
		>
			<Typography text={word} variant="h1" />
			<Typography text="A quiet first visit." color="textSecondary" />
		</Box>
	);
}

function Onboarding(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [step, setStep] = useState(0);
	const [done, setDone] = useState(false);
	const [name, setName] = useState("");
	const [attempted, setAttempted] = useState(false);
	const [places, setPlaces] = useState<{ [label: string]: boolean }>({ Coast: true });
	const [reminders, setReminders] = useState(true);
	const [quiet, setQuiet] = useState(false);
	const [tone, setTone] = useState<"light" | "dark">("light");
	const nameBad = name.size() < 2;
	const showError = attempted && step === 1 && nameBad && !done;

	const go = (delta: number) => {
		if (done) return;
		if (step === 1 && nameBad && delta > 0) {
			setAttempted(true);
			return;
		}
		const landed = step + delta;
		if (landed >= LABELS.size()) {
			setDone(true);
			return;
		}
		if (landed < 0) return;
		setStep(landed);
	};
	const togglePlace = (label: string) => {
		setPlaces({ ...places, [label]: places[label] !== true });
	};
	const chosen: string[] = [];
	for (const label of PLACES) if (places[label] === true) chosen.push(label);

	const body = done ? (
		<Stack direction="column" gap={1} sx={STACK}>
			<Typography text="You're set." variant="h2" />
			<Typography text={`${name} can start from the ${tone} tone.`} />
			<Typography text={chosen.size() > 0 ? `Places: ${chosen.join(", ")}` : "No places picked."} color="textSecondary" />
			<Typography text={reminders ? "Reminders on." : "Reminders off."} color="textSecondary" />
			<Typography text={quiet ? "Quiet hours on." : "Quiet hours off."} color="textSecondary" />
		</Stack>
	) : step === 0 ? (
		<Stack direction="column" gap={1} sx={STACK}>
			<Typography text="Welcome" variant="h2" />
			<Typography text="Set a name, a few preferences, and a tone. Nothing here is loud." />
		</Stack>
	) : step === 1 ? (
		<Stack direction="column" gap={1} sx={STACK}>
			<Typography text="Your name" variant="h2" />
			<Input text={name} placeholder="What should we call you" onTextChanged={setName} />
			{showError ? <FormHelperText text="Add at least two letters." hasError /> : undefined}
		</Stack>
	) : step === 2 ? (
		<Stack direction="column" gap={1} sx={STACK}>
			<Typography text="Preferences" variant="h2" />
			<Stack direction="row" gap={1} wrap sx={STACK}>
				{PLACES.map((label) => (
					<Chip
						key={label}
						label={label}
						selected={places[label] === true}
						variant={places[label] === true ? "filled" : "outlined"}
						onActivated={() => togglePlace(label)}
					/>
				))}
			</Stack>
			<Switch value={reminders} label="Reminders" onChange={setReminders} />
			<Switch value={quiet} label="Quiet hours" onChange={setQuiet} />
		</Stack>
	) : (
		<Stack direction="column" gap={1} sx={STACK}>
			<Typography text="Tone" variant="h2" />
			<Stack direction="row" gap={1} sx={STACK}>
				<Chip label="Light" selected={tone === "light"} variant={tone === "light" ? "filled" : "outlined"} onActivated={() => setTone("light")} />
				<Chip label="Dark" selected={tone === "dark"} variant={tone === "dark" ? "filled" : "outlined"} onActivated={() => setTone("dark")} />
			</Stack>
			<ThemeProvider theme={tone === "dark" ? DarkTheme : LightTheme}>
				<Paper elevation="raised">
					<Stack direction="column" gap={1} sx={STACK}>
						<Typography text={name.size() > 0 ? name : "Your name"} variant="h3" />
						<Typography text="This card follows the tone you pick." />
						<Button text="Continue" size="small" variant="contained" onLeftClick={() => undefined} />
					</Stack>
				</Paper>
			</ThemeProvider>
		</Stack>
	);

	const panel = (
		<Stack direction="column" gap={2} sx={STACK}>
			<Steps
				steps={LABELS}
				activeStep={done ? LABELS.size() : step}
				orientation={narrow ? "vertical" : "horizontal"}
				errorStep={showError ? 1 : undefined}
			/>
			<Paper elevation="outlined">{body}</Paper>
			{done ? undefined : (
				<Stack direction="row" gap={1} sx={STACK}>
					<Button text="Back" size="small" variant="text" disabled={step === 0} onLeftClick={() => go(-1)} />
					<Button text="Skip" size="small" variant="outlined" onLeftClick={() => go(1)} />
					<Button text={step === LABELS.size() - 1 ? "Finish" : "Next"} size="small" variant="contained" onLeftClick={() => go(1)} />
				</Stack>
			)}
		</Stack>
	);

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants>
			<ScrollView sx={{ Size: new UDim2(1, 0, 1, 0), p: 2 }}>
				{narrow ? (
					<Stack direction="column" gap={2} sx={STACK}>
						<Illustration step={step} done={done} tall={160} />
						{panel}
					</Stack>
				) : (
					<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
						<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 16)} SortOrder={Enum.SortOrder.LayoutOrder} />
						<frame LayoutOrder={0} Size={new UDim2(0, 420, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
							<Illustration step={step} done={done} tall={520} />
						</frame>
						<frame LayoutOrder={1} Size={new UDim2(1, -436, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
							{panel}
						</frame>
					</frame>
				)}
			</ScrollView>
		</frame>
	);
}

export default {
	title: "Scenarios/Onboarding",
	description: "First-run flow with a required name and a live tone preview.",
	args: { viewport: "desktop" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
	},
	tags: ["scenario"],
	render: (args: Args) => <Onboarding {...args} />,
};
