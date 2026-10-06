import React, { useState } from "@rbxts/react";
import {
	Alert,
	AppBar,
	Box,
	Button,
	Chip,
	Dialog,
	Drawer,
	FormHelperText,
	FormLabel,
	Input,
	Menu,
	NumberInput,
	Paper,
	Select,
	Snackbar,
	Stack,
	Stepper,
	Tooltip,
	Typography,
	useTheme,
	WriteableStyle,
} from "@rbxts/uiblox";
import { DateRangePicker, ScrollView, useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	step: number;
	summaryOpen: boolean;
	confirmOpen: boolean;
	booked: boolean;
}

interface DateSpan {
	start?: number;
	finish?: number;
}

interface Room {
	id: string;
	name: string;
	detail: string;
	price: number;
	from: Color3;
	to: Color3;
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 780 },
	desktop: { width: 1100, height: 760 },
};

const STEPS = ["Stay", "Guests", "Details", "Review"];
const ARRIVALS = [
	{ label: "Morning", value: "morning" },
	{ label: "Afternoon", value: "afternoon" },
	{ label: "Evening", value: "evening" },
];
const ROOMS: Room[] = [
	{
		id: "harbor",
		name: "Harbor Room",
		detail: "Queen bed and a courtyard window.",
		price: 180,
		from: Color3.fromRGB(28, 92, 140),
		to: Color3.fromRGB(186, 214, 232),
	},
	{
		id: "cedar",
		name: "Cedar Loft",
		detail: "Two beds and a quiet upper floor.",
		price: 240,
		from: Color3.fromRGB(46, 96, 58),
		to: Color3.fromRGB(214, 196, 140),
	},
	{
		id: "glass",
		name: "Glass Suite",
		detail: "One bedroom with a long city view.",
		price: 320,
		from: Color3.fromRGB(72, 64, 140),
		to: Color3.fromRGB(214, 176, 220),
	},
];
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };

function leap(year: number) {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number) {
	if (month === 2 && leap(year)) return 29;
	return MONTH_LENGTHS[month - 1] ?? 30;
}

function dayIndex(stamp: number) {
	const year = math.floor(stamp / 10000);
	const month = math.floor(stamp / 100) % 100;
	const day = stamp % 100;
	let index = day;
	for (let cursor = 1; cursor < year; cursor++) index += leap(cursor) ? 366 : 365;
	for (let cursor = 1; cursor < month; cursor++) index += daysInMonth(year, cursor);
	return index;
}

function nightsBetween(start?: number, finish?: number) {
	if (start === undefined || finish === undefined) return 0;
	return math.abs(dayIndex(finish) - dayIndex(start));
}

function formatStamp(stamp?: number) {
	if (stamp === undefined) return "Open";
	return `${MONTHS[(math.floor(stamp / 100) % 100) - 1] ?? "Day"} ${stamp % 100}`;
}

function TextLine(props: { text: string; variant?: "h2" | "h3" | "body" | "caption"; color?: "textPrimary" | "textSecondary" | "error"; wrap?: boolean }) {
	return (
		<Typography
			text={props.text}
			variant={props.variant ?? "body"}
			color={props.color ?? "textPrimary"}
			sx={{
				Size: new UDim2(1, 0, 0, props.wrap ? 0 : props.variant === "h2" ? 32 : 20),
				AutomaticSize: props.wrap ? Enum.AutomaticSize.Y : Enum.AutomaticSize.None,
			}}
		/>
	);
}

function findRoom(id: string) {
	for (const room of ROOMS) if (room.id === id) return room;
	return ROOMS[0];
}

function Summary(props: { room: Room; nights: number; promo: string; arrival: string }) {
	const discount = string.lower(props.promo) === "welcome" ? 20 : 0;
	const stay = props.room.price * props.nights;
	const total = math.max(stay + 12 - discount, 0);
	return (
		<Stack direction="column" gap={1} sx={STACK}>
			<TextLine text="Price summary" variant="h3" />
			<TextLine text={props.room.name} wrap />
			<TextLine text={`${props.nights} nights · ${props.arrival}`} variant="caption" color="textSecondary" />
			<TextLine text={`Room ${stay}`} />
			<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
				<TextLine text="Cleaning 12" />
				<Tooltip text="A flat house fee. It does not change with guests.">
					<TextLine text="Why" variant="caption" color="textSecondary" />
				</Tooltip>
			</Stack>
			<TextLine text={discount > 0 ? "Welcome credit 20" : "No credit yet"} color="textSecondary" />
			<TextLine text={`Due ${total}`} variant="h3" />
		</Stack>
	);
}

function BookingCheckout(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const bar = theme.spacing.calc(7);
	const [step, setStep] = useArg(args.step);
	const [summaryOpen, setSummaryOpen] = useArg(args.summaryOpen);
	const [confirmOpen, setConfirmOpen] = useArg(args.confirmOpen);
	const [booked, setBooked] = useArg(args.booked);
	const [notice, setNotice] = useState("");
	const [query, setQuery] = useState("");
	const [span, setSpan] = useState<DateSpan>({});
	const [year, setYear] = useState(2026);
	const [month, setMonth] = useState(10);
	const [roomId, setRoomId] = useState("cedar");
	const [sort, setSort] = useState("featured");
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchor, setAnchor] = useState<TextButton>();
	const [adults, setAdults] = useState(2);
	const [children, setChildren] = useState(0);
	const [arrival, setArrival] = useState("afternoon");
	const [breakfast, setBreakfast] = useState(true);
	const [name, setName] = useState("Avery Cole");
	const [note, setNote] = useState("");
	const [reference, setReference] = useState("");
	const [promo, setPromo] = useState("");

	const nights = nightsBetween(span.start, span.finish);
	const room = findRoom(roomId);
	const needle = string.lower(query);
	const shown: Room[] = [];
	for (const entry of ROOMS) {
		if (needle.size() > 0 && string.find(string.lower(entry.name), needle, 1, true) === undefined) continue;
		shown.push(entry);
	}
	if (sort === "price") shown.sort((a, b) => a.price < b.price);
	const promoOk = promo.size() === 0 || string.lower(promo) === "welcome";
	const referenceOk = reference.size() === 0 || reference.size() === 4;
	const stayOk = query.size() > 0 && span.start !== undefined && span.finish !== undefined && nights > 0;
	const guestOk = adults >= 1;
	const detailOk = name.size() >= 2 && referenceOk;
	const stepOk = step === 0 ? stayOk : step === 1 ? guestOk : step === 2 ? detailOk : stayOk && guestOk && detailOk && promoOk;
	const arrivalLabel = arrival === "morning" ? "Morning" : arrival === "evening" ? "Evening" : "Afternoon";

	const advance = () => {
		if (!stepOk) {
			setNotice("Finish the highlighted fields first.");
			return;
		}
		if (step >= 3) setConfirmOpen(true);
		else setStep(step + 1);
	};

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0} ClipsDescendants={true}>
			<AppBar title="Book a stay" elevation="raised">
				{narrow && <Button text="Price" variant="outlined" size="small" onLeftClick={() => setSummaryOpen(true)} />}
				<Button text={step >= 3 ? "Confirm" : "Next"} variant="contained" color="primary" size="small" disabled={!stepOk || booked} onLeftClick={advance} />
			</AppBar>
			<frame Position={new UDim2(0, 0, 0, bar)} Size={new UDim2(1, 0, 0, narrow ? 132 : 48)} BackgroundTransparency={1}>
				<Stepper steps={STEPS} activeStep={step} orientation={narrow ? "vertical" : "horizontal"} />
			</frame>
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar + (narrow ? 132 : 48)), Size: new UDim2(1, narrow ? 0 : -300, 1, -(bar + (narrow ? 132 : 48))), p: 2 }}>
				{booked ? (
					<Paper elevation="raised" sx={STACK}>
						<Stack direction="column" gap={1} sx={STACK}>
							<Alert severity="success" title="Hold confirmed" message="Nothing was charged. This is a preview booking." />
							<TextLine text={`${room.name} · ${formatStamp(span.start)} to ${formatStamp(span.finish)}`} wrap />
							<TextLine text={`${adults} adults, ${children} children · ${arrivalLabel}`} color="textSecondary" wrap />
							<Button text="Start over" variant="outlined" onLeftClick={() => setBooked(false)} />
						</Stack>
					</Paper>
				) : (
					<Stack direction="column" gap={2} sx={STACK}>
						{step === 0 && (
							<Stack direction="column" gap={1.5} sx={STACK}>
								<TextLine text="Where and when" variant="h2" />
								<Field label="Destination">
									<Input text={query} placeholder="Search rooms" variant="outlined" width={new UDim(1, 0)} hasError={query.size() === 0} onTextChanged={setQuery} />
									<FormHelperText text={query.size() === 0 ? "Enter a place to search." : `${shown.size()} rooms`} hasError={query.size() === 0} />
								</Field>
								<Paper elevation="outlined" sx={STACK}>
									<DateRangePicker
										year={year}
										month={month}
										value={span}
										onChange={(value: DateSpan) => setSpan(value)}
										onMonthChange={(nextYear: number, nextMonth: number) => {
											setYear(nextYear);
											setMonth(nextMonth);
										}}
									/>
								</Paper>
								<FormHelperText text={nights > 0 ? `${nights} nights` : "Choose a start and finish date."} hasError={nights === 0} />
								<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
									<Button ref={setAnchor} text={sort === "price" ? "Lowest price" : "Featured"} variant="outlined" size="small" onLeftClick={() => setMenuOpen(true)} />
									<TextLine text="Option cards" variant="caption" color="textSecondary" />
								</Stack>
								{shown.map((entry) => (
									<Paper key={entry.id} elevation={entry.id === roomId ? "raised" : "outlined"} sx={STACK}>
										<Stack direction="column" gap={1} sx={STACK}>
											<Box
												bgcolor="paper"
												sx={
													{
														AutomaticSize: Enum.AutomaticSize.None,
														Size: new UDim2(1, 0, 0, 56),
														gradient: { colors: [entry.from, entry.to], rotation: 110 },
													} as WriteableStyle<Frame>
												}
											/>
											<TextLine text={`${entry.name} · ${entry.price} a night`} variant="h3" wrap />
											<TextLine text={entry.detail} color="textSecondary" wrap />
											<Button text={entry.id === roomId ? "Selected" : "Choose"} variant={entry.id === roomId ? "contained" : "outlined"} size="small" onLeftClick={() => setRoomId(entry.id)} />
										</Stack>
									</Paper>
								))}
								{shown.size() === 0 && <TextLine text="No rooms match that search." color="textSecondary" />}
							</Stack>
						)}
						{step === 1 && (
							<Stack direction="column" gap={1.5} sx={STACK}>
								<TextLine text="Who is coming" variant="h2" />
								<Field label="Adults">
									<NumberInput value={adults} min={1} max={6} step={1} width={new UDim(0, 140)} onChange={setAdults} />
									<FormHelperText text={adults >= 1 ? "At least one adult is included." : "Add an adult."} hasError={adults < 1} />
								</Field>
								<Field label="Children">
									<NumberInput value={children} min={0} max={6} step={1} width={new UDim(0, 140)} onChange={setChildren} />
								</Field>
								<Field label="Arrival time">
									<Select value={arrival} options={ARRIVALS} onChange={setArrival} sx={{ Size: new UDim2(1, 0, 0, 36) }} />
								</Field>
								<Stack direction="row" gap={1} wrap sx={STACK}>
									<Chip label="Breakfast" selected={breakfast} color={breakfast ? "primary" : "default"} onActivated={() => setBreakfast(!breakfast)} />
									<Chip label="Late checkout" variant="outlined" />
								</Stack>
							</Stack>
						)}
						{step === 2 && (
							<Stack direction="column" gap={1.5} sx={STACK}>
								<TextLine text="Contact" variant="h2" />
								<Field label="Name for the hold">
									<Input text={name} variant="outlined" width={new UDim(1, 0)} hasError={name.size() < 2} onTextChanged={setName} />
									<FormHelperText text={name.size() < 2 ? "Enter the guest name." : "Used only on this preview."} hasError={name.size() < 2} />
								</Field>
								<Field label="Note">
									<Input text={note} placeholder="Arrival notes" variant="outlined" width={new UDim(1, 0)} onTextChanged={setNote} />
								</Field>
								<Field label="Reference">
									<Input text={reference} placeholder="Optional 4 digits" variant="outlined" width={new UDim(1, 0)} hasError={!referenceOk} onTextChanged={setReference} />
									<FormHelperText text={referenceOk ? "Nothing is charged." : "Use exactly 4 digits or leave it blank."} hasError={!referenceOk} />
								</Field>
							</Stack>
						)}
						{step >= 3 && (
							<Stack direction="column" gap={1.5} sx={STACK}>
								<TextLine text="Review the hold" variant="h2" />
								<TextLine text={`${formatStamp(span.start)} to ${formatStamp(span.finish)} · ${room.name}`} wrap />
								<TextLine text={`${name} · ${adults + children} guests · ${arrivalLabel}${breakfast ? " · breakfast" : ""}`} color="textSecondary" wrap />
								{note.size() > 0 && <TextLine text={note} color="textSecondary" wrap />}
								<Field label="Credit code">
									<Input text={promo} placeholder="WELCOME" variant="outlined" width={new UDim(1, 0)} hasError={!promoOk} onTextChanged={setPromo} />
									<FormHelperText text={promoOk ? "WELCOME takes 20 off." : "That code is not recognized."} hasError={!promoOk} />
								</Field>
								{!stepOk && <Alert severity="error" message="Dates, guests, and a name are required." />}
								<Button text="Back" variant="text" onLeftClick={() => setStep(math.max(step - 1, 0))} />
							</Stack>
						)}
						{step < 3 && (
							<Stack direction="row" gap={1} sx={STACK}>
								<Button text="Back" variant="text" disabled={step === 0} onLeftClick={() => setStep(math.max(step - 1, 0))} />
								<Button text="Continue" variant="contained" color="primary" disabled={!stepOk} onLeftClick={advance} />
							</Stack>
						)}
					</Stack>
				)}
			</ScrollView>
			{!narrow && (
				<Paper elevation="outlined" sx={{ Position: new UDim2(1, -284, 0, bar + 56), Size: new UDim2(0, 268, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
					<Summary room={room} nights={nights} promo={promo} arrival={arrivalLabel} />
				</Paper>
			)}
			<Menu
				anchor={anchor}
				open={menuOpen}
				selected={sort}
				items={[
					{ id: "featured", text: "Featured" },
					{ id: "price", text: "Lowest price" },
				]}
				onSelect={(id: string) => setSort(id)}
				onClose={() => setMenuOpen(false)}
			/>
			<Drawer open={narrow && summaryOpen} edge="right" width={320} onClose={() => setSummaryOpen(false)}>
				<Summary room={room} nights={nights} promo={promo} arrival={arrivalLabel} />
			</Drawer>
			<Dialog
				open={confirmOpen}
				title="Confirm this hold?"
				onClose={() => setConfirmOpen(false)}
				actions={
					<Stack direction="row" gap={1} sx={{ AutomaticSize: Enum.AutomaticSize.XY }}>
						<Button text="Keep editing" variant="text" onLeftClick={() => setConfirmOpen(false)} />
						<Button
							text="Confirm"
							variant="contained"
							color="primary"
							onLeftClick={() => {
								setConfirmOpen(false);
								setBooked(true);
								setNotice("Hold saved. Nothing was charged.");
							}}
						/>
					</Stack>
				}
			>
				<TextLine text={`${room.name} from ${formatStamp(span.start)} to ${formatStamp(span.finish)}.`} wrap />
			</Dialog>
			<Snackbar open={notice.size() > 0} message={notice} onDismiss={() => setNotice("")} />
		</frame>
	);
}

function Field(props: { label: string; children: React.ReactNode }) {
	return (
		<Stack direction="column" gap={0.5} sx={STACK}>
			<FormLabel text={props.label} />
			{props.children}
		</Stack>
	);
}

export default {
	title: "Scenarios/Booking Checkout",
	description: "Multi-step stay booking: date range, room cards, guests, contact, price summary, validation, confirm dialog, and phone drawer.",
	args: { viewport: "desktop", step: 0, summaryOpen: false, confirmOpen: false, booked: false },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		step: { type: "number", min: 0, max: 3, step: 1 },
		summaryOpen: { type: "boolean" },
		confirmOpen: { type: "boolean" },
		booked: { type: "boolean" },
	},
	preview: { width: 1100, height: 760 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <BookingCheckout {...args} />,
};
