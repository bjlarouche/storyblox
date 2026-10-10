import React, { useEffect, useRef, useState } from "@rbxts/react";
import { ScrollView, Tabs, Typography, useBreakpoints, useTheme } from "@rbxts/uiblox";

import { CATEGORIES, Category, Equipped, lookOf, PIECES, Piece, sceneBlocks, STARTER } from "./avatarEditor";

function Stage(props: { equipped: Equipped }) {
	const { theme } = useTheme();
	const frameRef = useRef<ViewportFrame>();
	const cameraRef = useRef<Camera>();
	const look = lookOf(props.equipped);

	useEffect(() => {
		const frame = frameRef.current;
		const camera = cameraRef.current;
		if (frame !== undefined && camera !== undefined) frame.CurrentCamera = camera;
	}, []);

	return (
		<viewportframe
			ref={frameRef}
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={Color3.fromRGB(210, 184, 154)}
			BorderSizePixel={0}
			Ambient={Color3.fromRGB(165, 136, 112)}
			LightColor={Color3.fromRGB(255, 228, 190)}
			LightDirection={new Vector3(-0.45, -1, -0.35)}
			ClipsDescendants
		>
			<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
			<camera
				ref={cameraRef}
				CFrame={CFrame.lookAt(new Vector3(7.2, 5, 11.2), new Vector3(0, 3.5, 0))}
				FieldOfView={36}
			/>
			<worldmodel>
				{sceneBlocks(look).map((part) => (
					<part
						key={part.id}
						Anchored
						CanCollide={false}
						Size={part.size}
						CFrame={part.cf}
						Color={part.color}
						Material={part.material ?? Enum.Material.SmoothPlastic}
						Shape={part.shape ?? Enum.PartType.Block}
						TopSurface={Enum.SurfaceType.Smooth}
						BottomSurface={Enum.SurfaceType.Smooth}
					/>
				))}
			</worldmodel>
		</viewportframe>
	);
}

function Tile(props: { piece: Piece; picked: boolean; order: number; onPick: (piece: Piece) => void }) {
	const { theme } = useTheme();
	return (
		<textbutton
			LayoutOrder={props.order}
			Text=""
			AutoButtonColor={false}
			BackgroundColor3={props.picked ? theme.palette.action.selected : theme.palette.surface.canvas}
			BorderSizePixel={0}
			Event={{ Activated: () => props.onPick(props.piece) }}
		>
			<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
			<uistroke
				Color={props.picked ? theme.palette.primary.main : theme.palette.divider}
				Thickness={props.picked ? 2 : 1}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
			/>
			<frame
				BackgroundColor3={props.piece.color}
				BorderSizePixel={0}
				Position={UDim2.fromOffset(8, 8)}
				Size={new UDim2(1, -16, 0, 64)}
			>
				<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
			</frame>
			<Typography
				text={props.piece.name}
				variant="body"
				align="center"
				sx={{
					Position: new UDim2(0, 4, 0, 76),
					Size: new UDim2(1, -8, 0, 36),
					AutomaticSize: Enum.AutomaticSize.None,
				}}
			/>
		</textbutton>
	);
}

function AvatarEditor() {
	const { theme } = useTheme();
	const [host, setHost] = useState<Frame>();
	const view = useBreakpoints(host);
	const narrow = view.width > 0 && view.width < 760;
	const [category, setCategory] = useState<Category>("Clothing");
	const [equipped, setEquipped] = useState(STARTER);
	const pad = theme.spacing.calc(1.5);
	const gap = theme.spacing.calc(1);
	const rail = theme.spacing.calc(16);
	const grid = theme.spacing.calc(44);
	const stageH = theme.spacing.calc(26);
	const tabH = theme.spacing.calc(4);
	const noteH = theme.spacing.calc(8);
	const showNote = category === "Animations";
	const items = PIECES.filter((piece) => piece.category === category);
	const panel = grid + rail + gap * 3;
	const stageSize = narrow ? new UDim2(1, 0, 0, stageH) : new UDim2(1, -(panel + gap), 1, 0);
	const panelPos = narrow ? new UDim2(0, 0, 0, stageH + gap) : new UDim2(1, -panel, 0, 0);
	const panelSize = narrow ? new UDim2(1, 0, 1, -(stageH + gap)) : new UDim2(0, panel, 1, 0);

	const pick = (piece: Piece) => {
		const worn = { ...equipped };
		worn[piece.slot] = piece.id;
		setEquipped(worn);
	};

	return (
		<frame
			ref={setHost}
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={theme.palette.surface.canvas}
			BorderSizePixel={0}
		>
			<uipadding
				PaddingTop={new UDim(0, pad)}
				PaddingBottom={new UDim(0, pad)}
				PaddingLeft={new UDim(0, pad)}
				PaddingRight={new UDim(0, pad)}
			/>
			<frame Size={stageSize} BackgroundTransparency={1} BorderSizePixel={0}>
				<Stage equipped={equipped} />
			</frame>
			<frame
				Position={panelPos}
				Size={panelSize}
				BackgroundColor3={theme.palette.surface.paper}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, theme.shape.borderRadius)} />
				<uipadding
					PaddingTop={new UDim(0, gap)}
					PaddingBottom={new UDim(0, gap)}
					PaddingLeft={new UDim(0, gap)}
					PaddingRight={new UDim(0, gap)}
				/>
				<frame
					Size={narrow ? new UDim2(1, 0, 0, tabH) : new UDim2(0, rail, 1, 0)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					<Tabs
						value={category}
						options={CATEGORIES}
						orientation={narrow ? "horizontal" : "vertical"}
						onChange={setCategory}
					/>
				</frame>
				<frame
					Position={narrow ? new UDim2(0, 0, 0, tabH + gap) : new UDim2(0, rail + gap, 0, 0)}
					Size={narrow ? new UDim2(1, 0, 1, -(tabH + gap)) : new UDim2(1, -(rail + gap), 1, 0)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					{showNote && (
						<Typography
							text="Animations in this preview are poses, not a full animator."
							variant="body"
							color="textSecondary"
							sx={{ Size: new UDim2(1, 0, 0, noteH), AutomaticSize: Enum.AutomaticSize.None }}
						/>
					)}
					<ScrollView
						sx={{
							Position: showNote ? new UDim2(0, 0, 0, noteH + gap) : UDim2.fromOffset(0, 0),
							Size: showNote ? new UDim2(1, 0, 1, -(noteH + gap)) : UDim2.fromScale(1, 1),
						}}
					>
						<frame
							Size={new UDim2(1, 0, 0, 0)}
							AutomaticSize={Enum.AutomaticSize.Y}
							BackgroundTransparency={1}
							BorderSizePixel={0}
						>
							<uigridlayout
								CellSize={UDim2.fromOffset(108, 120)}
								CellPadding={UDim2.fromOffset(8, 8)}
								SortOrder={Enum.SortOrder.LayoutOrder}
								HorizontalAlignment={Enum.HorizontalAlignment.Left}
							/>
							{items.map((piece, index) => (
								<Tile
									key={piece.id}
									piece={piece}
									order={index}
									picked={equipped[piece.slot] === piece.id}
									onPick={pick}
								/>
							))}
						</frame>
					</ScrollView>
				</frame>
			</frame>
		</frame>
	);
}

export default {
	title: "3D/Avatar Editor",
	description: "Dress a blocky character in a viewport.",
	preview: { width: 1024, height: 720 },
	render: () => <AvatarEditor />,
};
