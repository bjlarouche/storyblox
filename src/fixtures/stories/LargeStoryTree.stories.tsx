import React from "@rbxts/react";
import { Branch, Icons, TreeView } from "@rbxts/uiblox";

const branches: Branch[] = [];
for (let p = 1; p <= 50; p++) {
	const groups: Branch[] = [];
	for (let g = 1; g <= 4; g++) {
		const leaves = [];
		for (let s = 1; s <= 25; s++) leaves.push({ title: `Story${s}` });
		groups.push({ title: `Group${g}`, icon: Icons.ListPrimary, leaves });
	}
	branches.push({ title: `Package${p}`, icon: Icons.OpenBox, leaves: [], branches: groups });
}

interface Args {
	filter: string;
	selected: string;
}

export default {
	title: "Fixture/LargeStoryTree",
	args: { filter: "", selected: "Package40/Group3/Story20" },
	argTypes: {
		filter: { type: "string" },
		selected: { type: "string" },
	},
	render: (args: Args) => (
		<frame Size={new UDim2(0, 260, 0, 420)} BackgroundTransparency={1}>
			<TreeView
				tree={{ title: "STORIES", branches }}
				icon={Icons.Book}
				filter={args.filter}
				selected={args.selected}
			/>
		</frame>
	),
};
