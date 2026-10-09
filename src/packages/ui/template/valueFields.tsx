import React from "@rbxts/react";
import { controlMetrics, Input, Theme } from "@rbxts/uiblox";
import * as Uiblox from "@rbxts/uiblox";
import { commitNumberText, enumItems } from "./storyArgs";
import {
	axesValue,
	dateTimeValue,
	dockWidgetValue,
	facesValue,
	pathWaypointValue,
	region3Bounds,
	region3FromBounds,
	region3int16Value,
	tweenInfoValue,
	vector2int16Value,
	vector3int16Value,
} from "../../argCodec";

const AXIS_NAMES = ["X", "Y", "Z"];
const FACE_NAMES = ["Top", "Bottom", "Left", "Right", "Front", "Back"];

const kit = Uiblox as unknown as {
	Checkbox: (props: { value: boolean; label?: string; disabled?: boolean; onChange: (value: boolean) => void }) => React.Element;
	Select: (props: {
		value: string;
		options: { label: string; value: string }[];
		onChange: (value: string) => void;
		className?: { Size?: UDim2 };
		disabled?: boolean;
	}) => React.Element;
	VectorEditor: (props: { value: Vector2 | Vector3; onChange: (value: Vector2 | Vector3) => void; disabled?: boolean }) => React.Element;
};

function hasVectorEditor() {
	return typeOf((Uiblox as unknown as { VectorEditor?: unknown }).VectorEditor) === "function";
}

export function valueFieldKind(kind?: string) {
	return (
		kind === "region3" ||
		kind === "region3int16" ||
		kind === "vector2int16" ||
		kind === "vector3int16" ||
		kind === "axes" ||
		kind === "faces" ||
		kind === "dateTime" ||
		kind === "tweenInfo" ||
		kind === "dockWidget" ||
		kind === "pathWaypoint"
	);
}

function column(key: string, gap: UDim, children: Array<React.Element>) {
	return (
		<frame key={key} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={gap} SortOrder={Enum.SortOrder.LayoutOrder} />
			<>
				{children}
			</>
		</frame>
	);
}

function caption(text: string, order: number, theme: Theme) {
	return (
		<textlabel
			key={`Label-${text}`}
			Text={text}
			LayoutOrder={order}
			Size={new UDim2(1, 0, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Font={theme.typography.fontFamilies.default}
			TextSize={theme.typography.fontSizes.caption}
			TextColor3={theme.palette.text.secondary}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	);
}

function numberBox(label: string, order: number, value: number, disabled: boolean, integer: boolean, theme: Theme, onCommit: (value: number) => void, onFault: () => void) {
	const commit = (text: string) => {
		const incoming = commitNumberText(text);
		if (incoming === undefined || (integer && incoming % 1 !== 0)) {
			onFault();
			return;
		}
		onCommit(incoming);
	};
	return (
		<frame key={label} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption(label, 1, theme)}
			<Input
				key="Value"
				{...({
					variant: "standard",
					width: new UDim(1, 0),
					text: tostring(value),
					disabled,
					onInput: commit,
					onTextChanged: commit,
				} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
			/>
		</frame>
	);
}

function enumSelect(label: string, order: number, enumType: string, value: string, disabled: boolean, theme: Theme, fill: { Size: UDim2 }, onCommit: (value: string) => void) {
	const options = new Array<{ label: string; value: string }>();
	for (const item of enumItems(enumType)) options.push({ label: item.Name, value: item.Name });
	return (
		<frame key={label} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption(label, 1, theme)}
			<kit.Select key="Value" value={value} options={options} className={fill} disabled={disabled} onChange={onCommit} />
		</frame>
	);
}

function textBox(label: string, order: number, value: string, disabled: boolean, theme: Theme, onCommit: (value: string) => void) {
	return (
		<frame key={label} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption(label, 1, theme)}
			<Input
				key="Value"
				{...({
					variant: "standard",
					width: new UDim(1, 0),
					text: value,
					disabled,
					onInput: onCommit,
					onTextChanged: onCommit,
				} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
			/>
		</frame>
	);
}

function flagsOf(value: unknown, names: Array<string>) {
	const flags: { [key: string]: boolean } = {};
	const record = typeOf(value) === "table" || typeOf(value) === "Axes" || typeOf(value) === "Faces" ? (value as { [key: string]: boolean }) : {};
	for (const name of names) flags[name] = record[name] === true;
	return flags;
}

function flagBoxes(
	names: Array<string>,
	flags: { [key: string]: boolean },
	disabled: boolean,
	onToggle: (name: string, on: boolean) => void,
) {
	const rows = new Array<React.Element>();
	for (const name of names) {
		rows.push(
			<kit.Checkbox
				key={name}
				value={flags[name] === true}
				label={name}
				disabled={disabled}
				onChange={(on) => onToggle(name, on)}
			/>,
		);
	}
	return rows;
}

function flagGroup(
	title: string,
	order: number,
	names: Array<string>,
	flags: { [key: string]: boolean },
	disabled: boolean,
	theme: Theme,
	gap: UDim,
	onToggle: (name: string, on: boolean) => void,
) {
	return (
		<frame key={title} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, theme.padding.calc(0.5))} SortOrder={Enum.SortOrder.LayoutOrder} />
			{caption(title, 1, theme)}
			<frame key="Flags" LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={gap} SortOrder={Enum.SortOrder.LayoutOrder} />
				<>
					{flagBoxes(names, flags, disabled, onToggle)}
				</>
			</frame>
		</frame>
	);
}

function pairRow(order: number, left: React.Element, right: React.Element, theme: Theme) {
	const gapPx = theme.padding.calc(1);
	return (
		<frame key={`Pair-${order}`} LayoutOrder={order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, gapPx)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame key="L" LayoutOrder={1} Size={new UDim2(0.5, -gapPx / 2, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				{left}
			</frame>
			<frame key="R" LayoutOrder={2} Size={new UDim2(0.5, -gapPx / 2, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				{right}
			</frame>
		</frame>
	);
}

export function valueFields(props: {
	theme: Theme;
	kind: string;
	value: unknown;
	disabled: boolean;
	onCommit: (value: unknown) => void;
	onFault: (reason: string) => void;
}): React.Element | undefined {
	const { theme, kind, value, disabled, onCommit, onFault } = props;
	const gap = new UDim(0, theme.padding.calc(1));
	const fill = { Size: new UDim2(1, 0, 0, controlMetrics(theme.density).height) };
	const fault = () => onFault(kind);
	if ((kind === "region3" || kind === "region3int16" || kind === "vector2int16" || kind === "vector3int16" || kind === "pathWaypoint") && !hasVectorEditor()) {
		return undefined;
	}
	if (kind === "region3") {
		const bounds = typeOf(value) === "Region3" ? region3Bounds(value as Region3) : undefined;
		const min = bounds?.min ?? new Vector3();
		const max = bounds?.max ?? new Vector3();
		const commit = (nextMin: Vector3, nextMax: Vector3) => {
			const region = region3FromBounds(nextMin, nextMax);
			if (region === undefined) fault();
			else onCommit(region);
		};
		return column("region3", gap, [
			caption("Min", 1, theme),
			<kit.VectorEditor key="Min" value={min} disabled={disabled} onChange={(incoming) => commit(incoming as Vector3, max)} />,
			caption("Max", 3, theme),
			<kit.VectorEditor key="Max" value={max} disabled={disabled} onChange={(incoming) => commit(min, incoming as Vector3)} />,
		]);
	}
	if (kind === "vector2int16") {
		const current = typeOf(value) === "Vector2int16" ? (value as Vector2int16) : undefined;
		return (
			<kit.VectorEditor
				key="vector2int16"
				value={new Vector2(current?.X ?? 0, current?.Y ?? 0)}
				disabled={disabled}
				onChange={(incoming) => {
					const vector = incoming as Vector2;
					const built = vector2int16Value(math.round(vector.X), math.round(vector.Y));
					if (built === undefined) fault();
					else onCommit(built);
				}}
			/>
		);
	}
	if (kind === "vector3int16") {
		const current = typeOf(value) === "Vector3int16" ? (value as Vector3int16) : undefined;
		return (
			<kit.VectorEditor
				key="vector3int16"
				value={new Vector3(current?.X ?? 0, current?.Y ?? 0, current?.Z ?? 0)}
				disabled={disabled}
				onChange={(incoming) => {
					const vector = incoming as Vector3;
					const built = vector3int16Value(math.round(vector.X), math.round(vector.Y), math.round(vector.Z));
					if (built === undefined) fault();
					else onCommit(built);
				}}
			/>
		);
	}
	if (kind === "region3int16") {
		const region = typeOf(value) === "Region3int16" ? (value as Region3int16) : undefined;
		const min = region?.Min ?? new Vector3int16();
		const max = region?.Max ?? new Vector3int16();
		const commit = (nextMin: Vector3, nextMax: Vector3) => {
			const minInt = vector3int16Value(math.round(nextMin.X), math.round(nextMin.Y), math.round(nextMin.Z));
			const maxInt = vector3int16Value(math.round(nextMax.X), math.round(nextMax.Y), math.round(nextMax.Z));
			const incoming = minInt !== undefined && maxInt !== undefined ? region3int16Value(minInt, maxInt) : undefined;
			if (incoming === undefined) fault();
			else onCommit(incoming);
		};
		return column("region3int16", gap, [
			caption("Min", 1, theme),
			<kit.VectorEditor key="Min" value={new Vector3(min.X, min.Y, min.Z)} disabled={disabled} onChange={(incoming) => commit(incoming as Vector3, new Vector3(max.X, max.Y, max.Z))} />,
			caption("Max", 3, theme),
			<kit.VectorEditor key="Max" value={new Vector3(max.X, max.Y, max.Z)} disabled={disabled} onChange={(incoming) => commit(new Vector3(min.X, min.Y, min.Z), incoming as Vector3)} />,
		]);
	}
	if (kind === "axes" || kind === "faces") {
		const names = kind === "axes" ? [...AXIS_NAMES, ...FACE_NAMES] : FACE_NAMES;
		const flags = flagsOf(value, names);
		const onToggle = (name: string, on: boolean) => {
			const incomingFlags: { [key: string]: boolean } = {};
			for (const flag of names) incomingFlags[flag] = flags[flag] === true;
			incomingFlags[name] = on;
			const incoming = kind === "axes" ? axesValue(incomingFlags) : facesValue(incomingFlags);
			if (incoming === undefined) fault();
			else onCommit(incoming);
		};
		if (kind === "faces") {
			return column(kind, gap, flagBoxes(names, flags, disabled, onToggle));
		}
		return column(kind, gap, [
			flagGroup("Axes", 1, AXIS_NAMES, flags, disabled, theme, gap, onToggle),
			flagGroup("Faces", 2, FACE_NAMES, flags, disabled, theme, gap, onToggle),
		]);
	}
	if (kind === "dateTime") {
		const unix = typeOf(value) === "DateTime" ? (value as DateTime).UnixTimestamp : 0;
		const iso = typeOf(value) === "DateTime" ? (value as DateTime).ToIsoDate() : "";
		return column("dateTime", gap, [
			numberBox("Unix", 1, unix, disabled, true, theme, (incoming) => {
				const date = dateTimeValue(incoming);
				if (date === undefined) fault();
				else onCommit(date);
			}, fault),
			caption(iso.size() > 0 ? iso : "UTC seconds", 2, theme),
		]);
	}
	if (kind === "tweenInfo") {
		const info = typeOf(value) === "TweenInfo" ? (value as TweenInfo) : undefined;
		const time = info?.Time ?? 1;
		const style = info?.EasingStyle.Name ?? "Linear";
		const direction = info?.EasingDirection.Name ?? "Out";
		const repeatCount = info?.RepeatCount ?? 0;
		const reverses = info?.Reverses === true;
		const delayTime = info?.DelayTime ?? 0;
		const commit = (patch: { time?: number; style?: string; direction?: string; repeatCount?: number; reverses?: boolean; delayTime?: number }) => {
			const incoming = tweenInfoValue(
				patch.time ?? time,
				patch.style ?? style,
				patch.direction ?? direction,
				patch.repeatCount ?? repeatCount,
				patch.reverses ?? reverses,
				patch.delayTime ?? delayTime,
			);
			if (incoming === undefined) fault();
			else onCommit(incoming);
		};
		return column("tweenInfo", gap, [
			pairRow(
				1,
				numberBox("Time", 1, time, disabled, false, theme, (incoming) => commit({ time: incoming }), fault),
				numberBox("Delay", 1, delayTime, disabled, false, theme, (incoming) => commit({ delayTime: incoming }), fault),
				theme,
			),
			enumSelect("EasingStyle", 2, "EasingStyle", style, disabled, theme, fill, (incoming) => commit({ style: incoming })),
			enumSelect("EasingDirection", 3, "EasingDirection", direction, disabled, theme, fill, (incoming) => commit({ direction: incoming })),
			pairRow(
				4,
				numberBox("Repeat", 1, repeatCount, disabled, true, theme, (incoming) => commit({ repeatCount: incoming }), fault),
				<frame key="ReversesWrap" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					{caption(" ", 1, theme)}
					<kit.Checkbox key="Reverses" value={reverses} label="Reverses" disabled={disabled} onChange={(on) => commit({ reverses: on })} />
				</frame>,
				theme,
			),
		]);
	}
	if (kind === "dockWidget") {
		const info = typeOf(value) === "DockWidgetPluginGuiInfo" ? (value as DockWidgetPluginGuiInfo) : undefined;
		const dock = info?.InitialDockState.Name ?? "Right";
		const enabled = info?.InitialEnabled === true;
		const overrideRestore = info?.InitialEnabledShouldOverrideRestore === true;
		const floatX = info?.FloatingXSize ?? 200;
		const floatY = info?.FloatingYSize ?? 200;
		const minWidth = info?.MinWidth ?? 100;
		const minHeight = info?.MinHeight ?? 80;
		const commit = (patch: {
			dock?: string;
			enabled?: boolean;
			overrideRestore?: boolean;
			floatX?: number;
			floatY?: number;
			minWidth?: number;
			minHeight?: number;
		}) => {
			const incoming = dockWidgetValue(
				patch.dock ?? dock,
				patch.enabled ?? enabled,
				patch.overrideRestore ?? overrideRestore,
				patch.floatX ?? floatX,
				patch.floatY ?? floatY,
				patch.minWidth ?? minWidth,
				patch.minHeight ?? minHeight,
			);
			if (incoming === undefined) fault();
			else onCommit(incoming);
		};
		return column("dockWidget", gap, [
			enumSelect("Dock", 1, "InitialDockState", dock, disabled, theme, fill, (incoming) => commit({ dock: incoming })),
			<kit.Checkbox key="Enabled" value={enabled} label="Enabled" disabled={disabled} onChange={(on) => commit({ enabled: on })} />,
			<kit.Checkbox key="Override" value={overrideRestore} label="Override restore" disabled={disabled} onChange={(on) => commit({ overrideRestore: on })} />,
			pairRow(
				4,
				numberBox("Float X", 1, floatX, disabled, false, theme, (incoming) => commit({ floatX: incoming }), fault),
				numberBox("Float Y", 1, floatY, disabled, false, theme, (incoming) => commit({ floatY: incoming }), fault),
				theme,
			),
			pairRow(
				5,
				numberBox("Min width", 1, minWidth, disabled, false, theme, (incoming) => commit({ minWidth: incoming }), fault),
				numberBox("Min height", 1, minHeight, disabled, false, theme, (incoming) => commit({ minHeight: incoming }), fault),
				theme,
			),
		]);
	}
	if (kind === "pathWaypoint") {
		const point = typeOf(value) === "PathWaypoint" ? (value as PathWaypoint) : undefined;
		const position = point?.Position ?? new Vector3();
		const action = point?.Action.Name ?? "Walk";
		const label = point?.Label ?? "";
		const commit = (patch: { position?: Vector3; action?: string; label?: string }) => {
			const incoming = pathWaypointValue(patch.position ?? position, patch.action ?? action, patch.label ?? label);
			if (incoming === undefined) fault();
			else onCommit(incoming);
		};
		return column("pathWaypoint", gap, [
			caption("Position", 1, theme),
			<kit.VectorEditor key="Position" value={position} disabled={disabled} onChange={(incoming) => commit({ position: incoming as Vector3 })} />,
			enumSelect("Action", 3, "PathWaypointAction", action, disabled, theme, fill, (incoming) => commit({ action: incoming })),
			textBox("Label", 4, label, disabled, theme, (incoming) => commit({ label: incoming })),
		]);
	}
	return undefined;
}
