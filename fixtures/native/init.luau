local function mount(target, context)
	local palette = context.theme.palette
	local label = Instance.new("TextLabel")
	label.Name = "NativeFixture"
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.TextColor3 = palette.text.primary
	label.TextScaled = true
	label.Text = "native fixture"
	label.Parent = target
	return function()
		label:Destroy()
	end
end

return {
	renderer = "native",
	title = "Fixture/Native",
	mount = mount,
}
