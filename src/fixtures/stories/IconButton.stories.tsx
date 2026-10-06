import React from "@rbxts/react";
import { IconButton, Icons, useTheme } from "@rbxts/uiblox";

interface Args {
	selected: boolean;
	disabled: boolean;
	loading: boolean;
	size: "sm" | "md" | "lg";
}

function IconButtonStory(args: Args) {
	const { theme } = useTheme();
	return (
		<IconButton
			icon={Icons.Settings}
			tint={theme.palette.text.primary}
			size={args.size}
			selected={args.selected}
			disabled={args.disabled}
			loading={args.loading}
		/>
	);
}

export default {
	title: "Components/Icon Button",
	args: { selected: true, disabled: false, loading: false, size: "md" },
	argTypes: {
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		loading: { type: "boolean" },
		size: { type: "enum", options: ["sm", "md", "lg"] },
	},
	render: (args: Args) => <IconButtonStory {...args} />,
};
