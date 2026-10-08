return function(target)
	local label = Instance.new("TextLabel")
	label.Name = "FunctionStory"
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = "function story"
	label.Parent = target
	return function()
		label:Destroy()
	end
end
