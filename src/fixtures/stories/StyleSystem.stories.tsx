import React, { useState } from "@rbxts/react";
import { resolveStyle, resolveSx, useTheme } from "@rbxts/uiblox";

interface Args {
	width: number;
	disabled: boolean;
	loading: boolean;
}

function Chip(props: { label: string; index: number; count: number; width: number; disabled: boolean; loading: boolean }) {
	const { theme } = useTheme();
	const [hover, setHover] = useState(false);
	const resolved = resolveSx(
		theme,
		{
			width: { phone: 96, tablet: 140, desktop: 180 },
			height: 36,
			p: 1,
			px: 2,
			bgcolor: "surface.elevated",
			color: "text.primary",
			radius: theme.shape.borderRadius,
			typography: "button",
			border: 0,
			_hover: { bgcolor: "action.hover" },
			_disabled: { bgcolor: "action.disabled", color: "text.disabled" },
			_loading: { color: "text.secondary" },
			_first: { bgcolor: "primary.main", color: "primary.on" },
			_last: { bgcolor: "accent.main", color: "accent.on" },
			_odd: { BackgroundTransparency: 0 },
			_even: { BackgroundTransparency: 0.05 },
		},
		props.width,
	);
	const painted = resolveStyle(resolved.root, {
		hover,
		disabled: props.disabled,
		loading: props.loading,
		first: props.index === 0,
		last: props.index === props.count - 1,
		odd: props.index % 2 === 0,
		even: props.index % 2 === 1,
	});

	return (
		<textbutton
			Text={props.loading ? "…" : props.label}
			AutoButtonColor={false}
			{...painted}
			Event={{
				MouseEnter: () => setHover(true),
				MouseLeave: () => setHover(false),
			}}
		>
			{resolved.padding !== undefined && <uipadding {...resolved.padding} />}
			{resolved.corner !== undefined && <uicorner {...resolved.corner} />}
		</textbutton>
	);
}

function StyleSystemStory(args: Args) {
	const { theme } = useTheme();
	const labels = ["First", "Odd", "Even", "Last"];
	const shell = resolveSx(theme, {
		width: args.width,
		height: 200,
		p: 2,
		gap: 1,
		bgcolor: "surface.paper",
		radius: theme.shape.borderRadius,
	});

	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<frame {...shell.root}>
				{shell.padding !== undefined && <uipadding {...shell.padding} />}
				{shell.corner !== undefined && <uicorner {...shell.corner} />}
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, shell.gap ?? theme.spacing.calc(1))}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
				/>
				{labels.map((label, index) => (
					<Chip
						key={label}
						label={label}
						index={index}
						count={labels.size()}
						width={args.width}
						disabled={args.disabled}
						loading={args.loading}
					/>
				))}
			</frame>
		</frame>
	);
}

export default {
	title: "Examples/Style System",
	args: {
		width: 480,
		disabled: false,
		loading: false,
	},
	argTypes: {
		width: { type: "number", min: 320, max: 1100, step: 20 },
		disabled: { type: "boolean" },
		loading: { type: "boolean" },
	},
	render: (args: Args) => <StyleSystemStory {...args} />,
};
