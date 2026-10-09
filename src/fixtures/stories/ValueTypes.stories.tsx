import React from "@rbxts/react";

const region = new Region3(new Vector3(0, 0, 0), new Vector3(4, 2, 4));
const cells = new Region3int16(new Vector3int16(0, 0, 0), new Vector3int16(4, 2, 4));

export default {
	title: "Layout/Value Types",
	args: {
		region,
		cells,
		nudge: new Vector2int16(1, -2),
		step: new Vector3int16(1, 2, 3),
		spin: new Axes(Enum.Axis.X, Enum.NormalId.Top),
		sides: new Faces(Enum.NormalId.Front, Enum.NormalId.Back),
		when: DateTime.fromUnixTimestamp(0),
		ease: new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 1, false, 0),
		dock: new DockWidgetPluginGuiInfo(Enum.InitialDockState.Right, true, false, 200, 200, 100, 80),
		point: new PathWaypoint(new Vector3(1, 2, 3), Enum.PathWaypointAction.Walk, "lane"),
	},
	argTypes: {
		region: { type: "region3" },
		cells: { type: "region3int16" },
		nudge: { type: "vector2int16" },
		step: { type: "vector3int16" },
		spin: { type: "axes" },
		sides: { type: "faces" },
		when: { type: "dateTime" },
		ease: { type: "tweenInfo" },
		dock: { type: "dockWidget" },
		point: { type: "pathWaypoint" },
	},
	render: (args: {
		region: Region3;
		cells: Region3int16;
		nudge: Vector2int16;
		step: Vector3int16;
		spin: Axes;
		sides: Faces;
		when: DateTime;
		ease: TweenInfo;
		dock: DockWidgetPluginGuiInfo;
		point: PathWaypoint;
	}) => (
		<textlabel
			Text={`region=${typeOf(args.region)} cells=${args.cells.Min.X} nudge=${args.nudge.X} step=${args.step.Z} spin=${args.spin.X} sides=${args.sides.Front} when=${args.when.UnixTimestamp} ease=${args.ease.Time} dock=${typeOf(args.dock)} point=${args.point.Label}`}
			Size={new UDim2(1, 0, 0, 48)}
			BackgroundTransparency={1}
			TextWrapped={true}
			TextSize={16}
			Font={Enum.Font.SourceSans}
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
	),
};
