local TS = _G[script]
local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))

return {
	default = {
		id = "fixture/defined",
		title = "Fixture/Defined",
		args = { label = "defined story" },
		argTypes = { label = { type = "string" } },
		render = function(args)
			return React.createElement("textlabel", {
				Size = UDim2.new(1, 0, 0, 24),
				BackgroundTransparency = 1,
				Text = args.label,
				TextSize = 18,
				Font = Enum.Font.SourceSans,
			})
		end,
	},
}
