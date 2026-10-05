import React from "@rbxts/react";
import { Divider } from "./kitBreadth";

interface Args {
	orientation: "Horizontal" | "Vertical";
}

export default {
	title: "Layout/Divider",
	args: { orientation: "Horizontal" },
	argTypes: {
		orientation: { type: "enum", options: ["Horizontal", "Vertical"] },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(0, 240, 0, 120)} BackgroundTransparency={1} BorderSizePixel={0}>
			<textlabel
				Size={new UDim2(1, 0, 0, 24)}
				BackgroundTransparency={1}
				Text="Above"
				TextColor3={Color3.fromRGB(220, 220, 220)}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
			<frame
				Size={
					args.orientation === "Vertical"
						? new UDim2(0, 4, 1, -48)
						: new UDim2(1, 0, 0, 8)
				}
				Position={new UDim2(0, 0, 0, 28)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				<Divider orientation={args.orientation} />
			</frame>
			<textlabel
				Size={new UDim2(1, 0, 0, 24)}
				Position={new UDim2(0, 0, 1, -24)}
				BackgroundTransparency={1}
				Text="Below"
				TextColor3={Color3.fromRGB(220, 220, 220)}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</frame>
	),
};
