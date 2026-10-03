local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("StorybloxInclude"):WaitForChild("RuntimeLib"))
local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))
local ReactRoblox = TS.import(script, TS.getModule(script, "@rbxts", "react-roblox"))
local Storyblox = TS.import(script, TS.getModule(script, "@rbxts", "storyblox")).Storyblox

return function(plugin, _widget, root)
	plugin:SetSetting("watchRoots", "ServerStorage.StorybloxPlugin.stories")
	local stories = script.Parent:WaitForChild("stories")
	local handle = ReactRoblox.createRoot(root)
	handle:render(React.createElement(Storyblox, { root = stories }))
	return function()
		handle:unmount()
	end
end
