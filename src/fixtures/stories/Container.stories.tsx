import React from "@rbxts/react";
import { Container } from "./kitBreadth";

interface Args {
	maxWidth: "xs" | "sm" | "md" | "lg" | "xl" | "false";
	disableGutters: boolean;
}

export default {
	title: "Layout/Container",
	args: { maxWidth: "sm", disableGutters: false },
	argTypes: {
		maxWidth: { type: "enum", options: ["xs", "sm", "md", "lg", "xl", "false"] },
		disableGutters: { type: "boolean" },
	},
	render: (args: Args) => (
		<Container
			maxWidth={args.maxWidth === "false" ? false : args.maxWidth}
			disableGutters={args.disableGutters}
		>
			<frame
				Size={new UDim2(1, 0, 0, 80)}
				BackgroundColor3={Color3.fromRGB(70, 90, 120)}
				BorderSizePixel={0}
			>
				<textlabel
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Text="Container body"
					TextColor3={Color3.fromRGB(240, 240, 240)}
				/>
			</frame>
		</Container>
	),
};
