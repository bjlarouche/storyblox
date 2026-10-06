import React from "@rbxts/react";
import { Table, useArg } from "./kitBreadth";

interface Args {
	selected: number;
	dense: boolean;
}

function TableStory(args: Args) {
	const [selected, setSelected] = useArg(args.selected);
	return (
		<frame Size={new UDim2(0, 320, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<Table
				columns={["Name", "Role"]}
				rows={[
					["Ada", "Engineer"],
					["Grace", "Admiral"],
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
	args: { selected: 0, dense: false },
	argTypes: {
		selected: { type: "number" },
		dense: { type: "boolean" },
	},
	render: (args: Args) => <TableStory {...args} />,
};
