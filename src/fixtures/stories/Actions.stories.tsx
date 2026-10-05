import React, { useMemo, useState } from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { createActionLog } from "packages/storyActions";
import ActionsPanel from "packages/ui/template/components/ActionsPanel";

interface Args {
	disabled: boolean;
}

function ActionsDemo(args: Args) {
	const { theme } = useTheme();
	const log = useMemo(() => createActionLog(8), []);
	const [, bump] = useState(0);
	const record = (name: string, ...values: unknown[]) => {
		if (args.disabled) return;
		log.record(name, ...values);
		bump((n) => n + 1);
	};

	return (
		<frame Size={new UDim2(1, 0, 0, 220)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} Padding={new UDim(0, 8)} />
			<frame key="Buttons" LayoutOrder={1} Size={new UDim2(1, 0, 0, 28)} BackgroundTransparency={1}>
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
			</frame>
			<frame key="Panel" LayoutOrder={2} Size={new UDim2(1, 0, 0, 180)} BorderSizePixel={0}>
				<ActionsPanel
					theme={theme}
					events={log.events}
					disabled={args.disabled}
					onReset={() => {
						log.reset();
						bump((n) => n + 1);
					}}
				/>
			</frame>
		</frame>
	);
}

export default {
	title: "Shell/Actions",
	description: "Capped action log with clear.",
	features: { actions: true },
	args: { disabled: false },
	argTypes: { disabled: { type: "boolean" } },
	render: (args: Args) => <ActionsDemo {...args} />,
};
