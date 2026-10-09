import React from "@rbxts/react";
import { Table, useArg } from "./kitBreadth";

interface Args {
	selected: number;
	dense: boolean;
}

const HEADING = "A longer role heading";
const CELL = "A longer role that stays inside the cell padding";

function TableStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	return (
		<frame Size={new UDim2(0, 320, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<Table
				columns={["Name", HEADING]}
				rows={[
					["Ada", "Engineer"],
					["Grace", CELL],
				]}
				selected={selected}
				dense={args.dense}
				onRowActivated={setSelected}
			/>
		</frame>
	);
}

export default {
	title: "Components/Table",
	preview: { kind: "gui", width: 360, height: 140 },
	args: { selected: 0, dense: false },
	argTypes: {
		selected: { type: "number" },
		dense: { type: "boolean" },
	},
	render: (args: Args) => <TableStory {...args} />,
};
