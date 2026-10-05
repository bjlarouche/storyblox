import React, { useEffect, useState } from "@rbxts/react";
import * as Uiblox from "@rbxts/uiblox";

export function useArg<T>(value: T) {
	const [current, setCurrent] = useState(value);
	useEffect(() => setCurrent(value), [value]);
	return [current, setCurrent] as const;
}

type AnyComp = (props: Record<string, unknown>) => React.Element;

const kit = Uiblox as unknown as Record<string, AnyComp>;

export const Dialog = kit.Dialog;
export const Paper = kit.Paper;
export const Menu = kit.Menu;
export const ListItem = kit.ListItem;
export const Card = kit.Card;
export const Chip = kit.Chip;
export const Badge = kit.Badge;
export const Avatar = kit.Avatar;
export const Drawer = kit.Drawer;
export const Breadcrumbs = kit.Breadcrumbs;
export const Pagination = kit.Pagination;
export const Stepper = kit.Stepper;
export const Accordion = kit.Accordion;
export const Snackbar = kit.Snackbar;
export const Table = kit.Table;
export const Autocomplete = kit.Autocomplete;
export const BrickColorPicker = kit.BrickColorPicker;
export const CFrameEditor = kit.CFrameEditor;
export const EnumPicker = kit.EnumPicker;
export const NumberRangeEditor = kit.NumberRangeEditor;
export const RectEditor = kit.RectEditor;
export const AssetField = kit.AssetField;
export const GradientEditor = kit.GradientEditor;
export const RayEditor = kit.RayEditor;
export const PhysicalPropertiesEditor = kit.PhysicalPropertiesEditor;
