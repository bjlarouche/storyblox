import React, { useState } from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Menu, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	empty: boolean;
	dense: boolean;
	selected: string;
}

function MenuStory(args: Args) {
	const { theme } = useTheme();
	const [open, setOpen] = useArg(args.open);
	const [anchor, setAnchor] = useState<TextButton>();
	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<textbutton
				ref={setAnchor}
				AnchorPoint={new Vector2(1, 1)}
				Position={new UDim2(1, -8, 1, -8)}
				Size={new UDim2(0, 96, 0, 28)}
				Text="Open"
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.body}
				TextColor3={theme.palette.text.primary}
				BackgroundColor3={theme.palette.surface.paper}
				BorderSizePixel={0}
				Event={{ Activated: () => setOpen(true) }}
			>
				<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
				<uistroke Color={theme.palette.border} ApplyStrokeMode={Enum.ApplyStrokeMode.Border} />
			</textbutton>
			<Menu
				anchor={anchor}
				open={open}
				dense={args.dense}
				selected={args.selected === "" ? undefined : args.selected}
				items={
					args.empty
						? []
						: [
								{ id: "a", text: "One" },
								{ id: "b", text: "Two" },
								{ id: "c", text: "Disabled", disabled: true },
							]
				}
				onSelect={() => setOpen(false)}
				onClose={() => setOpen(false)}
			/>
		</frame>
	);
}

export default {
	title: "Components/Menu",
	preview: { kind: "gui", width: 320, height: 220 },
	args: { open: true, empty: false, dense: false, selected: "a" },
	argTypes: {
		open: { type: "boolean" },
		empty: { type: "boolean" },
		dense: { type: "boolean" },
		selected: { type: "string" },
	},
	render: (args: Args) => <MenuStory {...args} />,
};
