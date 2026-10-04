local function adapt(render)
	return function(target, context)
		local root = render(context.args)
		root.Parent = target
		context.ready()
		return {
			update = function(args)
				local replacement = render(args)
				replacement.Parent = target
				root:Destroy()
				root = replacement
			end,
			destroy = function()
				root:Destroy()
			end,
		}
	end
end

local function render(args)
	local label = Instance.new("TextLabel")
	label.Name = "AdapterLabel"
	label.Size = UDim2.fromOffset(200, 32)
	label.Text = args.text
	return label
end

return {
	renderer = "native",
	title = "Fixture/Adapter",
	args = { text = "adapter" },
	argTypes = { text = { type = "string" } },
	mount = adapt(render),
	cases = {
		update = function(env)
			local before = env.find("AdapterLabel")
			env.setArg("text", "updated")
			env.wait()
			local after = env.find("AdapterLabel")
			env.expect(after ~= nil and after.Text == "updated", "adapter applied update")
			env.expect(before ~= after and before.Parent == nil, "adapter destroyed the old root")
		end,
	},
}
