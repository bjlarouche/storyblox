import React, { useState } from "@rbxts/react";
import { Button, Input, Shadow, Typography, useTheme } from "@rbxts/uiblox";
import { Tooltip } from "./kit";
import { AppBar, Badge, Chip, Drawer, Menu, Paper, Rating, Stack, useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "tablet" | "desktop";
	menuOpen: boolean;
	detailsOpen: boolean;
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 720 },
	tablet: { width: 768, height: 720 },
	desktop: { width: 1100, height: 720 },
};

const FILTERS = ["All", "Explore", "Puzzle", "Race"];

interface Game {
	id: string;
	title: string;
	genre: string;
	players: string;
	rating: number;
	sessions: number;
	blurb: string;
	from: Color3;
	to: Color3;
}

const GAMES: Game[] = [
	{
		id: "harbor",
		title: "Harbor Lights",
		genre: "Explore",
		players: "12k",
		rating: 4,
		sessions: 6,
		blurb: "Walk the docks after dark and chart the buoys before the tide turns.",
		from: Color3.fromRGB(28, 72, 120),
		to: Color3.fromRGB(186, 214, 232),
	},
	{
		id: "kites",
		title: "Paper Kites",
		genre: "Puzzle",
		players: "8k",
		rating: 5,
		sessions: 3,
		blurb: "Fold wind into routes. Each kite has to land on its own rooftop.",
		from: Color3.fromRGB(196, 92, 64),
		to: Color3.fromRGB(244, 214, 168),
	},
	{
		id: "market",
		title: "Night Market",
		genre: "Explore",
		players: "21k",
		rating: 4,
		sessions: 11,
		blurb: "Trade stories between stalls. The map changes when the lanterns do.",
		from: Color3.fromRGB(92, 36, 110),
		to: Color3.fromRGB(232, 120, 86),
	},
	{
		id: "circuit",
		title: "Glass Circuit",
		genre: "Race",
		players: "15k",
		rating: 3,
		sessions: 4,
		blurb: "A short loop of transparent track. Miss a gate and you restart the heat.",
		from: Color3.fromRGB(18, 96, 110),
		to: Color3.fromRGB(150, 230, 210),
	},
	{
		id: "tide",
		title: "Low Tide",
		genre: "Puzzle",
		players: "4k",
		rating: 5,
		sessions: 1,
		blurb: "Move stones while the water is out. The path closes when it returns.",
		from: Color3.fromRGB(48, 78, 92),
		to: Color3.fromRGB(198, 176, 140),
	},
	{
		id: "cedar",
		title: "Cedar Run",
		genre: "Race",
		players: "9k",
		rating: 4,
		sessions: 2,
		blurb: "Downhill between trees. Brake late, but not into the switchback.",
		from: Color3.fromRGB(46, 90, 52),
		to: Color3.fromRGB(214, 196, 120),
	},
];

function findGame(id: string): Game {
	for (const entry of GAMES) {
		if (entry.id === id) return entry;
	}
	return GAMES[0];
}

function Artwork(props: { game: Game; height: number }) {
	return (
		<frame
			Size={new UDim2(1, 0, 0, props.height)}
			BackgroundColor3={props.game.from}
			BorderSizePixel={0}
			LayoutOrder={0}
		>
			<uicorner CornerRadius={new UDim(0, 8)} />
			<uigradient
				Color={new ColorSequence(props.game.from, props.game.to)}
				Rotation={118}
			/>
		</frame>
	);
}

function GameTile(props: {
	game: Game;
	selected: boolean;
	order: number;
	narrow: boolean;
	onSelect: () => void;
}) {
	return (
		<Paper
			elevation={props.selected ? "raised" : "outlined"}
			sx={{
				LayoutOrder: props.order,
				Size: props.narrow ? new UDim2(1, 0, 0, 0) : new UDim2(0, 220, 0, 0),
				AutomaticSize: Enum.AutomaticSize.Y,
			}}
		>
			{props.selected && <Shadow />}
			<Stack direction="column" gap={1} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<Badge count={props.game.sessions} color="primary">
					<Artwork game={props.game} height={96} />
				</Badge>
				<Typography
					text={props.game.title}
					variant="h3"
					color="textPrimary"
					sx={{ Size: new UDim2(1, 0, 0, 28), AutomaticSize: Enum.AutomaticSize.None }}
				/>
				<Stack
					direction="row"
					gap={1}
					alignItems="center"
					sx={{ Size: new UDim2(1, 0, 0, 24), AutomaticSize: Enum.AutomaticSize.None }}
				>
					<Rating value={props.game.rating} readOnly={true} size="small" onChange={() => undefined} />
					<Typography
						text={props.game.players}
						variant="caption"
						color="textSecondary"
						sx={{ Size: new UDim2(0, 48, 1, 0), AutomaticSize: Enum.AutomaticSize.None }}
					/>
				</Stack>
				<Button text={props.selected ? "Selected" : "Open"} variant={props.selected ? "contained" : "outlined"} size="small" onLeftClick={props.onSelect} />
			</Stack>
		</Paper>
	);
}

function Details(props: { game: Game; onJoin: () => void }) {
	return (
		<Stack direction="column" gap={1.5} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
			<Artwork game={props.game} height={120} />
			<Typography
				text={props.game.title}
				variant="h2"
				color="textPrimary"
				sx={{ Size: new UDim2(1, 0, 0, 36), AutomaticSize: Enum.AutomaticSize.None }}
			/>
			<Chip label={props.game.genre} variant="outlined" size="small" />
			<Rating value={props.game.rating} readOnly={true} onChange={() => undefined} />
			<Typography
				text={props.game.blurb}
				variant="body"
				color="textSecondary"
				sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
			/>
			<Typography
				text={`${props.game.sessions} live sessions · ${props.game.players} players`}
				variant="caption"
				color="textSecondary"
				sx={{ Size: new UDim2(1, 0, 0, 20), AutomaticSize: Enum.AutomaticSize.None }}
			/>
			<Button text="Join session" variant="contained" color="primary" onLeftClick={props.onJoin} />
		</Stack>
	);
}

function GameDiscovery(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [query, setQuery] = useArg("");
	const [filter, setFilter] = useState("All");
	const [selectedId, setSelectedId] = useState(GAMES[0].id);
	const [menuOpen, setMenuOpen] = useArg(args.menuOpen);
	const [sort, setSort] = useState("featured");
	const [detailsOpen, setDetailsOpen] = useArg(args.detailsOpen);
	const [anchor, setAnchor] = useState<TextButton>();

	const needle = string.lower(query);
	const shown: Game[] = [];
	for (const entry of GAMES) {
		if (filter !== "All" && entry.genre !== filter) continue;
		if (needle.size() > 0 && string.find(string.lower(entry.title), needle, 1, true) === undefined) continue;
		shown.push(entry);
	}
	if (sort === "rating") {
		shown.sort((a, b) => b.rating < a.rating);
	} else if (sort === "players") {
		shown.sort((a, b) => a.players < b.players);
	}

	const selected = findGame(selectedId);
	const openDetails = (id: string) => {
		setSelectedId(id);
		setDetailsOpen(true);
	};

	return (
		<frame Size={new UDim2(0, size.width, 0, size.height)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			<AppBar title="Northline Play" elevation="raised" color="default" sx={{ LayoutOrder: 0 }}>
				<Tooltip text="Sort the shelf. Featured, rating, or player count.">
					<Typography
						text="Sort help"
						variant="caption"
						color="textSecondary"
						sx={{ Size: new UDim2(0, 64, 0, 20), AutomaticSize: Enum.AutomaticSize.None }}
					/>
				</Tooltip>
				<Button
					ref={setAnchor}
					text={sort === "featured" ? "Featured" : sort === "rating" ? "Rating" : "Players"}
					variant="outlined"
					size="small"
					color="secondary"
					onLeftClick={() => setMenuOpen(true)}
				/>
			</AppBar>
			<Menu
				anchor={anchor}
				open={menuOpen}
				selected={sort}
				items={[
					{ id: "featured", text: "Featured" },
					{ id: "rating", text: "Top rating" },
					{ id: "players", text: "Player count" },
				]}
				onSelect={(id: string) => setSort(id)}
				onClose={() => setMenuOpen(false)}
			/>
			<scrollingframe
				LayoutOrder={1}
				Size={new UDim2(1, 0, 1, -theme.spacing.calc(7))}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				ScrollBarThickness={6}
				CanvasSize={new UDim2(0, 0, 0, 0)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
			>
				<uipadding
					PaddingTop={new UDim(0, theme.spacing.calc(2))}
					PaddingBottom={new UDim(0, theme.spacing.calc(2))}
					PaddingLeft={new UDim(0, theme.spacing.calc(2))}
					PaddingRight={new UDim(0, theme.spacing.calc(2))}
				/>
				<uilistlayout
					FillDirection={Enum.FillDirection.Vertical}
					Padding={new UDim(0, theme.spacing.calc(2))}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				<Input
					text={query}
					placeholder="Search sessions"
					variant="outlined"
					width={new UDim(1, 0)}
					onTextChanged={setQuery}
				/>
				<Stack
					direction="row"
					gap={1}
					wrap={true}
					sx={{ LayoutOrder: 1, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
				>
					{FILTERS.map((name) => (
						<Chip
							key={name}
							label={name}
							size="small"
							variant={filter === name ? "filled" : "outlined"}
							color={filter === name ? "primary" : "default"}
							selected={filter === name}
							onActivated={() => setFilter(name)}
						/>
					))}
				</Stack>
				<Stack
					direction={narrow ? "column" : "row"}
					gap={2}
					alignItems="start"
					sx={{ LayoutOrder: 2, Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
				>
					<Stack
						direction={narrow ? "column" : "row"}
						gap={2}
						wrap={!narrow}
						sx={{
							Size: narrow ? new UDim2(1, 0, 0, 0) : new UDim2(1, narrow ? 0 : -300, 0, 0),
							AutomaticSize: Enum.AutomaticSize.Y,
						}}
					>
						{shown.size() === 0 && (
							<Typography
								text="No sessions match that search."
								variant="body"
								color="textSecondary"
								sx={{ Size: new UDim2(1, 0, 0, 24), AutomaticSize: Enum.AutomaticSize.None }}
							/>
						)}
						{shown.map((entry, index) => (
							<GameTile
								key={entry.id}
								game={entry}
								selected={entry.id === selectedId}
								order={index}
								narrow={narrow}
								onSelect={() => openDetails(entry.id)}
							/>
						))}
					</Stack>
					{!narrow && (
						<Paper
							elevation="outlined"
							sx={{ Size: new UDim2(0, 280, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
						>
							<Details game={selected} onJoin={() => undefined} />
						</Paper>
					)}
				</Stack>
			</scrollingframe>
			{narrow && (
				<Drawer open={detailsOpen} edge="right" width={320} onClose={() => setDetailsOpen(false)}>
					<Details game={selected} onJoin={() => setDetailsOpen(false)} />
				</Drawer>
			)}
		</frame>
	);
}

export default {
	title: "Scenarios/Game Discovery",
	description: "Discovery shelf: search, filter chips, gradient tiles, ratings, badges, sort menu, tooltip, and a details drawer.",
	args: { viewport: "desktop", menuOpen: false, detailsOpen: true },
	argTypes: {
		viewport: { type: "enum", options: ["phone", "tablet", "desktop"] },
		menuOpen: { type: "boolean" },
		detailsOpen: { type: "boolean" },
	},
	preview: { width: 1100, height: 720 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <GameDiscovery {...args} />,
};
