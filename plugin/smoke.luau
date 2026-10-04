local dock = game:GetService("PluginGuiService"):FindFirstChild("StorybloxDev")
assert(dock, "Storyblox dock is not open")
assert(dock.ZIndexBehavior == Enum.ZIndexBehavior.Sibling, "dock ZIndexBehavior is not Sibling")
local scroll
for _, d in dock:GetDescendants() do
	if d.Name == "Scrollable" and d:IsA("ScrollingFrame") then
		scroll = d
	end
end
assert(scroll, "canvas is not mounted")
local origin, bounds = scroll.AbsolutePosition, scroll.AbsoluteSize
for _, d in scroll:GetDescendants() do
	if d:IsA("GuiObject") and d.AbsoluteSize.X > 0 and d.AbsoluteSize.Y > 0 then
		local p = d.AbsolutePosition - origin
		if p.X >= 0 and p.Y >= 0 and p.X < bounds.X and p.Y < bounds.Y then
			return "smoke ok " .. d:GetFullName()
		end
	end
end
error("no story element with size inside the canvas")
