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
}

function BottomNavigationStory(args: Args) {
	const [value, setValue] = useArg(args.value);
	return (
		<frame Size={new UDim2(1, 0, 0, 64)} BackgroundTransparency={1}>
			<BottomNavigation value={value} options={options} disabled={args.disabled} onChange={setValue} />
		</frame>
	);
}

export default {
	title: "Components/Bottom Navigation",
	args: { value: "home", disabled: false },
	argTypes: {
		value: { type: "enum", options: ["home", "search", "profile"] },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <BottomNavigationStory {...args} />,
};
