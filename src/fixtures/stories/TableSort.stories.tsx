import React, { useState } from "@rbxts/react";
import { Table } from "./kitBreadth";

const rows = [
	["Ada", "10"],
	["Grace", "2"],
	["Lin", "10"],
];

function SortStory() {
	const [column, setColumn] = useState(1);
	const [direction, setDirection] = useState("asc");
	return (
		<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} BorderSizePixel={0}>
			<Table
				columns={[
					{ header: "Name", sortable: true },
					{ header: "Score", sortable: true },
				]}
				rows={rows}
				sortColumn={column}
				sortDirection={direction}
				onSort={(index: number) => {
					if (index === column) setDirection(direction === "asc" ? "desc" : "asc");
					else {
						setColumn(index);
						setDirection("asc");
					}
				}}
			/>
		</frame>
	);
}

export default {
	title: "Components/TableSort",
	render: () => <SortStory />,
};
