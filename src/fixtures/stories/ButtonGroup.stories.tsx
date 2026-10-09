import React, { useState } from "@rbxts/react";
import { ButtonGroup } from "@rbxts/uiblox";

interface Item {
	label: string;
	disabled?: boolean;
}

interface GroupProps {
	items: Array<Item>;
	selected?: number;
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	onItem?: (index: number) => void;
}

const Group = ButtonGroup as unknown as (props: GroupProps) => React.Element;

const days: Array<Item> = [{ label: "Day" }, { label: "Week" }, { label: "Month" }];
const blocked: Array<Item> = [{ label: "Day" }, { label: "Week", disabled: true }, { label: "Month" }];

function GroupStory() {
	const [picked, setPicked] = useState(1);
	return (
		<frame Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<frame LayoutOrder={0} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
				<Group items={days} selected={picked} onItem={setPicked} />
			</frame>
			<frame LayoutOrder={1} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
				<Group items={days} selected={0} size="small" />
			</frame>
			<frame LayoutOrder={2} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
				<Group items={days} selected={2} size="large" />
			</frame>
			<frame LayoutOrder={3} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
				<Group items={blocked} selected={1} />
			</frame>
		</frame>
	);
}

export default {
	title: "Components/ButtonGroup",
	preview: { kind: "gui", width: 280, height: 200 },
	render: () => <GroupStory />,
};
