local labelText = require(script.Parent.labelText).labelText

local function mount(target, context)
	local part = Instance.new("Part")
	part.Name = "ScenePart"
	part.Size = Vector3.new(4, 4, 4)
	part.Anchored = true
	part.Color = context.theme.palette.primary.main
	part.Parent = context.sceneRoot
	context.own(part)
	local overlay = Instance.new("TextLabel")
	overlay.Name = "SceneOverlay"
	overlay.Size = UDim2.new(1, 0, 0, 24)
	overlay.BackgroundTransparency = 1
	overlay.Text = labelText .. " overlay"
	overlay.TextColor3 = context.theme.palette.text.primary
	overlay.ZIndex = 2
	overlay.Parent = target
	context.own(overlay)
	context.ready()
end

return {
	renderer = "native",
	title = "3D/Scene",
	preview = { kind = "viewport", width = 320, height = 180 },
	mount = mount,
}
