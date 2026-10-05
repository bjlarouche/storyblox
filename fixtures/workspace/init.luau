local function mount(_target, context)
	local part = Instance.new("Part")
	part.Name = "WorkspacePart"
	part.Size = Vector3.new(4, 4, 4)
	part.Position = Vector3.new(0, 1000, 0)
	part.Anchored = true
	part.Color = context.theme.palette.primary.main
	part.Parent = context.sceneRoot
	context.camera.CFrame = CFrame.lookAt(part.Position + Vector3.new(0, 5, 10), part.Position)
	context.ready()
end

return {
	renderer = "native",
	title = "3D/Workspace",
	preview = { kind = "workspace" },
	mount = mount,
}
