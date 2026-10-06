import React from "@rbxts/react";
import { Button, Divider, Link, Shadow, Typography, useTheme } from "@rbxts/uiblox";
import { AppBar, Box, Chip, Container, Paper, Stack } from "./kitBreadth";

interface Args {
	viewport: "phone" | "tablet" | "desktop";
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 720 },
	tablet: { width: 768, height: 720 },
	desktop: { width: 1100, height: 720 },
};

const FEATURES = [
	{
		title: "Typed surfaces",
		body: "Compose frames, text, and actions with theme tokens instead of one-off colors.",
	},
	{
		title: "Responsive sx",
		body: "Phone, tablet, and desktop breakpoints reshape spacing, type, and layout together.",
	},
	{
		title: "Stateful polish",
		body: "Hover, press, and selected styles stay on the same host path as the rest of the kit.",
	},
];

const PLANS = [
	{ name: "Starter", price: "$0", note: "Local previews and fixtures", accent: false },
	{ name: "Studio", price: "$29", note: "Shared themes and capture suites", accent: true },
	{ name: "Fleet", price: "$99", note: "Org libraries and release gates", accent: false },
];

function SectionLabel(props: { text: string; order: number }) {
	return (
		<Typography
			text={props.text}
			variant="overline"
			color="textSecondary"
			sx={{
				LayoutOrder: props.order,
				Size: new UDim2(1, 0, 0, 20),
				AutomaticSize: Enum.AutomaticSize.None,
			}}
		/>
	);
}

function Heading(props: { text: string; order: number; variant?: "h1" | "h2" | "h3" }) {
	return (
		<Typography
			text={props.text}
			variant={props.variant ?? "h2"}
			color="textPrimary"
			sx={{
				LayoutOrder: props.order,
				Size: new UDim2(1, 0, 0, props.variant === "h1" ? 56 : 36),
				AutomaticSize: Enum.AutomaticSize.None,
			}}
		/>
	);
}

function Body(props: { text: string; order: number; color?: "textPrimary" | "textSecondary" }) {
	return (
		<Typography
			text={props.text}
			variant="body"
			color={props.color ?? "textSecondary"}
			sx={{
				LayoutOrder: props.order,
				Size: new UDim2(1, 0, 0, 0),
				AutomaticSize: Enum.AutomaticSize.Y,
			}}
		/>
	);
}

function FeatureTile(props: { title: string; body: string; order: number; narrow: boolean }) {
	return (
		<Paper
			elevation="raised"
			sx={{
				LayoutOrder: props.order,
				Size: props.narrow ? new UDim2(1, 0, 0, 0) : new UDim2(0, 240, 0, 0),
				AutomaticSize: Enum.AutomaticSize.Y,
				_hover: { bgcolor: "action.hover" },
			}}
		>
			<Shadow />
			<Stack direction="column" gap={1} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<Typography
					text={props.title}
					variant="h3"
					color="textPrimary"
					sx={{ Size: new UDim2(1, 0, 0, 28), AutomaticSize: Enum.AutomaticSize.None }}
				/>
				<Body text={props.body} order={1} />
			</Stack>
		</Paper>
	);
}

function PlanTile(props: {
	name: string;
	price: string;
	note: string;
	accent: boolean;
	order: number;
	narrow: boolean;
}) {
	return (
		<Paper
			elevation={props.accent ? "raised" : "outlined"}
			sx={{
				LayoutOrder: props.order,
				Size: props.narrow ? new UDim2(1, 0, 0, 0) : new UDim2(0, 220, 0, 0),
				AutomaticSize: Enum.AutomaticSize.Y,
				_hover: { bgcolor: "surface.elevated" },
			}}
		>
			{props.accent && <Shadow />}
			<Stack direction="column" gap={1.5} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<Stack direction="row" gap={1} alignItems="center" sx={{ Size: new UDim2(1, 0, 0, 28), AutomaticSize: Enum.AutomaticSize.None }}>
					<Typography
						text={props.name}
						variant="h3"
						color="textPrimary"
						sx={{ Size: new UDim2(1, 0, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}
					/>
					{props.accent && <Chip label="Popular" color="primary" size="small" selected={true} />}
				</Stack>
				<Typography
					text={props.price}
					variant="h1"
					color="primary"
					sx={{ Size: new UDim2(1, 0, 0, 48), AutomaticSize: Enum.AutomaticSize.None }}
				/>
				<Body text={props.note} order={2} />
				<Button text="Choose plan" variant={props.accent ? "contained" : "outlined"} color="primary" fullWidth={true} />
			</Stack>
		</Paper>
	);
}

function PremiumLanding(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const heroPad = narrow ? 3 : 5;

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			<AppBar title="Northline" elevation="raised" color="default" sx={{ LayoutOrder: 0 }}>
				{!narrow && (
					<>
						<Button text="Product" variant="text" size="small" color="secondary" />
						<Button text="Pricing" variant="text" size="small" color="secondary" />
						<Button text="Start" variant="contained" size="small" color="primary" />
					</>
				)}
				{narrow && <Button text="Menu" variant="outlined" size="small" color="secondary" />}
			</AppBar>
			<scrollingframe
				LayoutOrder={1}
				Size={new UDim2(1, 0, 1, -theme.spacing.calc(7))}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				ScrollBarThickness={6}
				CanvasSize={new UDim2(0, 0, 0, 0)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Vertical}
					SortOrder={Enum.SortOrder.LayoutOrder}
					Padding={new UDim(0, theme.spacing.calc(3))}
				/>

				<Box
					bgcolor="elevated"
					padding={heroPad}
					sx={{
						LayoutOrder: 1,
						Size: new UDim2(1, 0, 0, narrow ? 280 : 320),
						AutomaticSize: Enum.AutomaticSize.None,
						bgcolor: "primary.main",
					}}
				>
					<uigradient
						Color={
							new ColorSequence([
								new ColorSequenceKeypoint(0, theme.palette.primary.main),
								new ColorSequenceKeypoint(0.55, theme.palette.accent.main),
								new ColorSequenceKeypoint(1, theme.palette.primary.hover),
							])
						}
						Rotation={narrow ? 90 : 18}
					/>
					<Container maxWidth="md" disableGutters={true} sx={{ Size: new UDim2(1, 0, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}>
						<Stack
							direction="column"
							gap={2}
							justifyContent="center"
							sx={{ Size: new UDim2(1, 0, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}
						>
							<SectionLabel text="Preview kit" order={0} />
							<Heading
								text={narrow ? "Ship polished UI" : "Ship polished product UI without fighting the host"}
								order={1}
								variant="h1"
							/>
							<Body
								text="A composed landing surface for nav, hero type, cards, pricing, and footer links — built only from exported kit APIs and sx."
								order={2}
								color="textPrimary"
							/>
							<Stack
								direction={narrow ? "column" : "row"}
								gap={1}
								sx={{
									LayoutOrder: 3,
									Size: new UDim2(1, 0, 0, 0),
									AutomaticSize: Enum.AutomaticSize.Y,
								}}
							>
								<Button text="Browse stories" variant="contained" color="secondary" />
								<Button text="See pricing" variant="outlined" color="secondary" />
							</Stack>
						</Stack>
					</Container>
				</Box>

				<Container maxWidth="lg" sx={{ LayoutOrder: 2, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
					<Stack direction="column" gap={2} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
						<SectionLabel text="Capabilities" order={0} />
						<Heading text="Everything a landing page needs to feel finished" order={1} />
						<Stack
							direction={narrow ? "column" : "row"}
							gap={2}
							wrap={true}
							sx={{ LayoutOrder: 2, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
						>
							{FEATURES.map((feature, index) => (
								<FeatureTile
									key={feature.title}
									title={feature.title}
									body={feature.body}
									order={index}
									narrow={narrow}
								/>
							))}
						</Stack>
					</Stack>
				</Container>

				<Container maxWidth="lg" sx={{ LayoutOrder: 3, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
					<Stack direction="column" gap={2} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
						<SectionLabel text="Pricing" order={0} />
						<Heading text="Pick a lane and keep moving" order={1} />
						<Stack
							direction={narrow ? "column" : "row"}
							gap={2}
							wrap={true}
							sx={{ LayoutOrder: 2, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
						>
							{PLANS.map((plan, index) => (
								<PlanTile
									key={plan.name}
									name={plan.name}
									price={plan.price}
									note={plan.note}
									accent={plan.accent}
									order={index}
									narrow={narrow}
								/>
							))}
						</Stack>
					</Stack>
				</Container>

				<Container maxWidth="md" sx={{ LayoutOrder: 4, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
					<Paper elevation="outlined" sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
						<Stack direction="column" gap={1.5} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
							<SectionLabel text="Note from a builder" order={0} />
							<Heading text="“The page finally reads as one surface, not a pile of controls.”" order={1} variant="h3" />
							<Body text="Jordan Hale · Product engineer" order={2} />
						</Stack>
					</Paper>
				</Container>

				<Box
					bgcolor="paper"
					padding={3}
					sx={{ LayoutOrder: 5, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
				>
					<Container maxWidth="lg" disableGutters={true} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
						<Stack direction="column" gap={2} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
							<Divider />
							<Stack
								direction={narrow ? "column" : "row"}
								gap={2}
								justifyContent="space-between"
								alignItems={narrow ? "start" : "center"}
								sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
							>
								<Typography
									text="Northline"
									variant="h3"
									color="textPrimary"
									sx={{ Size: new UDim2(0, 120, 0, 28), AutomaticSize: Enum.AutomaticSize.None }}
								/>
								<Stack direction="row" gap={2} wrap={true} sx={{ Size: new UDim2(0, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.XY }}>
									<Link text="Docs" underline="hover" />
									<Link text="Changelog" underline="hover" />
									<Link text="Support" underline="hover" />
								</Stack>
							</Stack>
							<Body text="Original fixture copy for styling parity. No brand assets." order={3} />
						</Stack>
					</Container>
				</Box>
			</scrollingframe>
		</frame>
	);
}

export default {
	title: "Scenarios/Premium Landing",
	description: "Full landing composition: nav, gradient hero, feature cards, pricing, testimonial, footer.",
	args: { viewport: "desktop" },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "tablet", "desktop"] },
	},
	preview: { width: 1100, height: 720 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <PremiumLanding {...args} />,
};
