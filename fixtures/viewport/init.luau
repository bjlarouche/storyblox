local RunService = game:GetService("RunService")

local function mount(target, context)
	local palette = context.theme.palette
	local viewport = Instance.new("ViewportFrame")
	viewport.Name = "ViewportFixture"
	viewport.Size = UDim2.fromScale(1, 1)
	viewport.BackgroundColor3 = palette.background.paper
	viewport.BorderSizePixel = 0

	local world = Instance.new("WorldModel")
	world.Parent = viewport
	local part = Instance.new("Part")
	part.Size = Vector3.new(4, 4, 4)
	part.Anchored = true
	part.Color = palette.primary.main
	part.Parent = world

	local camera = Instance.new("Camera")
	camera.CFrame = CFrame.lookAt(Vector3.new(0, 5, 10), Vector3.zero)
	camera.Parent = viewport
	viewport.CurrentCamera = camera
	viewport.Parent = target

	local spin = RunService.Heartbeat:Connect(function(dt)
		part.CFrame *= CFrame.Angles(0, dt, 0)
	end)
	return function()
		spin:Disconnect()
		viewport:Destroy()
	end
end

return {
	renderer = "native",
	title = "Fixture/Viewport",
	mount = mount,
}
