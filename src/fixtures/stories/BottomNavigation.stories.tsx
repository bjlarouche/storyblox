import React from "@rbxts/react";
import { BottomNavigation, useArg } from "./kitBreadth";

const options = [
	{ label: "Home", value: "home" },
	{ label: "Search", value: "search" },
	{ label: "Profile", value: "profile" },
];

interface Args {
	value: string;
	disabled: boolean;
	showLabels: boolean;
}

function BottomNavigationStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<frame Size={new UDim2(1, 0, 0, 64)} BackgroundTransparency={1}>
			<BottomNavigation
				value={value}
				options={options}
				disabled={args.disabled}
				showLabels={args.showLabels}
				onChange={setValue}
			/>
		</frame>
	);
}

export default {
	title: "Components/Bottom Navigation",
	args: { value: "home", disabled: false, showLabels: true },
	argTypes: {
		value: { type: "enum", options: ["home", "search", "profile"] },
		disabled: { type: "boolean" },
		showLabels: { type: "boolean" },
	},
	render: (args: Args) => <BottomNavigationStory {...args} />,
};
