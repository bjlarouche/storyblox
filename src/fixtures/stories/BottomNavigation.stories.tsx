import React from "@rbxts/react";
import { BottomNavigation, useArg } from "./kitBreadth";

const options = [
	{ label: "Home", value: "home" },
	{ label: "Search", value: "search" },
	{ label: "Profile", value: "profile" },
];

const longOptions = [
	{ label: "Home", value: "home" },
	{ label: "A longer profile label", value: "profile" },
	{ label: "Search", value: "search" },
];

interface Args {
	value: string;
	disabled: boolean;
	showLabels: boolean;
}

function BottomNavigationStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 320, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={1} Size={new UDim2(1, 0, 0, 56)} BackgroundTransparency={1}>
				<BottomNavigation value={value} options={options} disabled={args.disabled} showLabels={args.showLabels} onChange={setValue} />
			</frame>
			<frame LayoutOrder={2} Size={new UDim2(1, 0, 0, 56)} BackgroundTransparency={1}>
				<BottomNavigation value="profile" options={longOptions} onChange={() => {}} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/Bottom Navigation",
	preview: { kind: "gui", width: 360, height: 140 },
	args: { value: "home", disabled: false, showLabels: true },
	argTypes: {
		value: { type: "enum", options: ["home", "search", "profile"] },
		disabled: { type: "boolean" },
		showLabels: { type: "boolean" },
	},
	render: (args: Args) => <BottomNavigationStory {...args} />,
};
