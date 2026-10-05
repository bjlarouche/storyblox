import React from "@rbxts/react";
import { Breadcrumbs } from "./kitBreadth";

export default {
	title: "Components/Breadcrumbs",
	args: { separator: "/" },
	argTypes: { separator: { type: "string" } },
	render: (args: { separator: string }) => (
		<Breadcrumbs
			separator={args.separator}
			items={[{ label: "Home" }, { label: "Library" }, { label: "Item" }]}
		/>
	),
};
