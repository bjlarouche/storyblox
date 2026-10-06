import React, { useEffect, useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";

export interface Choice {
	label: string;
	value: string;
}

interface RadioProps {
	value: string;
	options: Choice[];
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	row?: boolean;
	size?: "small" | "medium" | "large";
	orientation?: "horizontal" | "vertical";
	centered?: boolean;
	searchable?: boolean;
	defaultOpen?: boolean;
	defaultQuery?: string;
}

interface CheckboxProps {
	value: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	mixed?: boolean;
	label?: string;
	size?: "small" | "medium" | "large";
}

interface SwitchProps {
	value: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	label?: string;
	size?: "small" | "medium" | "large";
	color?: "primary" | "accent";
}

interface SliderProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step?: number;
	disabled?: boolean;
	marks?: boolean | ReadonlyArray<number>;
	color?: "primary" | "accent";
	size?: "small" | "medium" | "large";
}

interface SplitProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	vertical?: boolean;
	first?: React.ReactNode;
	second?: React.ReactNode;
}

interface TooltipProps {
	text: string;
	delay?: number;
	children?: React.ReactNode;
}

interface SkeletonProps {
	variant?: "text" | "rectangular" | "rounded" | "circular";
	width?: number;
	height?: number;
	lines?: number;
	gap?: number;
	animation?: "pulse" | "shimmer" | false;
	reducedMotion?: boolean;
}

interface CircularProgressProps {
	value?: number;
	size?: number;
	thickness?: number;
	color?: Color3;
	disabled?: boolean;
	reducedMotion?: boolean;
}

interface LinearProgressProps {
	value?: number;
	indeterminate?: boolean;
	disabled?: boolean;
	reducedMotion?: boolean;
	color?: Color3;
	className?: { Size: UDim2 };
}

interface ButtonProps {
	id?: string;
	text?: string;
	variant?: "contained" | "outlined" | "text";
	size?: "small" | "medium" | "large";
	loading?: boolean;
	loadingLabel?: string;
	loadingPosition?: "start" | "center" | "end";
	reducedMotion?: boolean;
	disabled?: boolean;
	onLeftClick?: () => void;
}

interface IconButtonProps {
	icon: string;
	tint: Color3;
	size?: string;
	loading?: boolean;
	reducedMotion?: boolean;
	disabled?: boolean;
	onClick?: () => void;
}

const kit = Uiblox as unknown as {
	Checkbox: (props: CheckboxProps) => React.Element;
	Switch: (props: SwitchProps) => React.Element;
	Slider: (props: SliderProps) => React.Element;
	RadioGroup: (props: RadioProps) => React.Element;
	Select: (props: RadioProps) => React.Element;
	Tabs: (props: RadioProps) => React.Element;
	SplitPane: (props: SplitProps) => React.Element;
	Tooltip: (props: TooltipProps) => React.Element;
	Skeleton: (props: SkeletonProps) => React.Element;
	CircularProgress: (props: CircularProgressProps) => React.Element;
	LinearProgress: (props: LinearProgressProps) => React.Element;
	Button: (props: ButtonProps) => React.Element;
	IconButton: (props: IconButtonProps) => React.Element;
};

export const Checkbox = kit.Checkbox;
export const Switch = kit.Switch;
export const Slider = kit.Slider;
export const RadioGroup = kit.RadioGroup;
export const Select = kit.Select;
export const Tabs = kit.Tabs;
export const SplitPane = kit.SplitPane;
export const Tooltip = kit.Tooltip;
export const Skeleton = kit.Skeleton;
export const CircularProgress = kit.CircularProgress;
export const LinearProgress = kit.LinearProgress;
export const Button = kit.Button;
export const IconButton = kit.IconButton;

export function useArg<T>(value: T) {
	const [current, setCurrent] = useState(value);
	useEffect(() => setCurrent(value), [value]);
	return [current, setCurrent] as const;
}
