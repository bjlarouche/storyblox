import React, { useState } from "@rbxts/react";
import { resolveStyle, StyleWithSelectors } from "@rbxts/uiblox";

interface RowProps {
	label: string;
	index: number;
	count: number;
}

function Row({ label, index, count }: RowProps) {
	const [hover, setHover] = useState(false);
	const [focused, setFocused] = useState(false);
	const style: StyleWithSelectors<Partial<WritableInstanceProperties<TextButton>>> = {
		Size: new UDim2(1, 0, 0, 36),
		BackgroundColor3: Color3.fromRGB(40, 44, 52),
		TextColor3: Color3.fromRGB(220, 220, 220),
		BorderSizePixel: 0,
		TextSize: 14,
		Font: Enum.Font.Gotham,
		_hover: { BackgroundColor3: Color3.fromRGB(55, 62, 75) },
		_focus: { BackgroundColor3: Color3.fromRGB(45, 70, 110) },
		_first: { BackgroundColor3: Color3.fromRGB(35, 60, 45) },
		_last: { BackgroundColor3: Color3.fromRGB(60, 40, 40) },
	};
	const painted = resolveStyle(style, {
		hover,
		focused,
		first: index === 0,
		last: index === count - 1,
	});

	return (
		<textbutton
			Text={label}
			{...painted}
			Event={{
				MouseEnter: () => setHover(true),
				MouseLeave: () => setHover(false),
				SelectionGained: () => setFocused(true),
				SelectionLost: () => setFocused(false),
			}}
		/>
	);
}

const labels = ["First", "Middle", "Last"];

export default {
	title: "Examples/Style Selectors",
	template: () => (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<uilistlayout Padding={new UDim(0, 4)} SortOrder={Enum.SortOrder.LayoutOrder} />
			{labels.map((label, index) => (
				<Row key={label} label={label} index={index} count={labels.size()} />
			))}
		</frame>
	),
};
