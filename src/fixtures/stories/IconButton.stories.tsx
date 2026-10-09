import React from "@rbxts/react";
import { IconButton, Icons, useTheme } from "@rbxts/uiblox";

interface Args {
	selected: boolean;
	disabled: boolean;
	loading: boolean;
	size: "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
}

const sizes: Array<Args["size"]> = ["xxs", "xs", "sm", "md", "lg", "xl"];

function Cell(props: { order: number; children?: React.ReactNode }) {
	return (
		<frame LayoutOrder={props.order} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			{props.children}
		</frame>
	);
}

function Row(props: { order: number; children?: React.ReactNode }) {
	return (
		<frame LayoutOrder={props.order} Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, 8)}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{props.children}
		</frame>
	);
}

function IconButtonStory(args: Args) {
	const { theme } = useTheme();
	const tint = theme.palette.text.primary;
	return (
		<frame Size={new UDim2(0, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Row order={0}>
				{sizes.map((size, index) => (
					<Cell key={size} order={index}>
						<IconButton icon={Icons.Settings} tint={tint} size={size} />
					</Cell>
				))}
			</Row>
			<Row order={1}>
				<Cell order={0}>
					<IconButton icon={Icons.Settings} tint={tint} size="md" selected />
				</Cell>
				<Cell order={1}>
					<IconButton icon={Icons.Settings} tint={tint} size="md" disabled />
				</Cell>
				<Cell order={2}>
					<IconButton icon={Icons.Settings} tint={tint} size="md" loading />
				</Cell>
				<Cell order={3}>
					<IconButton
						icon={Icons.Settings}
						tint={tint}
						size={args.size}
						selected={args.selected}
						disabled={args.disabled}
						loading={args.loading}
					/>
				</Cell>
			</Row>
			<Row order={2}>
				<Cell order={0}>
					<IconButton icon={Icons.Settings} glyph="play" tint={tint} size="sm" />
				</Cell>
				<Cell order={1}>
					<IconButton icon={Icons.Settings} glyph="play" tint={tint} size="lg" />
				</Cell>
				<Cell order={2}>
					<IconButton icon={Icons.Settings} glyph="pause" tint={tint} size="lg" />
				</Cell>
				<Cell order={3}>
					<IconButton icon={Icons.Settings} glyph="previous" tint={tint} size="lg" />
				</Cell>
				<Cell order={4}>
					<IconButton icon={Icons.Settings} glyph="next" tint={tint} size="lg" />
				</Cell>
			</Row>
		</frame>
	);
}

export default {
	title: "Components/Icon Button",
	preview: { kind: "gui", width: 280, height: 160 },
	args: { selected: false, disabled: false, loading: false, size: "md" },
	argTypes: {
		selected: { type: "boolean" },
		disabled: { type: "boolean" },
		loading: { type: "boolean" },
		size: { type: "enum", options: sizes },
	},
	render: (args: Args) => <IconButtonStory {...args} />,
};
