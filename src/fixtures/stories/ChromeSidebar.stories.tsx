import React from "@rbxts/react";
import { Story } from "interfaces";
import StoriesSidebar from "../../packages/ui/storiesSidebar/components/StoriesSidebar";

const noop = () => <frame />;

function leaf(title: Story["title"]): Story {
	return { title, component: noop as Story["component"], template: noop };
}

const STORIES = [
	leaf("Components/Button"),
	leaf("Components/Chip"),
	leaf("Components/Input"),
	leaf("Feedback/Alert"),
	leaf("Layout/Stack"),
	leaf("Scenarios/Desk"),
];

export default {
	title: "Chrome/Sidebar",
	preview: { kind: "gui", width: 280, height: 520 },
	render: () => (
		<frame Size={new UDim2(0, 280, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
			<StoriesSidebar
				stories={STORIES}
				logoSrc="rbxassetid://9311703342"
				selected="Components/Button"
				favorites={["Components/Chip"]}
				recent={["Feedback/Alert", "Layout/Stack"]}
				onClick={() => {}}
			/>
		</frame>
	),
};
