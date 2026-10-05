import React from "@rbxts/react";
import { FormHelperText, FormLabel } from "./kitBreadth";

interface Args {
	label: string;
	helper: string;
	required: boolean;
	hasError: boolean;
	disabled: boolean;
}

export default {
	title: "Inputs/Form Label",
	args: {
		label: "Email",
		helper: "We never share this",
		required: true,
		hasError: false,
		disabled: false,
	},
	argTypes: {
		label: { type: "string" },
		helper: { type: "string" },
		required: { type: "boolean" },
		hasError: { type: "boolean" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(0, 240, 0, 64)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, 6)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<FormLabel
				text={args.label}
				required={args.required}
				hasError={args.hasError}
				disabled={args.disabled}
			/>
			<FormHelperText text={args.helper} hasError={args.hasError} disabled={args.disabled} />
		</frame>
	),
};
