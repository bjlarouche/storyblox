import React from "@rbxts/react";
import { List, ListItem } from "./kitBreadth";

interface Args {
	text: string;
	secondary: string;
	selected: boolean;
	disabled: boolean;
	dense: boolean;
	divider: boolean;
}

function Row(props: { order: number; children?: React.ReactNode }) {
	return (
		<frame LayoutOrder={props.order} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			{props.children}
		</frame>
	);
}

function ListItemStory(args: Args) {
	return (
		<frame Size={new UDim2(0, 240, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<List
				fillDirection={Enum.FillDirection.Vertical}
				wrap="no-wrap"
				sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
			>
				<Row order={0}>
					<ListItem text="Inbox" secondary="Hover and press" divider />
				</Row>
				<Row order={1}>
					<ListItem text="Selected" secondary="Stays filled until hover" selected divider />
				</Row>
				<Row order={2}>
					<ListItem text="Disabled" secondary="No press" disabled divider />
				</Row>
				<Row order={3}>
					<ListItem
						text={args.text}
						secondary={args.secondary}
						selected={args.selected}
						disabled={args.disabled}
						dense={args.dense}
						divider={args.divider}
					/>
				</Row>
			</List>
		</frame>
	);
}

export default {
	title: "Components/List Item",
	preview: { kind: "gui", width: 280, height: 220 },
	args: { text: "Primary", secondary: "Secondary", selected: false, disabled: false, dense: false, divider: true },
	argTypes: {
		text: { type: "string" },
		secondary: { type: "string" },
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		dense: { type: "boolean" },
		divider: { type: "boolean" },
	},
	render: (args: Args) => <ListItemStory {...args} />,
};
