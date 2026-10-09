import React from "@rbxts/react";
import { Stepper } from "./kitBreadth";

interface Args {
	activeStep: number;
	orientation: "horizontal" | "vertical";
}

const LONG = "A longer shipping step that wraps inside the width";

export default {
	title: "Components/Stepper",
	preview: { kind: "gui", width: 280, height: 180 },
	args: { activeStep: 1, orientation: "horizontal" },
	argTypes: {
		activeStep: { type: "number" },
		orientation: { type: "enum", options: ["horizontal", "vertical"] },
	},
	render: (args: Args) => (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 240, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 12)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<frame LayoutOrder={1} AutomaticSize={Enum.AutomaticSize.XY} Size={UDim2.fromScale(0, 0)} BackgroundTransparency={1}>
				<Stepper steps={["Details", "Shipping", "Pay"]} activeStep={args.activeStep} orientation={args.orientation} />
			</frame>
			<frame LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<Stepper steps={["Details", LONG, "Pay"]} activeStep={1} orientation="vertical" />
			</frame>
		</frame>
	),
};
