import React from "@rbxts/react";
import { Stepper } from "./kitBreadth";

interface Args {
	activeStep: number;
	orientation: "horizontal" | "vertical";
}

export default {
	title: "Components/Stepper",
	args: { activeStep: 1, orientation: "horizontal" },
	argTypes: {
		activeStep: { type: "number" },
		orientation: { type: "enum", options: ["horizontal", "vertical"] },
	},
	render: (args: Args) => (
		<Stepper
			steps={["Details", "Shipping", "Pay"]}
			activeStep={args.activeStep}
			orientation={args.orientation}
		/>
	),
};
