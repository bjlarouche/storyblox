import React, { useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import {
	AppBar,
	Badge,
	Button,
	Chip,
	Divider,
	NumberInput,
	Paper,
	ScrollView,
	Stack,
	Typography,
	useBreakpoints,
	useReducedMotion,
	useTheme,
} from "@rbxts/uiblox";

interface Swatch {
	id: string;
	label: string;
	color: Color3;
}

interface Line {
	id: string;
	title: string;
	detail: string;
	marks: number;
	qty: number;
}

type Variant = "lantern" | "beacon" | "crate";
type Fit = "small" | "carry" | "hall";

const SWATCHES: Swatch[] = [
	{ id: "ember", label: "Ember", color: Color3.fromRGB(196, 92, 58) },
	{ id: "tide", label: "Tide", color: Color3.fromRGB(58, 122, 168) },
	{ id: "moss", label: "Moss", color: Color3.fromRGB(78, 138, 96) },
	{ id: "slate", label: "Slate", color: Color3.fromRGB(90, 102, 118) },
	{ id: "bone", label: "Bone", color: Color3.fromRGB(214, 196, 164) },
];

const VARIANTS: { id: Variant; label: string; marks: number }[] = [
	{ id: "lantern", label: "Lantern", marks: 24 },
	{ id: "beacon", label: "Beacon", marks: 36 },
	{ id: "crate", label: "Crate", marks: 18 },
];

const FITS: { id: Fit; label: string; mul: number }[] = [
	{ id: "small", label: "Small", mul: 1 },
	{ id: "carry", label: "Carry", mul: 1.5 },
	{ id: "hall", label: "Hall", mul: 2 },
];

const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };

function priceOf(variant: Variant, fit: Fit, qty: number) {
	const base = VARIANTS.find((item) => item.id === variant)?.marks ?? 0;
	const mul = FITS.find((item) => item.id === fit)?.mul ?? 1;
	return math.floor(base * mul * qty);
}

function labelOf(variant: Variant) {
	return VARIANTS.find((item) => item.id === variant)?.label ?? "Lantern";
}

function Preview(props: { color: Color3; fit: Fit; variant: Variant; tall: number }) {
	const { theme } = useTheme();
	const frameRef = useRef<ViewportFrame>();
	const cameraRef = useRef<Camera>();
	const scale = props.fit === "small" ? 0.72 : props.fit === "hall" ? 1.28 : 1;
	useEffect(() => {
		const frame = frameRef.current;
		const camera = cameraRef.current;
		if (frame !== undefined && camera !== undefined) frame.CurrentCamera = camera;
	}, []);
	const body = new Vector3(1.25 * scale, 1.35 * scale, 1.25 * scale);
	return (
		<viewportframe
			ref={frameRef}
			Size={new UDim2(1, 0, 0, props.tall)}
			BackgroundColor3={theme.palette.surface.paper}
			BorderSizePixel={0}
			Ambient={Color3.fromRGB(170, 176, 184)}
			LightColor={Color3.fromRGB(255, 244, 220)}
			LightDirection={new Vector3(-1, -1.2, -0.6)}
		>
			<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
			<uigradient Rotation={90} Color={new ColorSequence(theme.palette.surface.elevated, theme.palette.surface.input)} />
			<camera ref={cameraRef} CFrame={CFrame.lookAt(new Vector3(6, 3.4, 7.5), new Vector3(0, 1.1, 0))} FieldOfView={38} />
			<worldmodel>
				<part
					Anchored
					Size={new Vector3(8, 0.2, 8)}
					CFrame={new CFrame(0, -0.1, 0)}
					Color={theme.palette.border}
					Material={Enum.Material.Slate}
				/>
				{props.variant === "crate" ? (
					<>
						<part Anchored Size={new Vector3(2.2 * scale, 1.35 * scale, 1.5 * scale)} CFrame={new CFrame(0, 0.68 * scale, 0)} Color={props.color} Material={Enum.Material.Wood} />
						<part Anchored Size={new Vector3(2.35 * scale, 0.16 * scale, 1.65 * scale)} CFrame={new CFrame(0, 1.4 * scale, -0.15 * scale)} Color={props.color} Material={Enum.Material.Wood} />
					</>
				) : props.variant === "beacon" ? (
					<>
						<part
							Anchored
							Shape={Enum.PartType.Cylinder}
							Size={new Vector3(2.8 * scale, 0.55 * scale, 0.55 * scale)}
							CFrame={new CFrame(0, 1.4 * scale, 0).mul(CFrame.Angles(0, 0, math.rad(90)))}
							Color={props.color}
							Material={Enum.Material.Metal}
						/>
						<part Anchored Shape={Enum.PartType.Ball} Size={new Vector3(0.7, 0.7, 0.7).mul(scale)} CFrame={new CFrame(0, 2.9 * scale, 0)} Color={props.color} Material={Enum.Material.Neon} />
					</>
				) : (
					<>
						<part Anchored Size={new Vector3(0.22 * scale, 1.5 * scale, 0.22 * scale)} CFrame={new CFrame(0, 0.75 * scale, 0)} Color={theme.palette.text.secondary} Material={Enum.Material.Metal} />
						<part Anchored Size={body} CFrame={new CFrame(0, 1.7 * scale, 0)} Color={props.color} Material={Enum.Material.Neon} />
						<part Anchored Size={new Vector3(1.45 * scale, 0.16 * scale, 1.45 * scale)} CFrame={new CFrame(0, 2.4 * scale, 0)} Color={theme.palette.text.secondary} Material={Enum.Material.Metal} />
					</>
				)}
			</worldmodel>
		</viewportframe>
	);
}

function SwatchButton(props: { swatch: Swatch; selected: boolean; onPick: () => void }) {
	const { theme } = useTheme();
	return (
		<textbutton
			Size={UDim2.fromOffset(76, 36)}
			BackgroundTransparency={1}
			AutoButtonColor={false}
			Text={props.swatch.label}
			Font={theme.typography.fontFamilies.default}
			TextSize={theme.typography.fontSizes.caption}
			TextColor3={theme.palette.text.primary}
			TextXAlignment={Enum.TextXAlignment.Right}
			Event={{ Activated: props.onPick }}
		>
			<frame Size={UDim2.fromOffset(22, 22)} Position={UDim2.fromOffset(0, 7)} BackgroundColor3={props.swatch.color} BorderSizePixel={0}>
				<uicorner CornerRadius={new UDim(1, 0)} />
				<uistroke
					Thickness={props.selected ? 2 : 1}
					Color={props.selected ? theme.palette.focus : theme.palette.border}
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				/>
			</frame>
		</textbutton>
	);
}

function ItemConfigurator() {
	const { theme } = useTheme();
	const reduced = useReducedMotion();
	const [host, setHost] = useState<Frame>();
	const view = useBreakpoints(host);
	const stacked = view.width < 860;
	const bar = theme.spacing.calc(7);
	const [swatchId, setSwatchId] = useState(SWATCHES[0].id);
	const [variant, setVariant] = useState<Variant>("lantern");
	const [fit, setFit] = useState<Fit>("carry");
	const [qty, setQty] = useState(1);
	const [lines, setLines] = useState<Line[]>([]);
	const [added, setAdded] = useState(0);
	const scaleRef = useRef<UIScale>();
	const swatch = SWATCHES.find((item) => item.id === swatchId) ?? SWATCHES[0];
	const marks = priceOf(variant, fit, qty);
	const count = lines.reduce((sum, line) => sum + line.qty, 0);
	const due = lines.reduce((sum, line) => sum + line.marks * line.qty, 0);

	useEffect(() => {
		if (added === 0) return;
		const scale = scaleRef.current;
		let tween: Tween | undefined;
		if (!reduced && scale !== undefined) {
			scale.Scale = 0.9;
			tween = TweenService.Create(scale, new TweenInfo(0.28, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale: 1 });
			tween.Play();
		}
		const thread = task.delay(1.1, () => setAdded(0));
		return () => {
			tween?.Cancel();
			task.cancel(thread);
		};
	}, [added, reduced]);

	const add = () => {
		const id = `${variant}-${fit}-${swatch.id}`;
		const title = `${labelOf(variant)} · ${swatch.label}`;
		const detail = FITS.find((item) => item.id === fit)?.label ?? "Carry";
		setLines((prev) => {
			const existing = prev.find((line) => line.id === id);
			if (existing !== undefined) {
				return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + qty } : line));
			}
			return [...prev, { id, title, detail, marks: priceOf(variant, fit, 1), qty }];
		});
		setAdded(added + 1);
	};

	const options = (
		<Stack direction="column" gap={1.5} sx={STACK}>
			<Typography text="Harbor light" variant="h3" sx={{ Size: new UDim2(1, 0, 0, 28) }} />
			<Typography text="Pick a finish, a body, and a size." color="textSecondary" sx={STACK} />
			<Typography text="Finish" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 20) }} />
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Wraps Padding={new UDim(0, 6)} SortOrder={Enum.SortOrder.LayoutOrder} />
				{SWATCHES.map((item) => (
					<SwatchButton key={item.id} swatch={item} selected={item.id === swatch.id} onPick={() => setSwatchId(item.id)} />
				))}
			</frame>
			<Typography text="Body" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 20) }} />
			<Stack direction="row" gap={1} sx={{ Size: new UDim2(1, 0, 0, 32), AutomaticSize: Enum.AutomaticSize.None }}>
				{VARIANTS.map((item) => (
					<Chip key={item.id} label={item.label} selected={variant === item.id} color="primary" onActivated={() => setVariant(item.id)} />
				))}
			</Stack>
			<Typography text="Size" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 20) }} />
			<Stack direction="row" gap={1} sx={{ Size: new UDim2(1, 0, 0, 32), AutomaticSize: Enum.AutomaticSize.None }}>
				{FITS.map((item) => (
					<Chip key={item.id} label={item.label} variant="outlined" selected={fit === item.id} onActivated={() => setFit(item.id)} />
				))}
			</Stack>
			<Typography text="Quantity" variant="subtitle2" sx={{ Size: new UDim2(1, 0, 0, 20) }} />
			<NumberInput value={qty} min={1} max={8} step={1} stepper onChange={setQty} width={new UDim(0, 140)} />
		</Stack>
	);

	const summary = (
		<Paper elevation="raised" sx={{ ...STACK, LayoutOrder: 2 }}>
			<Stack direction="column" gap={1} sx={STACK}>
				<Stack direction="row" gap={1} alignItems="center" sx={{ Size: new UDim2(1, 0, 0, 28), AutomaticSize: Enum.AutomaticSize.None }}>
					<Typography text="Order" variant="subtitle2" sx={{ Size: new UDim2(1, -40, 0, 24) }} />
					<frame Size={UDim2.fromOffset(28, 28)} BackgroundTransparency={1}>
						<uiscale ref={scaleRef} />
						<Badge count={count} invisible={count === 0} color="primary">
							<frame Size={UDim2.fromOffset(18, 18)} BackgroundTransparency={1} />
						</Badge>
					</frame>
				</Stack>
				<Divider />
				<Typography text={`${labelOf(variant)} · ${swatch.label}`} sx={STACK} />
				<Typography text={`${FITS.find((item) => item.id === fit)?.label ?? ""} · ${qty}`} variant="caption" color="textSecondary" sx={STACK} />
				<Typography text={`${marks} marks`} variant="h3" sx={{ Size: new UDim2(1, 0, 0, 28) }} />
				<Button text={added > 0 ? "Added" : "Add to cart"} variant="contained" color="primary" fullWidth onLeftClick={add} />
				{lines.size() === 0 ? (
					<Typography text="Nothing in the cart yet." color="textSecondary" sx={STACK} />
				) : (
					lines.map((line) => (
						<Stack key={line.id} direction="row" gap={1} alignItems="center" sx={{ Size: new UDim2(1, 0, 0, 32), AutomaticSize: Enum.AutomaticSize.None }}>
							<Typography text={`${line.qty} × ${line.title}`} variant="caption" sx={{ Size: new UDim2(1, -72, 0, 28) }} />
							<Button
								text="Remove"
								size="small"
								variant="text"
								onLeftClick={() => setLines((prev) => prev.filter((item) => item.id !== line.id))}
							/>
						</Stack>
					))
				)}
				<Divider />
				<Typography text={lines.size() === 0 ? "Due 0 marks" : `Due ${due} marks`} sx={STACK} />
				<Button text="Checkout" variant="outlined" fullWidth disabled={lines.size() === 0} />
			</Stack>
		</Paper>
	);

	const preview = (
		<Paper elevation="raised" sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
			<Preview color={swatch.color} fit={fit} variant={variant} tall={stacked ? 240 : math.max(280, view.height - bar - 48)} />
		</Paper>
	);

	return (
		<frame ref={setHost} Size={UDim2.fromScale(1, 1)} BackgroundColor3={theme.palette.surface.canvas} BorderSizePixel={0}>
			<AppBar title="Configurator" elevation="raised" />
			{stacked ? (
				<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar), Size: new UDim2(1, 0, 1, -bar), p: 2 }}>
					<Stack direction="column" gap={2} sx={STACK}>
						{preview}
						{options}
						{summary}
					</Stack>
				</ScrollView>
			) : (
				<frame Position={new UDim2(0, 0, 0, bar)} Size={new UDim2(1, 0, 1, -bar)} BackgroundTransparency={1}>
					<frame Size={new UDim2(1, -380, 1, 0)} BackgroundTransparency={1}>
						<uipadding PaddingTop={new UDim(0, 16)} PaddingLeft={new UDim(0, 16)} PaddingRight={new UDim(0, 8)} PaddingBottom={new UDim(0, 16)} />
						{preview}
					</frame>
					<ScrollView sx={{ Position: new UDim2(1, -380, 0, 0), Size: new UDim2(0, 380, 1, 0), p: 2 }}>
						<Stack direction="column" gap={2} sx={STACK}>
							{options}
							{summary}
						</Stack>
					</ScrollView>
				</frame>
			)}
		</frame>
	);
}

export default {
	title: "Scenarios/Item Configurator",
	description: "Finish, body, and size update a preview, then land in the order summary.",
	preview: { kind: "gui", width: 1120, height: 760 },
	tags: ["scenario"],
	render: () => <ItemConfigurator />,
};
