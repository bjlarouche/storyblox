import React, { useState } from "@rbxts/react";
import { ErrorBoundary, useTheme } from "@rbxts/uiblox";

export interface SafeBoundaryProps {
	resetKey?: string;
	compact?: boolean;
	children?: React.Element | (React.Element | undefined)[];
}

function SafeBoundary({ resetKey = "", compact = false, children }: SafeBoundaryProps) {
	const [retry, setRetry] = useState(0);
	const { theme } = useTheme();
	const gap = theme.padding.calc(compact ? 0.5 : 1);

	return (
		<ErrorBoundary
			key={`${resetKey}:${retry}`}
			fallback={(failure) => (
				<frame
					key="SafeBoundaryFallback"
					Size={new UDim2(1, 0, compact ? 0 : 1, 0)}
					AutomaticSize={compact ? Enum.AutomaticSize.Y : Enum.AutomaticSize.None}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					<uilistlayout
						FillDirection={Enum.FillDirection.Vertical}
						Padding={new UDim(0, gap)}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
					<textlabel
						key="Message"
						LayoutOrder={1}
						Text={`${failure}`}
						Size={new UDim2(1, 0, compact ? 0 : 1, compact ? 0 : -theme.spacing.calc(2))}
						AutomaticSize={compact ? Enum.AutomaticSize.Y : Enum.AutomaticSize.None}
						TextWrapped={true}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.default}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.status.error.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextYAlignment={Enum.TextYAlignment.Top}
					/>
					<textbutton
						key="Retry"
						LayoutOrder={2}
						Text="Retry"
						AutomaticSize={Enum.AutomaticSize.X}
						Size={new UDim2(0, 0, 0, theme.spacing.calc(compact ? 1.5 : 2))}
						BackgroundTransparency={1}
						Font={theme.typography.fontFamilies.semibold}
						TextSize={theme.typography.fontSizes.caption}
						TextColor3={theme.palette.primary.main}
						TextXAlignment={Enum.TextXAlignment.Left}
						Event={{ MouseButton1Click: () => setRetry((current) => current + 1) }}
					/>
				</frame>
			)}
		>
			{children}
		</ErrorBoundary>
	);
}

export default SafeBoundary;
