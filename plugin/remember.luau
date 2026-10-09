local KEYS = {
	["storyblox-recent"] = "recent",
	["storyblox-include-tags"] = "includeTags",
	["storyblox-exclude-tags"] = "excludeTags",
}

return function(plugin, stories)
	if stories == nil then
		return function() end
	end
	for attr, key in pairs(KEYS) do
		local saved = plugin:GetSetting(key)
		if type(saved) == "string" and saved ~= "" then
			stories:SetAttribute(attr, saved)
		end
	end
	local conn = stories.AttributeChanged:Connect(function(attr)
		local key = KEYS[attr]
		if key == nil then
			return
		end
		local value = stories:GetAttribute(attr)
		plugin:SetSetting(key, if type(value) == "string" then value else "")
	end)
	return function()
		conn:Disconnect()
	end
end
