-- Store plugin: embeds StorybloxPlugin. No fixture stories, no sync Reload.
local rs = game:GetService("ReplicatedStorage")
local toolbar = plugin:CreateToolbar("Storyblox")
local toggle = toolbar:CreateButton("Storyblox", "Toggle Storyblox", "rbxassetid://100703482666040")
local widget = plugin:CreateDockWidgetPluginGui(
	"Storyblox",
	DockWidgetPluginGuiInfo.new(Enum.InitialDockState.Float, true, false, 420, 320, 240, 180)
)
widget.Title = "Storyblox"
widget.Name = "Storyblox"
local root = Instance.new("Frame")
root.Name = "StorybloxRoot"
root.BackgroundTransparency = 1
root.Size = UDim2.fromScale(1, 1)
root.Parent = widget

local remember = require(script:WaitForChild("remember"))
local lifetime, cleanupFn, loaded, forgetRemember = {}, nil, nil, nil

local function show(text)
	root:ClearAllChildren()
	local label = Instance.new("TextLabel")
	label.Name = "StorybloxStatus"
	label.BackgroundTransparency = 1
	label.Size = UDim2.fromScale(1, 1)
	label.TextWrapped = true
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.TextYAlignment = Enum.TextYAlignment.Top
	label.Text = text
	label.Parent = root
end

local function ensureInclude()
	if rs:FindFirstChild("StorybloxInclude") then
		return
	end
	local include = script:FindFirstChild("StorybloxInclude")
	if include then
		include:Clone().Parent = rs
	end
end

local function runCleanup()
	if forgetRemember then
		forgetRemember()
		forgetRemember = nil
	end
	if cleanupFn then
		pcall(cleanupFn)
	end
	cleanupFn = nil
	if loaded then
		loaded:Destroy()
	end
	loaded = nil
end

local function mount()
	runCleanup()
	root:ClearAllChildren()
	ensureInclude()
	local folder = script:FindFirstChild("StorybloxPlugin")
	if not folder then
		show("StorybloxPlugin missing from the plugin bundle.")
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
		show("StorybloxPlugin needs an init ModuleScript.")
		return
	end
	local stories = loaded:FindFirstChild("stories")
	if stories then
		forgetRemember = remember(plugin, stories)
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
	if type(result) == "function" then
		cleanupFn = result
	end
end

-- Cleanup yields until React is idle, so a second load must wait instead of rendering into root mid-unmount.
local loading, again = false, false
local function load()
	if loading then
		again = true
		return
	end
	loading = true
	repeat
		again = false
		local ok, err = pcall(mount)
		if not ok then
			warn("[Storyblox] ", err)
		end
	until not again
	loading = false
end

local function command(name)
	local stories = loaded and loaded:FindFirstChild("stories")
	if stories then
		stories:SetAttribute(name, (stories:GetAttribute(name) or 0) + 1)
	end
end

local function chrome(kind)
	local stories = loaded and loaded:FindFirstChild("stories")
	if stories then
		stories:SetAttribute("storyblox-chrome", `{kind}@{os.clock()}`)
	end
end

local focusAction = plugin:CreatePluginAction("StorybloxFocusSearch", "Storyblox: Focus search", "Focus the story filter", "", true)
local remountAction = plugin:CreatePluginAction("StorybloxRemount", "Storyblox: Remount story", "Remount the selected story", "", true)
local zoomInAction = plugin:CreatePluginAction("StorybloxZoomIn", "Storyblox: Zoom in", "Zoom the canvas preview in", "", true)
local zoomOutAction = plugin:CreatePluginAction("StorybloxZoomOut", "Storyblox: Zoom out", "Zoom the canvas preview out", "", true)
local gridAction = plugin:CreatePluginAction("StorybloxToggleGrid", "Storyblox: Toggle grid", "Toggle the canvas grid", "", true)
local fitAction = plugin:CreatePluginAction("StorybloxToggleFit", "Storyblox: Toggle fit", "Toggle fit vs 100% canvas scale", "", true)
local reloadAction = plugin:CreatePluginAction("StorybloxReload", "Storyblox: Reload stories", "Reload story modules", "", true)
local orientationAction = plugin:CreatePluginAction("StorybloxOrientation", "Storyblox: Flip orientation", "Flip a sized preview between portrait and landscape", "", true)
local backgroundAction = plugin:CreatePluginAction("StorybloxBackground", "Storyblox: Cycle background", "Cycle the canvas background", "", true)
local workspaceAction = plugin:CreatePluginAction(
	"StorybloxWorkspace",
	"Storyblox: Allow workspace preview",
	"Let workspace stories mount into Workspace this session",
	"",
	true
)

table.insert(lifetime, focusAction.Triggered:Connect(function()
	command("storyblox-focus-search")
end))
table.insert(lifetime, remountAction.Triggered:Connect(function()
	command("storyblox-remount")
end))
table.insert(lifetime, zoomInAction.Triggered:Connect(function()
	chrome("zoomIn")
end))
table.insert(lifetime, zoomOutAction.Triggered:Connect(function()
	chrome("zoomOut")
end))
table.insert(lifetime, gridAction.Triggered:Connect(function()
	chrome("grid")
end))
table.insert(lifetime, fitAction.Triggered:Connect(function()
	chrome("fit")
end))
table.insert(lifetime, reloadAction.Triggered:Connect(load))
table.insert(lifetime, orientationAction.Triggered:Connect(function()
	chrome("orientation")
end))
table.insert(lifetime, backgroundAction.Triggered:Connect(function()
	chrome("background")
end))
table.insert(lifetime, workspaceAction.Triggered:Connect(function()
	command("storyblox-workspace")
	command("storyblox-remount")
end))

toggle.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
plugin.Unloading:Connect(function()
	for _, c in lifetime do
		c:Disconnect()
	end
	runCleanup()
end)
load()
