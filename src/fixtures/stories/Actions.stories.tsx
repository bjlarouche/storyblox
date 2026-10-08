import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { useActionLog } from "packages/ui/template/actionLogContext";

interface Args {
	disabled: boolean;
	onClick?: () => void;
}

function ActionsDemo(args: Args) {
	const { theme } = useTheme();
	const actions = useActionLog();
	const record = (name: string, ...values: unknown[]) => {
		if (args.disabled || actions.disabled) return;
		actions.record(name, ...values);
	};

	return (
		<frame Size={new UDim2(1, 0, 0, 48)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 8)} />
			<textbutton
				key="Click"
				Text="click"
				Size={new UDim2(0, 64, 1, 0)}
				BackgroundColor3={theme.palette.primary.main}
				TextColor3={theme.palette.text.primary}
				Event={{ Activated: () => record("click", "primary") }}
			/>
			<textbutton
				key="Press"
				Text="press"
				Size={new UDim2(0, 64, 1, 0)}
				BackgroundColor3={theme.palette.primary.main}
				TextColor3={theme.palette.text.primary}
				Event={{ Activated: () => record("press", 1) }}
			/>
			<textbutton
				key="Callback"
				Text="callback"
				Size={new UDim2(0, 72, 1, 0)}
				BackgroundColor3={theme.palette.primary.main}
				TextColor3={theme.palette.text.primary}
				Event={{ Activated: () => args.onClick?.() }}
			/>
			<textlabel
				key="Hint"
				Text="Open the Actions inspector tab"
				Size={new UDim2(0, 200, 1, 0)}
				BackgroundTransparency={1}
				TextColor3={theme.palette.text.secondary}
				TextSize={theme.typography.fontSizes.caption}
				Font={theme.typography.fontFamilies.default}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</frame>
	);
}

export default {
	title: "Shell/Actions",
	description: "Capped action log with clear.",
	features: { actions: true },
	args: { disabled: false, onClick: () => {} },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <ActionsDemo {...args} />,
};
