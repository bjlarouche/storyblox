import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Container } from "./kitBreadth";

interface Args {
	maxWidth: "xs" | "sm" | "md" | "lg" | "xl" | "false";
	disableGutters: boolean;
}

function ContainerStory(args: Args) {
	const { theme } = useTheme();
	return (
		<Container maxWidth={args.maxWidth === "false" ? false : args.maxWidth} disableGutters={args.disableGutters}>
			<frame Size={new UDim2(1, 0, 0, 80)} BackgroundColor3={theme.palette.primary.main} BorderSizePixel={0}>
				<textlabel
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Text="Container body"
					TextColor3={theme.palette.primary.on}
				/>
			</frame>
		</Container>
	);
}

export default {
	title: "Layout/Container",
	args: { maxWidth: "sm", disableGutters: false },
	argTypes: {
		maxWidth: { type: "enum", options: ["xs", "sm", "md", "lg", "xl", "false"] },
		disableGutters: { type: "boolean" },
	},
	render: (args: Args) => <ContainerStory {...args} />,
};
