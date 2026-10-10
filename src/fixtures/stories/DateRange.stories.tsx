import React, { useState } from "@rbxts/react";
import { DateRangePicker, DateSpan, TimeField } from "@rbxts/uiblox";

function FieldStory() {
	const [span, setSpan] = useState<DateSpan>({ start: 20261005, finish: 20261020 });
	const [shown, setShown] = useState({ year: 2026, month: 10 });
	const [time, setTime] = useState({ hour: 9, minute: 30 });
	return (
		<frame Size={new UDim2(0, 280, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<DateRangePicker
				year={shown.year}
				month={shown.month}
				value={span}
				onChange={setSpan}
				onMonthChange={(year, month) => setShown({ year, month })}
			/>
			<TimeField value={time} onChange={setTime} />
		</frame>
	);
}

export default {
	title: "Components/Date Range",
	render: () => <FieldStory />,
};
