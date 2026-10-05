local AssetService = game:GetService("AssetService")
local RunService = game:GetService("RunService")

local FRAME_SIZE = 64

local function paintReelFrame(image, frameIndex, frameCount, size)
	size = size or FRAME_SIZE
	local pixels = table.create(size * size * 4)
	local cx = math.floor(((size - 16) * frameIndex) / math.max(frameCount - 1, 1)) + 8
	local cy = math.floor(size / 2)
	local radius = 10
	local i = 1
	for y = 0, size - 1 do
		for x = 0, size - 1 do
			local r, g, b = 28, 32, 48
			local a = 255
			if x < 5 or x >= size - 5 then
				local hole = y % 10 < 5
				if hole then
					r, g, b = 18, 18, 22
				else
					r, g, b = 210, 210, 220
				end
			else
				local dx = x - cx
				local dy = y - cy
				if dx * dx + dy * dy <= radius * radius then
					r, g, b = 255, 170 + frameIndex * 20, 40
				elseif y > size - 14 and y < size - 6 and x > 8 and x < size - 8 then
					r, g, b = 70, 90, 130
				end
			end
			pixels[i] = r
			pixels[i + 1] = g
			pixels[i + 2] = b
			pixels[i + 3] = a
			i += 4
		end
	end

	local buf = buffer.create(size * size * 4)
	for offset = 0, #pixels - 1 do
		buffer.writeu8(buf, offset, pixels[offset + 1])
	end
	image:WritePixelsBuffer(Vector2.zero, Vector2.new(size, size), buf)
end

local function createReelFrames(frameCount)
	local count = math.clamp(math.floor(frameCount), 2, 8)
	local frames = table.create(count)
	for i = 0, count - 1 do
		local image = AssetService:CreateEditableImage({ Size = Vector2.new(FRAME_SIZE, FRAME_SIZE) })
		paintReelFrame(image, i, count, FRAME_SIZE)
		frames[i + 1] = image
	end
	return frames
end

local function destroyReelFrames(frames)
	for _, frame in frames do
		frame:Destroy()
	end
	table.clear(frames)
end

local function showReelFrame(label, frames, index)
	local frame = frames[index + 1]
	if not frame then
		return
	end
	label.ImageContent = Content.fromObject(frame)
end

local function mount(target, context)
	local args = context.args
	local frameCount = args.frameCount or 3
	local frames = createReelFrames(frameCount)
	local index = 0
	local conn

	local root = Instance.new("Frame")
	root.Name = "EditableImageReelNative"
	root.Size = UDim2.fromScale(1, 1)
	root.BackgroundTransparency = 1
	root.Parent = target

	local label = Instance.new("ImageLabel")
	label.Name = "ReelFrame"
	label.Size = UDim2.fromOffset(FRAME_SIZE * 3, FRAME_SIZE * 3)
	label.Position = UDim2.new(0.5, 0, 0.5, -12)
	label.AnchorPoint = Vector2.new(0.5, 0.5)
	label.BackgroundColor3 = Color3.fromRGB(12, 12, 16)
	label.BorderSizePixel = 0
	label.ScaleType = Enum.ScaleType.Fit
	label.Parent = root

	local status = Instance.new("TextLabel")
	status.Name = "ReelStatus"
	status.Size = UDim2.new(1, 0, 0, 20)
	status.Position = UDim2.new(0, 0, 1, -24)
	status.BackgroundTransparency = 1
	status.TextSize = 14
	status.Font = Enum.Font.SourceSans
	status.TextColor3 = Color3.fromRGB(220, 220, 230)
	status.Parent = root

	local function setStatus(paused, hold)
		status.Text = string.format("frame %d/%d", index + 1, #frames)
			.. (paused and " paused" or "")
			.. (hold and " hold" or "")
	end

	local function apply(nextArgs)
		local fps = math.max(nextArgs.fps or 4, 0.1)
		local paused = nextArgs.paused == true
		local holdFrame = math.floor(nextArgs.holdFrame or 0)
		local nextCount = math.clamp(math.floor(nextArgs.frameCount or frameCount), 2, 8)

		if nextCount ~= #frames then
			destroyReelFrames(frames)
			frames = createReelFrames(nextCount)
			index = 0
			frameCount = nextCount
		end

		if conn then
			conn:Disconnect()
			conn = nil
		end

		if holdFrame >= 1 then
			index = math.clamp(holdFrame, 1, #frames) - 1
			showReelFrame(label, frames, index)
			setStatus(true, true)
			return
		end

		showReelFrame(label, frames, index)
		setStatus(paused, false)
		if paused then
			return
		end

		local step = 1 / fps
		local elapsed = 0
		conn = RunService.Heartbeat:Connect(function(dt)
			elapsed += dt
			if elapsed < step then
				return
			end
			elapsed -= step
			index = (index + 1) % #frames
			showReelFrame(label, frames, index)
			setStatus(false, false)
		end)
	end

	apply(args)
	context.ready()

	return {
		update = function(nextArgs)
			apply(nextArgs)
		end,
		destroy = function()
			if conn then
				conn:Disconnect()
				conn = nil
			end
			destroyReelFrames(frames)
			root:Destroy()
		end,
	}
end

return {
	renderer = "native",
	title = "Examples/EditableImage Reel (Native)",
	args = {
		fps = 4,
		frameCount = 3,
		paused = false,
		holdFrame = 0,
	},
	argTypes = {
		fps = { type = "number", control = "slider", min = 1, max = 12, step = 1 },
		frameCount = { type = "number", control = "slider", min = 2, max = 8, step = 1 },
		paused = { type = "boolean" },
		holdFrame = {
			type = "number",
			control = "slider",
			min = 0,
			max = 8,
			step = 1,
			description = "0 = play; 1..N holds that frame for captures",
		},
	},
	mount = mount,
}
