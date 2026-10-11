import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Players, RunService } from "@rbxts/services";
import { ScrollView, Tabs, Typography, useBreakpoints, useTheme } from "@rbxts/uiblox";

import {
	animationId,
	CATEGORIES,
	Category,
	descriptionOf,
	Equipped,
	equippedFrom,
	PIECES,
	Piece,
} from "./avatarEditor";

function stand(model: Model) {
	const [cf, size] = model.GetBoundingBox();
	const bottom = cf.Position.Y - size.Y / 2;
	const lifted = model.GetPivot().add(new Vector3(0, -bottom, 0));
	model.PivotTo(lifted.mul(CFrame.Angles(0, math.rad(180), 0)));
}

function stepAnimations(animator: Animator, dt: number) {
	(animator as Animator & { StepAnimations(deltaTime: number): void }).StepAnimations(dt);
}

function Stage(props: { equipped: Equipped }) {
	const { theme } = useTheme();
	const frameRef = useRef<ViewportFrame>();
	const cameraRef = useRef<Camera>();
	const rigRef = useRef<Folder>();
	const animatorRef = useRef<Animator>();
	const trackRef = useRef<AnimationTrack>();
	const tokenRef = useRef(0);
	const clipRef = useRef(0);
	const pausedRef = useRef(false);
	const equipped = props.equipped;
	const body = `${equipped.skin}/${equipped.face}/${equipped.shirt}/${equipped.pants}/${equipped.hair}/${equipped.hat}`;
	const clipId = animationId(equipped);
	clipRef.current = clipId;
	pausedRef.current = theme.reducedMotion === true;

	const play = (animator: Animator) => {
		const token = ++tokenRef.current;
		const id = clipRef.current;
		trackRef.current?.Stop();
		trackRef.current = undefined;
		if (id <= 0) return;
		const animation = new Instance("Animation");
		animation.AnimationId = `rbxassetid://${id}`;
		const [played, loaded] = pcall(() => animator.LoadAnimation(animation));
		animation.Destroy();
		if (!played || token !== tokenRef.current || animatorRef.current !== animator) {
			if (played) (loaded as AnimationTrack).Stop();
			return;
		}
		const clip = loaded as AnimationTrack;
		clip.Looped = true;
		clip.Priority = Enum.AnimationPriority.Action;
		clip.Play();
		trackRef.current = clip;
	};

	useEffect(() => {
		const frame = frameRef.current;
		const camera = cameraRef.current;
		if (frame !== undefined && camera !== undefined) frame.CurrentCamera = camera;
	}, []);

	useEffect(() => {
		const folder = rigRef.current;
		if (folder === undefined) return;
		let alive = true;
		let rig: Model | undefined;
		let animator: Animator | undefined;
		let blocked = false;
		const description = descriptionOf(equipped);
		const conn = RunService.Heartbeat.Connect((dt) => {
			const current = animator;
			if (blocked || current === undefined || pausedRef.current) return;
			const [ok, err] = pcall(() => stepAnimations(current, dt));
			if (!ok) {
				blocked = true;
				warn(`avatar step: ${err}`);
			}
		});
		task.spawn(() => {
			const [ok, result] = pcall(() =>
				Players.CreateHumanoidModelFromDescription(description, Enum.HumanoidRigType.R15),
			);
			description.Destroy();
			if (!ok) {
				warn(`avatar rig: ${result}`);
				return;
			}
			const model = result as Model;
			if (!alive) {
				model.Destroy();
				return;
			}
			stand(model);
			model.Name = "Avatar";
			const humanoid = model.FindFirstChildOfClass("Humanoid");
			if (humanoid !== undefined) {
				humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None;
				humanoid.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOff;
			}
			model.Parent = folder;
			rig = model;
			if (humanoid === undefined) return;
			let found = humanoid.FindFirstChildOfClass("Animator");
			if (found === undefined) {
				found = new Instance("Animator");
				found.Parent = humanoid;
			}
			animator = found;
			animatorRef.current = found;
			play(found);
		});
		return () => {
			alive = false;
			tokenRef.current++;
			conn.Disconnect();
			trackRef.current?.Stop();
			trackRef.current = undefined;
			animatorRef.current = undefined;
			rig?.Destroy();
		};
	}, [body]);

	useEffect(() => {
		const animator = animatorRef.current;
		if (animator === undefined) return;
		play(animator);
	}, [clipId]);

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
				CFrame={CFrame.lookAt(new Vector3(8, 4.8, 13.2), new Vector3(0, 3.1, 0))}
				FieldOfView={40}
			/>
			<worldmodel>
				<folder ref={rigRef} />
				<part
					Anchored
					CanCollide={false}
					Size={new Vector3(16, 0.4, 16)}
					CFrame={new CFrame(0, -0.2, 0)}
					Color={Color3.fromRGB(118, 78, 50)}
					Material={Enum.Material.Wood}
					TopSurface={Enum.SurfaceType.Smooth}
					BottomSurface={Enum.SurfaceType.Smooth}
				/>
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

function AvatarEditor(props: { seed: Equipped }) {
	const { theme } = useTheme();
	const [host, setHost] = useState<Frame>();
	const view = useBreakpoints(host);
	const narrow = view.width > 0 && view.width < 760;
	const [category, setCategory] = useState<Category>("Clothing");
	const [equipped, setEquipped] = useState(props.seed);
	const pad = theme.spacing.calc(1.5);
	const gap = theme.spacing.calc(1);
	const rail = theme.spacing.calc(16);
	const grid = theme.spacing.calc(44);
	const stageH = theme.spacing.calc(26);
	const tabH = theme.spacing.calc(4);
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
					<ScrollView sx={{ Size: UDim2.fromScale(1, 1) }}>
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
	description: "Dress a character in a viewport.",
	preview: { width: 1024, height: 720 },
	render: (args: Partial<Equipped>) => <AvatarEditor seed={equippedFrom(args)} />,
};
