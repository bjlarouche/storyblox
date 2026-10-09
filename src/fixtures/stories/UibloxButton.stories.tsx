import React from "@rbxts/react";
import { Button } from "@rbxts/uiblox";

const VARIANTS = ["contained", "outlined", "text"] as const;
const SIZES = ["small", "medium", "large"] as const;

function ButtonMatrix() {
	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding
				PaddingTop={new UDim(0, 8)}
				PaddingBottom={new UDim(0, 8)}
				PaddingLeft={new UDim(0, 8)}
				PaddingRight={new UDim(0, 8)}
			/>
			{VARIANTS.map((variant, row) => (
				<frame
					key={variant}
					LayoutOrder={row}
					Size={new UDim2(1, 0, 0, 52)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0, 8)}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
					{SIZES.map((size, index) => (
						<Button key={size} text={size} variant={variant} size={size} className={{ LayoutOrder: index }} />
					))}
					<Button text="Off" variant={variant} disabled className={{ LayoutOrder: 3 }} />
					<Button text="Busy" variant={variant} loading className={{ LayoutOrder: 4 }} />
					<Button text="Ink" variant={variant} color="secondary" className={{ LayoutOrder: 5 }} />
				</frame>
			))}
		</frame>
	);
}

export default {
	title: "Components/Button",
	preview: { kind: "gui", width: 640, height: 220 },
	render: () => <ButtonMatrix />,
};
