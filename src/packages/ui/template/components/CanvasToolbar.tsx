import React, { useRef, useState } from "@rbxts/react";
import { IconButton, Icons, Menu, Theme, useTheme, WriteableStyle } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { PREVIEW_PRESETS, presetMenuLabel, ZOOM_STEPS, zoomPresetId } from "packages/previewScale";

const REMOUNT_ICON = "rbxassetid://75431112013973" as Icons;
const INSPECTOR_ICON = "rbxassetid://94615499225611" as Icons;

const tip = Uiblox as unknown as {
	Tooltip: (props: { text: string; className?: WriteableStyle<Frame>; children?: React.ReactNode }) => React.Element;
};

function ink(theme: Theme, on: boolean) {
	return on ? theme.palette.text.primary : theme.palette.text.secondary;
}

function Rule(props: { id: string; order: number }) {
	const { theme } = useTheme();
	return (
		<frame
			key={props.id}
			LayoutOrder={props.order}
			Size={new UDim2(0, 1, 0, theme.spacing.calc(1.5))}
			BackgroundColor3={theme.palette.divider}
			BorderSizePixel={0}
		/>
	);
}

function Slot(props: {
	id: string;
	tip: string;
	order: number;
	active?: boolean;
	label?: string;
	onClick: () => void;
	anchorRef?: React.Ref<TextButton>;
	children?: React.ReactNode;
}) {
	const { theme } = useTheme();
	const on = props.active === true;
	const labeled = props.label !== undefined;
	const h = theme.spacing.calc(2.25);
	return (
		<tip.Tooltip
			text={props.tip}
			className={
				{
					AutomaticSize: labeled ? Enum.AutomaticSize.X : Enum.AutomaticSize.None,
					Size: new UDim2(0, labeled ? 0 : h, 0, h),
					LayoutOrder: props.order,
					BackgroundTransparency: 1,
				} as WriteableStyle<Frame>
			}
		>
			<textbutton
				key={props.id}
				ref={props.anchorRef}
				Text={props.label ?? ""}
				AutoButtonColor={false}
				AutomaticSize={labeled ? Enum.AutomaticSize.X : Enum.AutomaticSize.None}
				Size={labeled ? new UDim2(0, 0, 1, 0) : UDim2.fromScale(1, 1)}
				BackgroundColor3={theme.palette.action.selected}
				BackgroundTransparency={on ? 0 : 1}
				BorderSizePixel={0}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={ink(theme, on)}
				Event={{ MouseButton1Click: props.onClick }}
			>
				<uicorner key="Round" CornerRadius={new UDim(0, theme.shape.borderRadius)} />
				{labeled && (
					<uipadding
						key="Pad"
						PaddingLeft={new UDim(0, theme.spacing.calc(0.75))}
						PaddingRight={new UDim(0, theme.spacing.calc(0.75))}
					/>
				)}
				{props.children}
			</textbutton>
		</tip.Tooltip>
	);
}

function IconSlot(props: { id: string; tip: string; order: number; active?: boolean; icon: Icons; onClick?: () => void }) {
	const { theme } = useTheme();
	const on = props.active === true;
	const h = theme.spacing.calc(2.25);
	return (
		<tip.Tooltip
			text={props.tip}
			className={
				{
					Size: new UDim2(0, h, 0, h),
					AutomaticSize: Enum.AutomaticSize.None,
					LayoutOrder: props.order,
					BackgroundTransparency: 1,
				} as WriteableStyle<Frame>
			}
		>
			<frame
				key={props.id}
				Size={UDim2.fromScale(1, 1)}
				BackgroundColor3={theme.palette.action.selected}
				BackgroundTransparency={on ? 0 : 1}
				BorderSizePixel={0}
			>
				<uicorner key="Round" CornerRadius={new UDim(0, theme.shape.borderRadius)} />
				<IconButton
					id={props.id}
					icon={props.icon}
					tint={ink(theme, on)}
					onClick={props.onClick}
					className={
						{
							Size: UDim2.fromScale(1, 1),
							Position: UDim2.fromScale(0.5, 0.5),
							AnchorPoint: new Vector2(0.5, 0.5),
							BackgroundTransparency: 1,
						} as WriteableStyle<ImageButton>
					}
				/>
			</frame>
		</tip.Tooltip>
	);
}

function GridMark(props: { on: boolean }) {
	const { theme } = useTheme();
	const color = ink(theme, props.on);
	const cells = new Array<React.Element>();
	for (let i = 0; i < 4; i++) {
		cells.push(
			<frame
				key={`c${i}`}
				BackgroundColor3={color}
				BorderSizePixel={0}
				Size={new UDim2(0, 3, 0, 3)}
				Position={new UDim2(0, (i % 2) * 5, 0, math.floor(i / 2) * 5)}
			/>,
		);
	}
	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={new UDim2(0, 8, 0, 8)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
		>
			{cells}
		</frame>
	);
}

function OutlineMark(props: { on: boolean }) {
	const { theme } = useTheme();
	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={new UDim2(0, 12, 0, 8)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
		>
			<uistroke Color={ink(theme, props.on)} Thickness={1.5} />
			<uicorner CornerRadius={new UDim(0, 2)} />
		</frame>
	);
}

function OrientMark(props: { portrait: boolean }) {
	const { theme } = useTheme();
	const portrait = props.portrait;
	return (
		<frame
			AnchorPoint={new Vector2(0.5, 0.5)}
			Position={UDim2.fromScale(0.5, 0.5)}
			Size={new UDim2(0, portrait ? 8 : 14, 0, portrait ? 14 : 8)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
		>
			<uistroke Color={theme.palette.text.primary} Thickness={1.5} />
			<uicorner CornerRadius={new UDim(0, 2)} />
		</frame>
	);
}

interface CanvasToolbarProps {
	zoom: number;
	fit: boolean;
	orientation: "portrait" | "landscape";
	canOrient: boolean;
	grid: boolean;
	outline: boolean;
	measure: boolean;
	bgStep: number;
	density: "compact" | "comfortable";
	dark: boolean;
	inspectorOpen?: boolean;
	settingsOpen?: boolean;
	showInspector: boolean;
	showSettings: boolean;
	onZoom: (direction: number) => void;
	onZoomValue: (zoom: number) => void;
	onFit: () => void;
	sizeLabel: string;
	sizeActive: boolean;
	sizeSelected: string;
	storyOption?: string;
	onSizePick: (id: string) => void;
	onOrient: () => void;
	onGrid: () => void;
	onOutline: () => void;
	onMeasure: () => void;
	onBackground: () => void;
	onDensity?: () => void;
	onTheme: () => void;
	onInspector?: () => void;
	onSettings?: () => void;
	onRemount: () => void;
}

function CanvasToolbar(props: CanvasToolbarProps) {
	const { theme } = useTheme();
	const bg = props.bgStep === 0 ? "Bg" : props.bgStep === 1 ? "Paper" : "Canvas";
	const [zoomOpen, setZoomOpen] = useState(false);
	const [sizeOpen, setSizeOpen] = useState(false);
	const zoomRef = useRef<TextButton>();
	const sizeRef = useRef<TextButton>();
	const zoomItems = new Array<{ id: string; text: string; disabled?: boolean }>();
	for (const step of ZOOM_STEPS) {
		const id = `${math.round(step * 100)}`;
		zoomItems.push({ id, text: `${id}%` });
	}
	zoomItems.push({ id: "split", text: "—", disabled: true });
	zoomItems.push({ id: "fit", text: "Fit" });
	zoomItems.push({ id: "reset", text: "Reset to 100%" });
	const sizeItems = new Array<{ id: string; text: string; disabled?: boolean }>();
	sizeItems.push({ id: "responsive", text: "Responsive" });
	if (props.storyOption !== undefined) sizeItems.push({ id: "story", text: props.storyOption });
	sizeItems.push({ id: "split", text: "—", disabled: true });
	for (const name of PREVIEW_PRESETS) sizeItems.push({ id: name, text: presetMenuLabel(name) });
	return (
		<>
			<textbutton
				key="ZoomOut"
				Text="-"
				LayoutOrder={1}
				AutomaticSize={Enum.AutomaticSize.X}
				Size={new UDim2(0, 0, 0, theme.spacing.calc(2))}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.secondary}
				Event={{ MouseButton1Click: () => props.onZoom(-1) }}
			/>
			<textbutton
				key="Zoom"
				ref={zoomRef}
				Text={`${math.round(props.zoom * 100)}%`}
				LayoutOrder={2}
				Size={new UDim2(0, 40, 0, theme.spacing.calc(2))}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Center}
				AutoButtonColor={false}
				Event={{ MouseButton1Click: () => setZoomOpen((open) => !open) }}
			/>
			<textbutton
				key="ZoomIn"
				Text="+"
				LayoutOrder={3}
				AutomaticSize={Enum.AutomaticSize.X}
				Size={new UDim2(0, 0, 0, theme.spacing.calc(2))}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.secondary}
				Event={{ MouseButton1Click: () => props.onZoom(1) }}
			/>
			<Slot key="Fit" id="Fit" tip={props.fit ? "Fitted" : "Fit to canvas"} order={4} label="Fit" active={props.fit} onClick={props.onFit} />
			<Rule key="RuleZoom" id="RuleZoom" order={5} />
			<Slot
				key="Size"
				id="Size"
				tip="Canvas size"
				order={6}
				label={`${props.sizeLabel} ▾`}
				active={props.sizeActive}
				anchorRef={sizeRef}
				onClick={() => setSizeOpen((open) => !open)}
			/>
			{props.canOrient && (
				<Slot
					key="Orientation"
					id="Orientation"
					tip={props.orientation === "portrait" ? "Portrait" : "Landscape"}
					order={7}
					onClick={props.onOrient}
				>
					<OrientMark portrait={props.orientation === "portrait"} />
				</Slot>
			)}
			<Rule key="RuleViewport" id="RuleViewport" order={8} />
			<Slot key="Grid" id="Grid" tip="Grid" order={9} active={props.grid} onClick={props.onGrid}>
				<GridMark on={props.grid} />
			</Slot>
			<Slot key="Outline" id="Outline" tip="Outline" order={10} active={props.outline} onClick={props.onOutline}>
				<OutlineMark on={props.outline} />
			</Slot>
			<Slot key="Measure" id="Measure" tip="Measure" order={11} label="Measure" active={props.measure} onClick={props.onMeasure} />
			<Rule key="RuleOverlay" id="RuleOverlay" order={12} />
			<IconSlot
				key="Theme"
				id="Theme"
				tip={props.dark ? "Light theme" : "Dark theme"}
				order={13}
				icon={props.dark ? Icons.DarkTheme : Icons.LightTheme}
				onClick={props.onTheme}
			/>
			<Slot key="Background" id="Background" tip="Background" order={14} label={bg} active={props.bgStep !== 0} onClick={props.onBackground} />
			<Slot
				key="Density"
				id="Density"
				tip="Density"
				order={15}
				label={props.density === "compact" ? "Compact" : "Comfort"}
				onClick={() => props.onDensity?.()}
			/>
			<Rule key="RuleTools" id="RuleTools" order={39} />
			<IconSlot key="Remount" id="Remount" tip="Reload" order={41} icon={REMOUNT_ICON} onClick={props.onRemount} />
			{props.showInspector && (
				<IconSlot
					key="Inspector"
					id="Inspector"
					tip={props.inspectorOpen ? "Hide inspector" : "Show inspector"}
					order={42}
					active={props.inspectorOpen === true}
					icon={INSPECTOR_ICON}
					onClick={props.onInspector}
				/>
			)}
			{props.showSettings && (
				<IconSlot
					key="Settings"
					id="Settings"
					tip={props.settingsOpen ? "Close settings" : "Settings"}
					order={43}
					active={props.settingsOpen === true}
					icon={Icons.Settings}
					onClick={props.onSettings}
				/>
			)}
			<Menu
				anchor={zoomRef.current}
				open={zoomOpen}
				dense
				items={zoomItems}
				selected={zoomPresetId(props.zoom)}
				onSelect={(id) => {
					if (id === "fit") props.onFit();
					else if (id === "reset") props.onZoomValue(1);
					else {
						const value = tonumber(id);
						if (value !== undefined) props.onZoomValue(value / 100);
					}
				}}
				onClose={() => setZoomOpen(false)}
			/>
			<Menu
				anchor={sizeRef.current}
				open={sizeOpen}
				dense
				items={sizeItems}
				selected={props.sizeSelected}
				onSelect={props.onSizePick}
				onClose={() => setSizeOpen(false)}
			/>
		</>
	);
}

export default CanvasToolbar;
