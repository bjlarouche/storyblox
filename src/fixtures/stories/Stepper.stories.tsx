import React from "@rbxts/react";
import { Stepper } from "./kitBreadth";

export default {
	title: "Components/Stepper",
	args: { activeStep: 1 },
	argTypes: { activeStep: { type: "number" } },
	render: (args: { activeStep: number }) => (
		<Stepper steps={["Details", "Shipping", "Pay"]} activeStep={args.activeStep} />
	),
};
