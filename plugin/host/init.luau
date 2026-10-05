local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("StorybloxInclude"):WaitForChild("RuntimeLib"))
local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))
local ReactRoblox = TS.import(script, TS.getModule(script, "@rbxts", "react-roblox"))
local Storyblox = TS.import(script, TS.getModule(script, "@rbxts", "storyblox")).Storyblox
local ErrorBoundary = TS.import(script, TS.getModule(script, "@rbxts", "uiblox").out).ErrorBoundary

local function crashed(message)
	return React.createElement("TextLabel", {
		Size = UDim2.fromScale(1, 1),
		BackgroundTransparency = 1,
		TextColor3 = Color3.fromRGB(255, 110, 110),
		TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left,
		TextYAlignment = Enum.TextYAlignment.Top,
		Text = `Storyblox crashed. Fix the error and press Reload.\n\n{message}`,
	})
end

return function(plugin, widget, root)
	plugin:SetSetting("watchRoots", "ServerStorage.StorybloxPlugin.stories")
	widget.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
	local stories = script.Parent:WaitForChild("stories")
	local saved = plugin:GetSetting("theme")
	local savedFavorites = plugin:GetSetting("favorites")
	local savedInspector = plugin:GetSetting("inspectorOpen")
	local handle = ReactRoblox.createRoot(root)
	handle:render(React.createElement(ErrorBoundary, { fallback = crashed }, React.createElement(Storyblox, {
		root = stories,
		themeName = saved == "light" and "light" or "dark",
		onThemeChange = function(name)
			plugin:SetSetting("theme", name)
		end,
		favorites = type(savedFavorites) == "string" and savedFavorites or "",
		onFavoritesChange = function(value)
			plugin:SetSetting("favorites", value)
		end,
		inspectorOpen = savedInspector ~= false,
		onInspectorOpenChange = function(open)
			plugin:SetSetting("inspectorOpen", open)
		end,
	})))
	local stopHarness
	local storybloxRoot = TS.getModule(script, "@rbxts", "storyblox")
	local ssStories = game:GetService("ServerStorage"):FindFirstChild("StorybloxPlugin")
	ssStories = ssStories and ssStories:FindFirstChild("stories")
	local ok, start = pcall(function()
		return TS.import(script, storybloxRoot, "fixtures", "automation")
	end)
	if ok and type(start) == "function" and ssStories then
		local okStart, stopper = pcall(start, ssStories)
		if okStart and type(stopper) == "function" then
			stopHarness = stopper
		elseif not okStart then
			warn("[Storyblox] viewport harness: ", stopper)
		end
	elseif not ok then
		warn("[Storyblox] viewport harness: ", start)
	end
	return function()
		if stopHarness then pcall(stopHarness) end
		handle:unmount()
	end
end
