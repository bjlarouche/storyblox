-- Clone ServerStorage.StorybloxPlugin before require so Studio cannot serve a cached module.
local ss = game:GetService("ServerStorage")
local toolbar = plugin:CreateToolbar("Storyblox")
local toggle = toolbar:CreateButton("Storyblox (dev)", "Toggle Storyblox", "rbxassetid://9311703342")
local reloadBtn = toolbar:CreateButton("Reload", "Reload StorybloxPlugin", "rbxassetid://75431112013973")
local widget = plugin:CreateDockWidgetPluginGui("StorybloxDev", DockWidgetPluginGuiInfo.new(Enum.InitialDockState.Float, true, false, 420, 320, 240, 180))
widget.Title = "Storyblox (dev)"
widget.Name = "StorybloxDev"
local root = Instance.new("Frame")
root.Name = "StorybloxDevRoot"
root.BackgroundTransparency = 1
root.Size = UDim2.fromScale(1, 1)
root.Parent = widget

local watchConns, lifetime, pending, cleanupFn, loaded = {}, {}

local function show(text)
	root:ClearAllChildren()
	local label = Instance.new("TextLabel")
	label.Name = "StorybloxDevStatus"
	label.BackgroundTransparency = 1
	label.Size = UDim2.fromScale(1, 1)
	label.TextWrapped = true
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.TextYAlignment = Enum.TextYAlignment.Top
	label.Text = text
	label.Parent = root
end

local function runCleanup()
	if cleanupFn then pcall(cleanupFn) end
	cleanupFn = nil
	if loaded then loaded:Destroy() end
	loaded = nil
end

local function load()
	runCleanup()
	root:ClearAllChildren()
	local folder = ss:FindFirstChild("StorybloxPlugin")
	if not folder then
		show("Sync the plugin to ServerStorage.StorybloxPlugin (Folder with an init or main ModuleScript).")
		return
	end
	loaded = folder:Clone()
	loaded.Name = "StorybloxPlugin_loaded"
	loaded.Parent = script
	local mod = loaded:FindFirstChild("init") or loaded:FindFirstChild("main")
	if not (mod and mod:IsA("ModuleScript")) then
		mod = loaded:FindFirstChildWhichIsA("ModuleScript")
	end
	if not mod then
		show("ServerStorage.StorybloxPlugin needs an init or main ModuleScript.")
		return
	end
	local ok, result = pcall(require, mod)
	if ok and type(result) == "function" then
		ok, result = pcall(result, plugin, widget, root)
	end
	if not ok then
		show(tostring(result))
		warn("[Storyblox] ", result)
		return
	end
	if type(result) == "function" then cleanupFn = result end
end

local function schedule()
	if pending then task.cancel(pending) end
	pending = task.delay(0.3, function()
		pending = nil
		load()
	end)
end

local function onSource(folder)
	local function hook(inst)
		if inst:IsA("LuaSourceContainer") then
			table.insert(watchConns, inst:GetPropertyChangedSignal("Source"):Connect(schedule))
		end
	end
	table.insert(watchConns, folder.DescendantAdded:Connect(function(inst)
		hook(inst)
		schedule()
	end))
	table.insert(watchConns, folder.DescendantRemoving:Connect(schedule))
	hook(folder)
	for _, d in folder:GetDescendants() do hook(d) end
end

local function resync()
	for _, c in watchConns do c:Disconnect() end
	table.clear(watchConns)
	local folder = ss:FindFirstChild("StorybloxPlugin")
	if folder then onSource(folder) end
	load()
end

local function onFolder(ch)
	if ch.Name == "StorybloxPlugin" then resync() end
end

local function command(name)
	local stories = ss:FindFirstChild("StorybloxPlugin") and ss.StorybloxPlugin:FindFirstChild("stories")
	if stories then stories:SetAttribute(name, (stories:GetAttribute(name) or 0) + 1) end
end
local focusAction = plugin:CreatePluginAction("StorybloxFocusSearch", "Storyblox: Focus search", "Focus the story filter", "", true)
local remountAction = plugin:CreatePluginAction("StorybloxRemount", "Storyblox: Remount story", "Remount the selected story", "", true)
table.insert(lifetime, focusAction.Triggered:Connect(function() command("storyblox-focus-search") end))
local workspaceAction = plugin:CreatePluginAction("StorybloxWorkspace", "Storyblox: Allow workspace preview", "Let workspace stories mount into Workspace this session", "", true)
table.insert(lifetime, remountAction.Triggered:Connect(function() command("storyblox-remount") end))
table.insert(lifetime, workspaceAction.Triggered:Connect(function()
	command("storyblox-workspace")
	command("storyblox-remount")
end))

toggle.Click:Connect(function() widget.Enabled = not widget.Enabled end)
reloadBtn.Click:Connect(load)
table.insert(lifetime, ss.ChildAdded:Connect(onFolder))
table.insert(lifetime, ss.ChildRemoved:Connect(onFolder))
plugin.Unloading:Connect(function()
	if pending then task.cancel(pending) end
	for _, c in watchConns do c:Disconnect() end
	for _, c in lifetime do c:Disconnect() end
	runCleanup()
end)
resync()
