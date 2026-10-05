import React, { useEffect, useRef } from "@rbxts/react";
import { VirtualList, VirtualListAlign, VirtualListHandle } from "@rbxts/uiblox";

interface Args {
	count: number;
	itemHeight: number;
	overscan: number;
	scrollTo: number;
	align: VirtualListAlign;
}

function VirtualListStory(args: Args) {
	const listRef = useRef<VirtualListHandle>();
	const items: number[] = [];
	for (let i = 0; i < args.count; i++) items.push(i);

	useEffect(() => {
		listRef.current?.ensureVisible(args.scrollTo, args.align);
	}, [args.scrollTo, args.align, args.count]);

	return (
		<frame Size={new UDim2(0, 240, 0, 320)} BackgroundTransparency={1}>
			<VirtualList
				items={items}
				getKey={(item) => tostring(item)}
				itemHeight={args.itemHeight}
				overscan={args.overscan}
				listRef={listRef}
				empty={<textlabel Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} Text="No rows" TextSize={16} />}
				renderItem={(item) => (
					<textlabel
						Size={UDim2.fromScale(1, 1)}
						BackgroundTransparency={item === args.scrollTo ? 0.6 : 1}
						Text={`Row ${item}`}
						TextSize={16}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				)}
			/>
		</frame>
	);
}

export default {
	title: "Components/VirtualList",
	args: { count: 5000, itemHeight: 24, overscan: 2, scrollTo: 0, align: "nearest" },
	argTypes: {
		count: { type: "number", control: "slider", min: 0, max: 10000, step: 100 },
		itemHeight: { type: "number", control: "slider", min: 16, max: 64, step: 4 },
		overscan: { type: "number", control: "slider", min: 0, max: 10, step: 1 },
		scrollTo: { type: "number", control: "slider", min: 0, max: 9999, step: 1 },
		align: { type: "enum", options: ["nearest", "start", "center", "end"] },
	},
	render: (args: Args) => <VirtualListStory {...args} />,
};
