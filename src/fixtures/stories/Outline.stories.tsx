import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { BoxRect, collectGuiBoxes, guiBox } from "packages/layoutTools";
import OutlineOverlay from "packages/ui/template/components/OutlineOverlay";

interface Args {
	measure: boolean;
}

function OutlineDemo(args: Args) {
	const { theme } = useTheme();
	const host = useRef<Frame>();
	const [boxes, setBoxes] = useState<BoxRect[]>([]);
	const [origin, setOrigin] = useState<BoxRect>();

	useEffect(() => {
		const root = host.current;
		if (root === undefined) return;
		setOrigin(guiBox(root));
		setBoxes(collectGuiBoxes(root, 32));
	}, [args.measure]);

	return (
		<frame ref={host} Size={new UDim2(0, 240, 0, 120)} BackgroundTransparency={1}>
			<textbutton
				key="One"
				Text="One"
				Size={new UDim2(0, 80, 0, 32)}
				Position={new UDim2(0, 12, 0, 12)}
				BackgroundColor3={theme.palette.primary.main}
				TextColor3={theme.palette.text.primary}
			/>
			<textbutton
				key="Two"
				Text="Two"
				Size={new UDim2(0, 100, 0, 28)}
				Position={new UDim2(0, 110, 0, 48)}
				BackgroundColor3={theme.palette.primary.main}
				TextColor3={theme.palette.text.primary}
			/>
			{origin !== undefined && <OutlineOverlay theme={theme} boxes={boxes} measure={args.measure} origin={origin} />}
		</frame>
	);
}

export default {
	title: "Shell/Outline",
	description: "Outline and AbsoluteSize measure overlay.",
	features: { outline: true, measure: true },
	args: { measure: true },
	argTypes: { measure: { type: "boolean" } },
	render: (args: Args) => <OutlineDemo {...args} />,
};
