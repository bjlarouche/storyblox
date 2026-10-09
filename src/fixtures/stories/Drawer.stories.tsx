import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { Drawer, useArg } from "./kitBreadth";

interface Args {
	open: boolean;
	edge: "left" | "right" | "bottom";
	width: number;
	height: number;
}

interface TitledProps {
	open: boolean;
	edge?: "left" | "right" | "bottom";
	width?: number;
	height?: number;
	title?: string;
	onClose: () => void;
	children?: React.ReactNode;
}

const Titled = Drawer as unknown as (props: TitledProps) => React.Element;

function DrawerStory(args: Args) {
	const { theme } = useTheme();
	const [open, setOpen] = useArg(args.open);
	return (
		<>
			{!open && (
				<textbutton
					Size={new UDim2(0, 120, 0, 28)}
					Text="Open drawer"
					TextColor3={theme.palette.text.primary}
					BackgroundColor3={theme.palette.surface.paper}
					Event={{ Activated: () => setOpen(true) }}
				/>
			)}
			<Titled
				open={open}
				edge={args.edge}
				width={args.edge === "bottom" || args.width < 1 ? undefined : args.width}
				height={args.edge === "bottom" ? args.height : undefined}
				title="A long drawer title that wraps inside the padded edge"
				onClose={() => setOpen(false)}
			>
				<textlabel
					Size={new UDim2(1, 0, 0, 24)}
					BackgroundTransparency={1}
					Text="Stays inside the padding"
					TextWrapped={true}
					TextSize={16}
					Font={Enum.Font.SourceSans}
					TextColor3={theme.palette.text.primary}
				/>
			</Titled>
		</>
	);
}

export default {
	title: "Components/Drawer",
	preview: { kind: "gui", width: 420, height: 320 },
	args: { open: true, edge: "left", width: 280, height: 160 },
	argTypes: {
		open: { type: "boolean" },
		edge: { type: "enum", options: ["left", "right", "bottom"] },
		width: { type: "number", min: 0, max: 640, step: 20 },
		height: { type: "number", min: 80, max: 320, step: 20 },
	},
	render: (args: Args) => <DrawerStory {...args} />,
};
