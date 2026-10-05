local TweenService = game:GetService("TweenService")

local bounceMath = require(script.Parent.bounceMath)

local SQUASH_TIME = 0.08

local function mark(ball, phase, state)
	ball:SetAttribute("storybloxBouncePhase", phase)
	ball:SetAttribute("storybloxBounceX", state.x)
	ball:SetAttribute("storybloxBounceY", state.y)
end

local function mount(target, context)
	local palette = context.theme.palette
	local colors = context.theme.options.constants.colors
	local args = context.args

	local canvas = Instance.new("Frame")
	canvas.Name = "BounceCanvas"
	canvas.Size = UDim2.fromScale(1, 1)
	canvas.BackgroundColor3 = colors.backgroundUIMuted
	canvas.BorderSizePixel = 0
	canvas.Parent = target
	context.own(canvas)

	local ball = Instance.new("Frame")
	ball.Name = "BounceBall"
	ball.AnchorPoint = Vector2.new(0.5, 0.5)
	ball.BorderSizePixel = 0
	ball.BackgroundColor3 = palette.primary.main
	ball.Parent = canvas

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(1, 0)
	corner.Parent = ball

	local alive = true
	local state
	local tween
	local completed
	local current = args

	local function stopTween()
		if completed ~= nil then
			completed:Disconnect()
			completed = nil
		end
		if tween ~= nil then
			tween:Cancel()
			tween:Destroy()
			tween = nil
		end
	end

	local function diameterOf()
		return math.max(current.size, 8)
	end

	local function place(nextState, phase)
		local diameter = diameterOf()
		state = bounceMath.clampState(nextState, canvas.AbsoluteSize.X, canvas.AbsoluteSize.Y, diameter / 2)
		ball.Position = UDim2.fromOffset(state.x, state.y)
		ball.Size = UDim2.fromOffset(diameter, diameter)
		mark(ball, phase, state)
	end

	local runLeg

	runLeg = function()
		if not alive then
			return
		end
		stopTween()
		local diameter = diameterOf()
		state = bounceMath.clampState(state, canvas.AbsoluteSize.X, canvas.AbsoluteSize.Y, diameter / 2)
		ball.Position = UDim2.fromOffset(state.x, state.y)
		ball.Size = UDim2.fromOffset(diameter, diameter)

		-- Reduced-motion hook: speed 0 or paused freezes at a known seed/current state.
		if current.paused or current.speed <= 0 then
			mark(ball, if current.paused then "paused" else "idle", state)
			return
		end

		local leg = bounceMath.nextLeg(state, canvas.AbsoluteSize.X, canvas.AbsoluteSize.Y, diameter / 2, current.speed)
		if leg.duration <= 0 then
			state = { x = leg.x, y = leg.y, vx = leg.vx, vy = leg.vy }
			place(state, "idle")
			return
		end

		mark(ball, "moving", state)
		local info = TweenInfo.new(leg.duration, current.easing, Enum.EasingDirection.Out, 0, false, 0)
		tween = TweenService:Create(ball, info, { Position = UDim2.fromOffset(leg.x, leg.y) })
		completed = tween.Completed:Connect(function(playback)
			if not alive or playback ~= Enum.PlaybackState.Completed then
				return
			end
			state = { x = leg.x, y = leg.y, vx = leg.vx, vy = leg.vy }
			mark(ball, "impact", state)
			if not current.squash then
				runLeg()
				return
			end
			stopTween()
			local flatX = if leg.hitX ~= 0 then diameter * 0.7 else diameter * 1.15
			local flatY = if leg.hitY ~= 0 then diameter * 0.7 else diameter * 1.15
			ball.Size = UDim2.fromOffset(flatX, flatY)
			local restore = TweenInfo.new(SQUASH_TIME, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0)
			tween = TweenService:Create(ball, restore, { Size = UDim2.fromOffset(diameter, diameter) })
			completed = tween.Completed:Connect(function(squashPlayback)
				if not alive or squashPlayback ~= Enum.PlaybackState.Completed then
					return
				end
				runLeg()
			end)
			tween:Play()
		end)
		tween:Play()
	end

	local function restart(nextArgs)
		current = nextArgs
		local diameter = diameterOf()
		state = bounceMath.seedState(current.seed, canvas.AbsoluteSize.X, canvas.AbsoluteSize.Y, diameter / 2)
		place(state, if current.paused or current.speed <= 0 then (if current.paused then "paused" else "idle") else "start")
		runLeg()
	end

	context.connect(canvas:GetPropertyChangedSignal("AbsoluteSize"), function()
		if not alive then
			return
		end
		local diameter = diameterOf()
		state = bounceMath.clampState(state, canvas.AbsoluteSize.X, canvas.AbsoluteSize.Y, diameter / 2)
		ball.Position = UDim2.fromOffset(state.x, state.y)
		runLeg()
	end)

	restart(args)
	context.ready()

	return {
		update = function(nextArgs)
			if not alive then
				return
			end
			restart(nextArgs)
		end,
		destroy = function()
			if not alive then
				return
			end
			alive = false
			stopTween()
		end,
	}
end

return {
	renderer = "native",
	title = "Animation/Bouncing Ball (Native)",
	description = "Theme-aware ball bouncing on TweenService legs. Dev fixture.",
	args = {
		speed = 180,
		size = 40,
		easing = Enum.EasingStyle.Linear,
		squash = true,
		paused = false,
		seed = 1,
	},
	argTypes = {
		speed = { type = "number", control = "slider", min = 0, max = 480, step = 10 },
		size = { type = "number", control = "slider", min = 16, max = 96, step = 4 },
		easing = {
			type = "EnumItem",
			enumType = "EasingStyle",
			options = { "Linear", "Sine", "Quad", "Cubic", "Back", "Bounce" },
		},
		squash = { type = "boolean" },
		paused = { type = "boolean" },
		seed = { type = "number", control = "slider", min = 0, max = 12, step = 1 },
	},
	mount = mount,
	cases = {
		pausedSeed = function(env)
			env.setArg("paused", true)
			env.setArg("seed", 0)
			env.setArg("speed", 180)
			env.wait()
			local ball = env.find("BounceBall")
			env.expect(ball ~= nil, "ball")
			env.expect(ball and ball:GetAttribute("storybloxBouncePhase") == "paused", "paused phase")
			local x = ball and ball:GetAttribute("storybloxBounceX")
			local y = ball and ball:GetAttribute("storybloxBounceY")
			env.expect(typeof(x) == "number" and typeof(y) == "number", "position attrs")
		end,
	},
}
