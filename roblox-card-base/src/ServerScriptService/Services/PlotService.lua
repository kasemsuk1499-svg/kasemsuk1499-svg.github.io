local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Config = require(Root.Shared.GameConfig)
local Economy = require(Root.Shared.Economy)

local PlotService = {}

local DataService
local MonetizationService
local Remotes

local PlotsFolder
local PlotByUser = {}
local SlotByUser = {}
local UserBySlot = {}

local PlotOrigins = {
	Vector3.new(-62,0,-48), Vector3.new(0,0,-48), Vector3.new(62,0,-48), Vector3.new(124,0,-48),
	Vector3.new(-62,0,48), Vector3.new(0,0,48), Vector3.new(62,0,48), Vector3.new(124,0,48),
}

local function makeText(parent,name,text,size,pos,fontSize,color)
	local label = Instance.new("TextLabel")
	label.Name = name
	label.BackgroundTransparency = 1
	label.Size = size
	label.Position = pos
	label.Text = text
	label.TextColor3 = color or Color3.new(1,1,1)
	label.TextScaled = false
	label.TextSize = fontSize
	label.Font = Enum.Font.GothamBold
	label.TextWrapped = true
	label.Parent = parent
	return label
end

local function tierDef(tier)
	return Config.Tiers[math.clamp(math.floor(tonumber(tier) or 0),0,9)+1]
end

local function gradeDef(grade)
	return Config.Grades[math.clamp(math.floor(tonumber(grade) or 0),0,#Config.Grades-1)+1]
end

local function mutationColor(card)
	local m2 = tonumber(card.Mutation2) or 0
	local m1 = tonumber(card.Mutation1) or 0
	local m = m2 > 0 and m2 or m1
	if m > 0 and Config.Mutations[m] then return Config.Mutations[m].color end
	return tierDef(card.Tier).color
end

local function buildWorldShell()
	local existing = Workspace:FindFirstChild("CardBaseWorld")
	if existing then existing:Destroy() end
	local world = Instance.new("Folder")
	world.Name = "CardBaseWorld"
	world.Parent = Workspace

	local ground = Instance.new("Part")
	ground.Name = "Ground"
	ground.Anchored = true
	ground.Size = Vector3.new(230,1,150)
	ground.Position = Vector3.new(30,-1,0)
	ground.Material = Enum.Material.Slate
	ground.Color = Color3.fromRGB(11,14,21)
	ground.Parent = world

	PlotsFolder = Instance.new("Folder")
	PlotsFolder.Name = "PlayerPlots"
	PlotsFolder.Parent = world

	local spawn = Workspace:FindFirstChildOfClass("SpawnLocation")
	if not spawn then
		spawn = Instance.new("SpawnLocation")
		spawn.Name = "CardBaseSpawn"
		spawn.Anchored = true
		spawn.Size = Vector3.new(12,1,12)
		spawn.Position = Vector3.new(-95,0,0)
		spawn.Neutral = true
		spawn.Color = Color3.fromRGB(72,78,98)
		spawn.Parent = world
	end
end

local function createStand(model,origin,slot)
	local floor = math.floor((slot-1)/10)
	local within = (slot-1)%10
	local row = math.floor(within/5)
	local col = within%5
	local floorY = floor*18
	local x = (col-2)*6.2
	local z = row == 0 and -5 or 5

	local pedestal = Instance.new("Part")
	pedestal.Name = string.format("Stand_%02d",slot)
	pedestal.Anchored = true
	pedestal.Size = Vector3.new(5.1,1,3.2)
	pedestal.CFrame = CFrame.new(origin+Vector3.new(x,floorY+0.5,z))
	pedestal.Material = Enum.Material.Metal
	pedestal.Color = Color3.fromRGB(35,40,52)
	pedestal.Parent = model
	pedestal:SetAttribute("Slot",slot)

	local board = Instance.new("Part")
	board.Name = "CardBoard"
	board.Anchored = true
	board.CanCollide = false
	board.Size = Vector3.new(4.8,6.6,0.35)
	board.CFrame = CFrame.new(origin+Vector3.new(x,floorY+4.2,z))
	board.Material = Enum.Material.SmoothPlastic
	board.Color = Color3.fromRGB(19,22,31)
	board.Parent = pedestal

	local gui = Instance.new("SurfaceGui")
	gui.Name = "CardGui"
	gui.Face = Enum.NormalId.Front
	gui.CanvasSize = Vector2.new(480,660)
	gui.AlwaysOnTop = true
	gui.Parent = board

	makeText(gui,"Slot","SLOT "..slot,UDim2.fromScale(0.9,0.08),UDim2.fromScale(0.05,0.03),30,Color3.fromRGB(140,149,170))
	makeText(gui,"Main","EMPTY",UDim2.fromScale(0.9,0.28),UDim2.fromScale(0.05,0.30),48,Color3.new(1,1,1))
	makeText(gui,"Meta","",UDim2.fromScale(0.9,0.24),UDim2.fromScale(0.05,0.65),25,Color3.fromRGB(190,198,214))

	local prompt = Instance.new("ProximityPrompt")
	prompt.Name = "ManagePrompt"
	prompt.ActionText = "Manage Card"
	prompt.ObjectText = "Stand "..slot
	prompt.KeyboardKeyCode = Enum.KeyCode.E
	prompt.MaxActivationDistance = 12
	prompt.HoldDuration = 0
	prompt.Parent = pedestal
	prompt.Triggered:Connect(function(player)
		local ownerId = model:GetAttribute("OwnerUserId")
		if ownerId == player.UserId and Remotes then
			Remotes.OpenStand:FireClient(player,slot)
		end
	end)

	local attachment = Instance.new("Attachment")
	attachment.Name = "FxAttachment"
	attachment.Parent = board
	local emitter = Instance.new("ParticleEmitter")
	emitter.Name = "CardParticles"
	emitter.Enabled = false
	emitter.Texture = "rbxasset://textures/particles/sparkles_main.dds"
	emitter.LightEmission = 0.9
	emitter.Lifetime = NumberRange.new(0.8,1.5)
	emitter.Speed = NumberRange.new(0.4,1.3)
	emitter.SpreadAngle = Vector2.new(180,180)
	emitter.Rotation = NumberRange.new(0,360)
	emitter.RotSpeed = NumberRange.new(-80,80)
	emitter.Size = NumberSequence.new({
		NumberSequenceKeypoint.new(0,0.18),
		NumberSequenceKeypoint.new(0.35,0.32),
		NumberSequenceKeypoint.new(1,0),
	})
	emitter.Parent = attachment
end

local function buildPlot(player,slotIndex)
	local origin = PlotOrigins[slotIndex]
	local model = Instance.new("Model")
	model.Name = "Plot_"..player.UserId
	model:SetAttribute("OwnerUserId",player.UserId)
	model.Parent = PlotsFolder

	for floor=0,2 do
		local slab = Instance.new("Part")
		slab.Name = "Floor_"..(floor+1)
		slab.Anchored = true
		slab.Size = Vector3.new(36,1,24)
		slab.CFrame = CFrame.new(origin+Vector3.new(0,floor*18,0))
		slab.Material = Enum.Material.Metal
		slab.Color = Color3.fromRGB(18+floor*3,22+floor*3,31+floor*4)
		slab.Parent = model

		local rail = Instance.new("Part")
		rail.Name = "BackRail_"..(floor+1)
		rail.Anchored = true
		rail.Size = Vector3.new(36,3,0.6)
		rail.CFrame = CFrame.new(origin+Vector3.new(0,floor*18+2.0,11.7))
		rail.Material = Enum.Material.Neon
		rail.Color = Color3.fromRGB(55,67,92)
		rail.Parent = model
	end

	for stand=1,Config.MaxStandSlots do createStand(model,origin,stand) end

	local sign = Instance.new("Part")
	sign.Name = "OwnerSign"
	sign.Anchored = true
	sign.CanCollide = false
	sign.Size = Vector3.new(18,5,0.5)
	sign.CFrame = CFrame.new(origin+Vector3.new(0,6,12))
	sign.Material = Enum.Material.SmoothPlastic
	sign.Color = Color3.fromRGB(12,15,22)
	sign.Parent = model
	local gui = Instance.new("SurfaceGui")
	gui.Face = Enum.NormalId.Front
	gui.CanvasSize = Vector2.new(720,200)
	gui.AlwaysOnTop = true
	gui.Parent = sign
	makeText(gui,"Owner",player.DisplayName,UDim2.fromScale(0.94,0.45),UDim2.fromScale(0.03,0.05),46,Color3.new(1,1,1))
	makeText(gui,"Title","Loading...",UDim2.fromScale(0.94,0.35),UDim2.fromScale(0.03,0.52),30,Color3.fromRGB(164,229,220))

	PlotByUser[player.UserId] = model
	return model
end

function PlotService.Render(player)
	local model = PlotByUser[player.UserId]
	local profile = DataService and DataService.Get(player)
	if not model or not profile then return end
	local limit = Economy.StandLimit(profile.BaseLevel)
	local entitlements = MonetizationService and MonetizationService.GetEntitlements(player) or {}
	local sign = model:FindFirstChild("OwnerSign")
	if sign and sign:FindFirstChild("SurfaceGui") then
		local gui = sign.SurfaceGui
		gui.Owner.Text = (entitlements.VIPCollector and "VIP · " or "")..player.DisplayName
		gui.Owner.TextColor3 = entitlements.VIPCollector and Color3.fromRGB(255,235,157) or Color3.new(1,1,1)
		local roman = require(script.Parent.BaseService).Roman(profile.Ascension)
		gui.Title.Text = "Base Lv."..profile.BaseLevel.." · "..(roman ~= "" and ("ASC "..roman) or "No Ascension")
		sign.Color = profile.Ascension >= 10 and Color3.fromRGB(34,25,50)
			or profile.Ascension >= 3 and Color3.fromRGB(15,31,38)
			or Color3.fromRGB(12,15,22)
	end

	for slot=1,Config.MaxStandSlots do
		local pedestal = model:FindFirstChild(string.format("Stand_%02d",slot))
		if not pedestal then continue end
		local board = pedestal:FindFirstChild("CardBoard")
		local gui = board and board:FindFirstChild("CardGui")
		local prompt = pedestal:FindFirstChild("ManagePrompt")
		if not board or not gui then continue end
		local unlocked = slot <= limit
		local guid = profile.Placed[tostring(slot)]
		local card = guid and profile.Cards[guid]

		if not unlocked then
			board.Color = Color3.fromRGB(18,19,24)
			gui.Main.Text = "LOCKED"
			gui.Main.TextColor3 = Color3.fromRGB(90,94,105)
			gui.Meta.Text = "Reach higher Base Level"
			gui.Slot.Text = "SLOT "..slot
			if prompt then prompt.Enabled = false end
		elseif not card then
			board.Color = Color3.fromRGB(24,29,39)
			gui.Main.Text = "EMPTY"
			gui.Main.TextColor3 = Color3.fromRGB(200,207,219)
			gui.Meta.Text = "Press E to place a card"
			gui.Slot.Text = "SLOT "..slot
			if prompt then prompt.Enabled = true end
		else
			local tier = tierDef(card.Tier)
			local grade = gradeDef(card.Grade)
			board.Color = tier.color:Lerp(Color3.fromRGB(18,20,28),0.58)
			gui.Slot.Text = string.format("#%04d · %s",card.Id,tier.name)
			gui.Main.Text = grade.name.." · Lv."..card.Level
			gui.Main.TextColor3 = grade.color
			local income = Economy.CardIncome(profile,card,entitlements)
			local mutationText = ""
			if (tonumber(card.Mutation1) or 0) > 0 then mutationText = Config.Mutations[card.Mutation1].name end
			if (tonumber(card.Mutation2) or 0) > 0 then mutationText ..= " + "..Config.Mutations[card.Mutation2].name end
			gui.Meta.Text = string.format("%.0f/s%s%s",income,mutationText ~= "" and ("\n"..mutationText) or "",(card.Awakening or 0)>0 and ("\nAWAKEN ★"..card.Awakening) or "")
			if prompt then prompt.Enabled = true end

			local emitter = board:FindFirstChild("FxAttachment") and board.FxAttachment:FindFirstChild("CardParticles")
			if emitter then
				local fx = (card.Tier or 0) >= 4 or (card.Mutation1 or 0) > 0 or (card.Mutation2 or 0) > 0
				emitter.Enabled = fx
				emitter.Rate = math.clamp((2+(card.Tier or 0)*0.7+((card.Mutation1 or 0)>0 and 2 or 0))*(entitlements.ShowcasePro and 1.35 or 1),2,15)
				emitter.Color = ColorSequence.new(mutationColor(card))
			end
		end

		local emitter = board:FindFirstChild("FxAttachment") and board.FxAttachment:FindFirstChild("CardParticles")
		if emitter and (not unlocked or not card) then emitter.Enabled = false end
	end
end

function PlotService.Assign(player)
	local chosen
	for i=1,#PlotOrigins do
		if not UserBySlot[i] then chosen=i break end
	end
	if not chosen then
		warn("[PlotService] No plot slot for",player)
		return nil
	end
	UserBySlot[chosen] = player.UserId
	SlotByUser[player.UserId] = chosen
	local model = buildPlot(player,chosen)
	PlotService.Render(player)
	return model
end

function PlotService.Remove(player)
	local model = PlotByUser[player.UserId]
	if model then model:Destroy() end
	PlotByUser[player.UserId] = nil
	local slot = SlotByUser[player.UserId]
	if slot then UserBySlot[slot] = nil end
	SlotByUser[player.UserId] = nil
end

function PlotService.Start(dataService,monetizationService,remotes)
	DataService = dataService
	MonetizationService = monetizationService
	Remotes = remotes
	buildWorldShell()
	Players.PlayerRemoving:Connect(PlotService.Remove)
end

return PlotService
