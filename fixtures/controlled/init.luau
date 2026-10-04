local function apply(button, args)
	button.Text = args.label
	button.Active = not args.disabled
	button.AutoButtonColor = not args.disabled
end

local function mount(_target, context)
	local button = Instance.new("TextButton")
	button.Name = "ControlledButton"
	button.Size = UDim2.fromOffset(120, 36)
	button.BackgroundColor3 = Color3.fromRGB(40, 120, 220)
	button.TextColor3 = Color3.new(1, 1, 1)
	button.Font = Enum.Font.SourceSansBold
	button.TextSize = 18
	button.Parent = context.target
	context.own(button)
	apply(button, context.args)
	context.ready()
	return {
		update = function(args)
			apply(button, args)
		end,
	}
end

return {
	renderer = "native",
	title = "Inputs/Button/Native",
	args = {
		label = "Native",
		disabled = false,
	},
	argTypes = {
		label = { type = "string" },
		disabled = { type = "boolean" },
	},
	mount = mount,
	cases = {
		disable = function(env)
			local button = env.find("ControlledButton")
			env.expect(button ~= nil, "button")
			env.expect(button and button.Active, "starts active")
			env.setArg("disabled", true)
			env.wait()
			env.expect(button and not button.Active, "disabled turns Active off")
			env.expect(button and env.find("ControlledButton") == button, "same button")
		end,
	},
}
