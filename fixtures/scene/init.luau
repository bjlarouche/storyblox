local function mount(_target, context)
	local part = Instance.new("Part")
	part.Name = "ScenePart"
	part.Size = Vector3.new(4, 4, 4)
	part.Anchored = true
	part.Color = context.theme.palette.primary.main
	part.Parent = context.sceneRoot
	context.own(part)
	context.ready()
end

return {
	renderer = "native",
	title = "Fixture/Native Scene",
	preview = { kind = "viewport", width = 320, height = 180 },
	mount = mount,
}
