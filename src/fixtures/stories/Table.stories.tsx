import React from "@rbxts/react";
import { Table, useArg } from "./kitBreadth";

interface Args {
	selected: number;
}

function TableStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	return (
		<Table
			columns={["Name", "Role"]}
			rows={[
				["Ada", "Engineer"],
				["Grace", "Admiral"],
			]}
			selected={selected}
			onRowActivated={setSelected}
		/>
	);
}

export default {
	title: "Components/Table",
	args: { selected: 0 },
	argTypes: { selected: { type: "number" } },
	render: (args: Args) => <TableStory {...args} />,
};
