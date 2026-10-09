local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("StorybloxInclude"):WaitForChild("RuntimeLib"))
local ServerStorage = game:GetService("ServerStorage")
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
		Text = `Storyblox crashed. Fix the error and remount.\n\n{message}`,
	})
end

return function(plugin, widget, root)
	widget.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
	local place = ServerStorage:FindFirstChild("StorybloxPlugin")
	local stories = (place and place:FindFirstChild("stories")) or script.Parent:WaitForChild("stories")
	local saved = plugin:GetSetting("theme")
	local savedFavorites = plugin:GetSetting("favorites")
	local savedInspector = plugin:GetSetting("inspectorOpen")
	local savedExtra = plugin:GetSetting("extraRoots")
	local savedLast = plugin:GetSetting("lastStory")
	if type(savedLast) == "string" and savedLast ~= "" then
		stories:SetAttribute("storyblox-select", savedLast)
	end
	local drained = false
	local function Drained()
		React.useEffect(function()
			return function()
				drained = true
			end
		end, {})
		return nil
	end
	local handle = ReactRoblox.createRoot(root)
	handle:render(React.createElement(React.Fragment, nil, React.createElement(ErrorBoundary, { fallback = crashed }, React.createElement(Storyblox, {
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
		extraRoots = type(savedExtra) == "string" and savedExtra or "",
		onExtraRootsChange = function(value)
			plugin:SetSetting("extraRoots", value)
		end,
		lastStory = type(savedLast) == "string" and savedLast or "",
		onLastStoryChange = function(title)
			plugin:SetSetting("lastStory", title)
		end,
	})), React.createElement(Drained)))
	local stopHarness
	local storybloxRoot = TS.getModule(script, "@rbxts", "storyblox")
	local fixtures = storybloxRoot:FindFirstChild("fixtures")
	local harnessMod = fixtures and fixtures:FindFirstChild("automation")
	if harnessMod then
		local ok, start = pcall(function()
			return TS.import(script, harnessMod)
		end)
		if ok and type(start) == "function" then
			local okStart, stopper = pcall(start, stories)
			if okStart and type(stopper) == "function" then
				stopHarness = stopper
			elseif not okStart then
				warn("[Storyblox] viewport harness: ", stopper)
			end
		elseif not ok then
			warn("[Storyblox] viewport harness: ", start)
		end
	end
	return function()
		if stopHarness then pcall(stopHarness) end
		if handle == nil then return end
		-- Unmount flushes sync, so the last sibling's cleanup has run unless it threw. A copy that threw is dirty; never call into it again.
		local ok, err = pcall(function()
			handle:unmount()
		end)
		handle = nil
		if not drained then
			warn("[Storyblox] unmount did not finish before reload: ", if ok then "effects did not drain" else err)
		end
	end
end
