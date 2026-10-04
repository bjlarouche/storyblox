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

const kit = Uiblox as unknown as {
	RadioGroup: (props: RadioProps) => React.Element;
	Select: (props: RadioProps) => React.Element;
	Tabs: (props: RadioProps) => React.Element;
	SplitPane: (props: SplitProps) => React.Element;
	Tooltip: (props: TooltipProps) => React.Element;
};

export const RadioGroup = kit.RadioGroup;
export const Select = kit.Select;
export const Tabs = kit.Tabs;
export const SplitPane = kit.SplitPane;
export const Tooltip = kit.Tooltip;

export function useArg<T>(value: T) {
	const [current, setCurrent] = useState(value);
	useEffect(() => setCurrent(value), [value]);
	return [current, setCurrent] as const;
}
