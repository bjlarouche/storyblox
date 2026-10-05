import React from "@rbxts/react";
import { useTheme } from "@rbxts/uiblox";
import { SafeBoundary } from "packages/ui/template";

function Boom() {
	error("intentional control crash");
	return <frame />;
}

function ContainmentDemo() {
	const { theme } = useTheme();
	return (
		<frame key="Containment" Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				Padding={new UDim(0, theme.padding.calc(1))}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<textlabel
				key="Shell"
				LayoutOrder={1}
				Text="shell ok"
				Size={new UDim2(1, 0, 0, 20)}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.semibold}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.primary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
			<frame key="Panel" LayoutOrder={2} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<SafeBoundary resetKey="poison" compact>
					<Boom />
				</SafeBoundary>
			</frame>
			<textlabel
				key="Other"
				LayoutOrder={3}
				Text="other panel ok"
				Size={new UDim2(1, 0, 0, 20)}
				BackgroundTransparency={1}
				Font={theme.typography.fontFamilies.default}
				TextSize={theme.typography.fontSizes.caption}
				TextColor3={theme.palette.text.secondary}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</frame>
	);
}

export default {
	title: "Dev/Crash Control",
	description: "Dev-only: one control throws; shell siblings must stay up.",
	preview: { kind: "gui", width: 320, height: 120, background: new Color3(0.12, 0.14, 0.18) },
	args: { label: "ok" },
	argTypes: { label: { type: "string" } },
	render: () => <ContainmentDemo />,
};
