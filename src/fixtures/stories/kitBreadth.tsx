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
export const Fab = kit.Fab;
export const AppBar = kit.AppBar;
export const Alert = kit.Alert;
export const BottomNavigation = kit.BottomNavigation;
export const ToggleButton = kit.ToggleButton;
export const ToggleButtonGroup = kit.ToggleButtonGroup;
export const Link = kit.Link;
export const Markdown = kit.Markdown;
export const MarkdownEditor = kit.MarkdownEditor;
export const Rating = kit.Rating;
export const Stack = kit.Stack;
export const ScrollView = kit.ScrollView;
export const DateRangePicker = kit.DateRangePicker;
export const FlexItem = kit.FlexItem;
export const Box = kit.Box;
export const Container = kit.Container;
export const Divider = kit.Divider;
export const Backdrop = kit.Backdrop;
export const Icon = kit.Icon;
export const Grid = kit.Grid;
export const List = kit.List;
export const ImageList = kit.ImageList;
export const SpeedDial = kit.SpeedDial;
export const FormLabel = kit.FormLabel;
export const FormHelperText = kit.FormHelperText;
export const BrickColorPicker = kit.BrickColorPicker;
export const ColorPicker = kit.ColorPicker;
export const CFrameEditor = kit.CFrameEditor;
export const EnumPicker = kit.EnumPicker;
export const NumberRangeEditor = kit.NumberRangeEditor;
export const RectEditor = kit.RectEditor;
export const AssetField = kit.AssetField;
export const GradientEditor = kit.GradientEditor;
export const RayEditor = kit.RayEditor;
export const PhysicalPropertiesEditor = kit.PhysicalPropertiesEditor;
