import React from "@rbxts/react";
import { Tabs, useArg } from "./kit";

const options = [
	{ label: "Left", value: "left" },
	{ label: "Center", value: "center" },
	{ label: "Right", value: "right" },
];

const overflow = [
	{ label: "Overview", value: "overview" },
	{ label: "Inventory", value: "inventory" },
	{ label: "Loadout", value: "loadout" },
	{ label: "Social", value: "social" },
	{ label: "History", value: "history" },
	{ label: "Settings", value: "settings" },
];

interface Args {
	value: string;
	orientation: "horizontal" | "vertical";
	centered: boolean;
	disabled: boolean;
}

function TabsStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	const vertical = args.orientation === "vertical";
	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 12)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding PaddingTop={new UDim(0, 8)} PaddingLeft={new UDim(0, 8)} PaddingRight={new UDim(0, 8)} />
			<frame
				LayoutOrder={0}
				Size={vertical ? new UDim2(0, 160, 0, 140) : new UDim2(1, 0, 0, 40)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				<Tabs
					value={value}
					options={options}
					orientation={args.orientation}
					centered={args.centered}
					disabled={args.disabled}
					onChange={setValue}
				/>
			</frame>
			<frame LayoutOrder={1} Size={new UDim2(0, 220, 0, 40)} BackgroundTransparency={1} BorderSizePixel={0}>
				<Tabs value="overview" options={overflow} onChange={() => {}} />
			</frame>
			<frame LayoutOrder={4} Size={new UDim2(0, 220, 0, 40)} BackgroundTransparency={1} BorderSizePixel={0}>
				<Tabs
					value="long"
					options={[
						{ label: "A longer tab label that stays inside the item", value: "long" },
						{ label: "Next", value: "next" },
					]}
					onChange={() => {}}
				/>
			</frame>
			<frame LayoutOrder={2} Size={new UDim2(0, 148, 0, 168)} BackgroundTransparency={1} BorderSizePixel={0}>
				<Tabs value="inventory" options={overflow} orientation="vertical" onChange={() => {}} />
			</frame>
			<frame LayoutOrder={3} Size={new UDim2(1, 0, 0, 40)} BackgroundTransparency={1} BorderSizePixel={0}>
				<Tabs value="left" options={options} disabled centered onChange={() => {}} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Tabs",
	preview: { kind: "gui", width: 360, height: 420 },
	args: { value: "left", orientation: "horizontal", centered: false, disabled: false },
	argTypes: {
		value: { type: "enum", options: ["left", "center", "right"], control: "radio" },
		orientation: { type: "enum", options: ["horizontal", "vertical"] },
		centered: { type: "boolean" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <TabsStory {...args} />,
};
