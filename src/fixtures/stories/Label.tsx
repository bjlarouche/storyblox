import React from "@rbxts/react";
import { LabelStyleProps, useLabelStyles } from "./Label.styles";
import { labelText } from "./labelText";

export function Label({ variant = "primary", emphasis = false }: Partial<LabelStyleProps>) {
	const { label } = useLabelStyles({ variant, emphasis });
	return <textlabel Text={`${labelText} ${variant}${emphasis ? " emphasis" : ""}`} {...label} />;
}
