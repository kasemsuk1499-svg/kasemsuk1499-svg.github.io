local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting = game:GetService("Lighting")

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
local CharacterConnections = {}
local ServerBoardGui
local GlobalBoardGui

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

local function makePart(parent,name,size,cframe,color,material)
	local part = Instance.new("Part")
	part.Name = name
	part.Anchored = true
	part.Size = size
	part.CFrame = cframe
	part.Color = color
	part.Material = material or Enum.Material.SmoothPlastic
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent = parent
	return part
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

local function teleportCharacter(player,position,lookAt)
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if not root then return false end
	root.AssemblyLinearVelocity = Vector3.zero
	root.AssemblyAngularVelocity = Vector3.zero
	root.CFrame = lookAt and CFrame.lookAt(position,lookAt) or CFrame.new(position)
	return true
end

local function compactNumber(value)
	local n = tonumber(value) or 0
	if math.abs(n) < 1000 then return string.format("%.0f",n) end
	local units = {"K","M","B","T","Qa","Qi","Sx","Sp","Oc","No"}
	local index = math.min(#units,math.floor(math.log10(math.max(1,math.abs(n)))/3))
	local scaled = n/(1000^index)
	return string.format(scaled >= 100 and "%.0f%s" or scaled >= 10 and "%.1f%s" or "%.2f%s",scaled,units[index])
end

local function createHubKiosk(parent,name,label,panelKey,position,color)
	local base = makePart(
		parent,
		name,
		Vector3.new(9,5,5),
		CFrame.new(position),
		Color3.fromRGB(17,21,31),
		Enum.Material.Metal
	)
	local top = makePart(
		base,
		"Glow",
		Vector3.new(8.3,0.22,4.3),
		CFrame.new(position+Vector3.new(0,2.62,0)),
		color,
		Enum.Material.Neon
	)
	top.CanCollide = false

	local screen = makePart(
		base,
		"Screen",
		Vector3.new(7.6,3.1,0.25),
		CFrame.new(position+Vector3.new(0,0.45,-2.55)),
		Color3.fromRGB(10,13,20),
		Enum.Material.SmoothPlastic
	)
	screen.CanCollide = false
	local gui = Instance.new("SurfaceGui")
	gui.Face = Enum.NormalId.Front
	gui.CanvasSize = Vector2.new(620,260)
	gui.AlwaysOnTop = true
	gui.Parent = screen
	local title = makeText(gui,"Title",label,UDim2.fromScale(0.92,0.50),UDim2.fromScale(0.04,0.10),42,Color3.fromRGB(244,247,255))
	title.TextXAlignment = Enum.TextXAlignment.Center
	local hint = makeText(gui,"Hint","PRESS E",UDim2.fromScale(0.92,0.24),UDim2.fromScale(0.04,0.64),22,color)
	hint.TextXAlignment = Enum.TextXAlignment.Center

	local prompt = Instance.new("ProximityPrompt")
	prompt.Name = panelKey.."Prompt"
	prompt.ActionText = "Open "..label
	prompt.ObjectText = "Card Base Hub"
	prompt.KeyboardKeyCode = Enum.KeyCode.E
	prompt.MaxActivationDistance = 12
	prompt.RequiresLineOfSight = false
	prompt.HoldDuration = 0
	prompt.Parent = base
	prompt.Triggered:Connect(function(player)
		if Remotes and Remotes.OpenPanel then
			Remotes.OpenPanel:FireClient(player,panelKey)
		end
	end)

	local light = Instance.new("PointLight")
	light.Color = color
	light.Brightness = 1.5
	light.Range = 13
	light.Shadows = false
	light.Parent = top
	return base
end

local function buildWorldShell()
	local existing = Workspace:FindFirstChild("CardBaseWorld")
	if existing then existing:Destroy() end
	local world = Instance.new("Folder")
	world.Name = "CardBaseWorld"
	world.Parent = Workspace

	Lighting.Brightness = 2.8
	Lighting.ClockTime = 16.4
	Lighting.Ambient = Color3.fromRGB(96,104,132)
	Lighting.OutdoorAmbient = Color3.fromRGB(72,84,112)
	Lighting.EnvironmentDiffuseScale = 0.55
	Lighting.EnvironmentSpecularScale = 0.65

	local atmosphere = Lighting:FindFirstChild("CardBaseAtmosphere")
	if not atmosphere then
		atmosphere = Instance.new("Atmosphere")
		atmosphere.Name = "CardBaseAtmosphere"
		atmosphere.Parent = Lighting
	end
	atmosphere.Density = 0.22
	atmosphere.Offset = 0.1
	atmosphere.Color = Color3.fromRGB(166,190,229)
	atmosphere.Decay = Color3.fromRGB(76,65,110)
	atmosphere.Glare = 0.08
	atmosphere.Haze = 1.15

	local ground = makePart(
		world,
		"Ground",
		Vector3.new(230,1,150),
		CFrame.new(30,-1,0),
		Color3.fromRGB(20,25,37),
		Enum.Material.Slate
	)

	local plaza = makePart(
		world,
		"SpawnPlaza",
		Vector3.new(26,0.8,28),
		CFrame.new(-96,-0.35,0),
		Color3.fromRGB(22,27,39),
		Enum.Material.Metal
	)

	for i=1,5 do
		local strip = makePart(
			world,
			"PlazaGlow_"..i,
			Vector3.new(0.35,0.12,22),
			CFrame.new(-105+(i-1)*4.5,0.1,0),
			i%2==0 and Color3.fromRGB(102,88,255) or Color3.fromRGB(76,222,212),
			Enum.Material.Neon
		)
		strip.CanCollide = false
	end

	createHubKiosk(world,"DailyKiosk","DAILY","daily",Vector3.new(-111,2.5,18),Color3.fromRGB(255,206,92))
	createHubKiosk(world,"PackKiosk","PACK SHOP","packs",Vector3.new(-101,2.5,18),Color3.fromRGB(120,101,255))
	createHubKiosk(world,"SocialKiosk","SOCIAL","social",Vector3.new(-91,2.5,18),Color3.fromRGB(88,221,211))
	createHubKiosk(world,"StoreKiosk","STORE","store",Vector3.new(-81,2.5,18),Color3.fromRGB(255,121,214))

	local road = makePart(
		world,
		"TowerRoad",
		Vector3.new(192,0.18,12),
		CFrame.new(18,0.02,0),
		Color3.fromRGB(30,36,50),
		Enum.Material.Metal
	)
	road.CanCollide = false
	for i=0,11 do
		local markerPart = makePart(
			world,
			"RoadGlow_"..i,
			Vector3.new(8,0.12,0.35),
			CFrame.new(-78+i*16,0.14,0),
			i%2==0 and Color3.fromRGB(105,91,255) or Color3.fromRGB(72,224,213),
			Enum.Material.Neon
		)
		markerPart.CanCollide = false
	end

	PlotsFolder = Instance.new("Folder")
	PlotsFolder.Name = "PlayerPlots"
	PlotsFolder.Parent = world

	local spawn = Workspace:FindFirstChild("CardBaseSpawn")
	if not spawn then
		spawn = Instance.new("SpawnLocation")
		spawn.Name = "CardBaseSpawn"
		spawn.Parent = world
	end
	spawn.Anchored = true
	spawn.Size = Vector3.new(10,1,10)
	spawn.Position = Vector3.new(-96,0.5,0)
	spawn.Neutral = true
	spawn.Duration = 0
	spawn.Material = Enum.Material.Neon
	spawn.Color = Color3.fromRGB(92,82,255)
	spawn.Transparency = 0.18

	local welcome = makePart(
		world,
		"WelcomeSign",
		Vector3.new(18,7,0.5),
		CFrame.new(-96,5,-13),
		Color3.fromRGB(12,15,23),
		Enum.Material.SmoothPlastic
	)
	welcome.CanCollide = false
	local signGui = Instance.new("SurfaceGui")
	signGui.Face = Enum.NormalId.Front
	signGui.CanvasSize = Vector2.new(720,280)
	signGui.AlwaysOnTop = true
	signGui.Parent = welcome
	makeText(signGui,"Title","CARD BASE",UDim2.fromScale(0.94,0.28),UDim2.fromScale(0.03,0.10),62,Color3.fromRGB(244,246,255))
	makeText(signGui,"Sub","ROLL · BUILD · ASCEND",UDim2.fromScale(0.94,0.18),UDim2.fromScale(0.03,0.42),28,Color3.fromRGB(112,236,224))
	makeText(signGui,"Hint","Your Card Tower is assigned when you join.",UDim2.fromScale(0.94,0.20),UDim2.fromScale(0.03,0.66),23,Color3.fromRGB(155,164,188))

	local serverBoard = makePart(
		world,
		"ServerLeaderboard",
		Vector3.new(18,10,0.6),
		CFrame.new(-80,5,-13),
		Color3.fromRGB(11,15,23),
		Enum.Material.SmoothPlastic
	)
	serverBoard.CanCollide = false
	local boardGui = Instance.new("SurfaceGui")
	boardGui.Face = Enum.NormalId.Front
	boardGui.CanvasSize = Vector2.new(760,620)
	boardGui.AlwaysOnTop = true
	boardGui.Parent = serverBoard
	ServerBoardGui = boardGui

	local boardTitle = makeText(boardGui,"Title","SERVER RANKING",UDim2.fromScale(0.92,0.11),UDim2.fromScale(0.04,0.04),42,Color3.fromRGB(246,248,255))
	boardTitle.TextXAlignment = Enum.TextXAlignment.Center
	local boardSub = makeText(boardGui,"Sub","ASCENSION · BASE · INCOME",UDim2.fromScale(0.92,0.07),UDim2.fromScale(0.04,0.14),20,Color3.fromRGB(104,235,224))
	boardSub.TextXAlignment = Enum.TextXAlignment.Center
	local rows = makeText(boardGui,"Rows","Waiting for players...",UDim2.fromScale(0.90,0.72),UDim2.fromScale(0.05,0.23),25,Color3.fromRGB(222,228,240))
	rows.Name = "Rows"
	rows.TextYAlignment = Enum.TextYAlignment.Top
	rows.TextWrapped = false
	rows.RichText = true

	local globalBoard = makePart(
		world,
		"GlobalLeaderboard",
		Vector3.new(18,10,0.6),
		CFrame.new(-112,5,-13),
		Color3.fromRGB(14,12,24),
		Enum.Material.SmoothPlastic
	)
	globalBoard.CanCollide = false
	local globalGui = Instance.new("SurfaceGui")
	globalGui.Face = Enum.NormalId.Front
	globalGui.CanvasSize = Vector2.new(760,620)
	globalGui.AlwaysOnTop = true
	globalGui.Parent = globalBoard
	GlobalBoardGui = globalGui
	local globalTitle = makeText(globalGui,"Title","GLOBAL PRESTIGE",UDim2.fromScale(0.92,0.11),UDim2.fromScale(0.04,0.04),42,Color3.fromRGB(255,242,181))
	globalTitle.TextXAlignment = Enum.TextXAlignment.Center
	local globalSub = makeText(globalGui,"Sub","TOP COLLECTORS",UDim2.fromScale(0.92,0.07),UDim2.fromScale(0.04,0.14),20,Color3.fromRGB(188,150,255))
	globalSub.TextXAlignment = Enum.TextXAlignment.Center
	local globalRows = makeText(globalGui,"Rows","Syncing global ranks...",UDim2.fromScale(0.90,0.72),UDim2.fromScale(0.05,0.23),24,Color3.fromRGB(229,225,242))
	globalRows.Name = "Rows"
	globalRows.TextYAlignment = Enum.TextYAlignment.Top
	globalRows.RichText = true

	ground:SetAttribute("CardBaseWorld",true)
	plaza:SetAttribute("CardBaseWorld",true)
end

local function createStand(model,origin,slot)
	local floor = math.floor((slot-1)/10)
	local within = (slot-1)%10
	local row = math.floor(within/5)
	local col = within%5
	local floorY = floor*18
	local x = (col-2)*6.2
	local z = row == 0 and -5 or 5

	local pedestal = makePart(
		model,
		string.format("Stand_%02d",slot),
		Vector3.new(5.1,1,3.2),
		CFrame.new(origin+Vector3.new(x,floorY+0.5,z)),
		Color3.fromRGB(35,40,52),
		Enum.Material.Metal
	)
	pedestal:SetAttribute("Slot",slot)

	local trim = makePart(
		pedestal,
		"Trim",
		Vector3.new(5.25,0.14,3.35),
		CFrame.new(origin+Vector3.new(x,floorY+1.03,z)),
		Color3.fromRGB(82,91,116),
		Enum.Material.Neon
	)
	trim.CanCollide = false

	local board = makePart(
		pedestal,
		"CardBoard",
		Vector3.new(4.8,6.6,0.35),
		CFrame.new(origin+Vector3.new(x,floorY+4.2,z)),
		Color3.fromRGB(19,22,31),
		Enum.Material.SmoothPlastic
	)
	board.CanCollide = false

	local gui = Instance.new("SurfaceGui")
	gui.Name = "CardGui"
	gui.Face = Enum.NormalId.Front
	gui.CanvasSize = Vector2.new(480,660)
	gui.AlwaysOnTop = true
	gui.Parent = board

	local art = Instance.new("Frame")
	art.Name = "Art"
	art.BorderSizePixel = 0
	art.BackgroundColor3 = Color3.fromRGB(25,29,42)
	art.Size = UDim2.fromScale(0.90,0.48)
	art.Position = UDim2.fromScale(0.05,0.16)
	art.Parent = gui
	local artCorner = Instance.new("UICorner")
	artCorner.CornerRadius = UDim.new(0,18)
	artCorner.Parent = art
	local gradient = Instance.new("UIGradient")
	gradient.Name = "TierGradient"
	gradient.Rotation = 35
	gradient.Color = ColorSequence.new(Color3.fromRGB(37,42,58),Color3.fromRGB(18,21,31))
	gradient.Parent = art
	makeText(art,"BigId","—",UDim2.fromScale(0.90,0.50),UDim2.fromScale(0.05,0.22),72,Color3.fromRGB(220,225,238)).TextXAlignment = Enum.TextXAlignment.Center

	makeText(gui,"Slot","SLOT "..slot,UDim2.fromScale(0.9,0.08),UDim2.fromScale(0.05,0.03),30,Color3.fromRGB(140,149,170))
	makeText(gui,"Main","EMPTY",UDim2.fromScale(0.9,0.14),UDim2.fromScale(0.05,0.66),42,Color3.new(1,1,1))
	makeText(gui,"Meta","",UDim2.fromScale(0.9,0.18),UDim2.fromScale(0.05,0.80),23,Color3.fromRGB(190,198,214))

	local prompt = Instance.new("ProximityPrompt")
	prompt.Name = "ManagePrompt"
	prompt.ActionText = "Manage Card"
	prompt.ObjectText = "Stand "..slot
	prompt.KeyboardKeyCode = Enum.KeyCode.E
	prompt.MaxActivationDistance = 12
	prompt.HoldDuration = 0
	prompt.RequiresLineOfSight = false
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

	local light = Instance.new("PointLight")
	light.Name = "TierLight"
	light.Enabled = false
	light.Brightness = 0.8
	light.Range = 8
	light.Shadows = false
	light.Parent = board
end

local function createElevatorStop(model,origin,floor)
	local y = (floor-1)*18
	local platform = makePart(
		model,
		"ElevatorFloor_"..floor,
		Vector3.new(4.7,0.5,5.4),
		CFrame.new(origin+Vector3.new(15.1,y+0.35,0)),
		Color3.fromRGB(35,40,55),
		Enum.Material.Metal
	)
	local glow = makePart(
		platform,
		"Glow",
		Vector3.new(4.25,0.10,4.9),
		CFrame.new(origin+Vector3.new(15.1,y+0.66,0)),
		Color3.fromRGB(91,226,215),
		Enum.Material.Neon
	)
	glow.CanCollide = false

	local labelGui = Instance.new("BillboardGui")
	labelGui.Name = "ElevatorLabel"
	labelGui.Size = UDim2.new(0,180,0,50)
	labelGui.StudsOffset = Vector3.new(0,2.2,0)
	labelGui.AlwaysOnTop = true
	labelGui.Parent = platform
	local label = makeText(labelGui,"Text","FLOOR "..floor,UDim2.fromScale(1,1),UDim2.new(),20,Color3.fromRGB(225,249,247))
	label.TextXAlignment = Enum.TextXAlignment.Center

	if floor < Config.BaseFloorCount then
		local up = Instance.new("ProximityPrompt")
		up.Name = "GoUp"
		up.ActionText = "Go to Floor "..(floor+1)
		up.ObjectText = "Tower Elevator"
		up.KeyboardKeyCode = Enum.KeyCode.E
		up.MaxActivationDistance = 10
		up.HoldDuration = 0
		up.RequiresLineOfSight = false
		up.Parent = platform
		up.Triggered:Connect(function(player)
			teleportCharacter(player,origin+Vector3.new(15.1,floor*18+3,0))
		end)
	end

	if floor > 1 then
		local down = Instance.new("ProximityPrompt")
		down.Name = "GoDown"
		down.ActionText = "Go to Floor "..(floor-1)
		down.ObjectText = "Tower Elevator"
		down.KeyboardKeyCode = Enum.KeyCode.Q
		down.GamepadKeyCode = Enum.KeyCode.ButtonY
		down.MaxActivationDistance = 10
		down.HoldDuration = 0
		down.RequiresLineOfSight = false
		down.Parent = platform
		down.Triggered:Connect(function(player)
			teleportCharacter(player,origin+Vector3.new(15.1,(floor-2)*18+3,0))
		end)
	end
end

local function buildPlot(player,slotIndex)
	local origin = PlotOrigins[slotIndex]
	local model = Instance.new("Model")
	model.Name = "Plot_"..player.UserId
	model:SetAttribute("OwnerUserId",player.UserId)
	model:SetAttribute("PlotSlot",slotIndex)
	model.Parent = PlotsFolder

	makePart(
		model,
		"PlotBase",
		Vector3.new(42,1.2,30),
		CFrame.new(origin+Vector3.new(0,-0.4,0)),
		Color3.fromRGB(27,33,47),
		Enum.Material.Slate
	)

	for floor=0,2 do
		local slab = makePart(
			model,
			"Floor_"..(floor+1),
			Vector3.new(36,1,24),
			CFrame.new(origin+Vector3.new(0,floor*18,0)),
			Color3.fromRGB(34+floor*4,41+floor*4,57+floor*5),
			Enum.Material.Metal
		)

		local backRail = makePart(
			model,
			"BackRail_"..(floor+1),
			Vector3.new(36,3,0.6),
			CFrame.new(origin+Vector3.new(0,floor*18+2.0,11.7)),
			Color3.fromRGB(55,67,92),
			Enum.Material.Neon
		)
		backRail.CanCollide = false

		for _,side in ipairs({-1,1}) do
			local sideRail = makePart(
				model,
				"SideRail_"..(floor+1).."_"..side,
				Vector3.new(0.45,2.1,24),
				CFrame.new(origin+Vector3.new(side*17.8,floor*18+1.55,0)),
				Color3.fromRGB(45,53,72),
				Enum.Material.Metal
			)
			sideRail.CanCollide = false
		end

		local floorSign = makePart(
			model,
			"FloorSign_"..(floor+1),
			Vector3.new(5.2,2.2,0.25),
			CFrame.new(origin+Vector3.new(-14.8,floor*18+2.2,-11.65)),
			Color3.fromRGB(13,17,26),
			Enum.Material.SmoothPlastic
		)
		floorSign.CanCollide = false
		local fgui = Instance.new("SurfaceGui")
		fgui.Face = Enum.NormalId.Front
		fgui.CanvasSize = Vector2.new(420,160)
		fgui.AlwaysOnTop = true
		fgui.Parent = floorSign
		local ft = makeText(fgui,"Text","FLOOR "..(floor+1),UDim2.fromScale(1,1),UDim2.new(),52,Color3.fromRGB(120,239,228))
		ft.TextXAlignment = Enum.TextXAlignment.Center

		if floor > 0 then
			for _,x in ipairs({-17.2,17.2}) do
				local pillar = makePart(
					model,
					"Pillar_"..floor.."_"..x,
					Vector3.new(0.7,18,0.7),
					CFrame.new(origin+Vector3.new(x,floor*18-9,11.1)),
					Color3.fromRGB(48,57,77),
					Enum.Material.Metal
				)
				pillar.CanCollide = false
			end
		end
	end

	for stand=1,Config.MaxStandSlots do createStand(model,origin,stand) end
	for floor=1,Config.BaseFloorCount do
		createElevatorStop(model,origin,floor)
		local y = (floor-1)*18
		local beacon = makePart(
			model,
			"FloorBeacon_"..floor,
			Vector3.new(0.7,0.7,0.7),
			CFrame.new(origin+Vector3.new(0,y+9.5,9.8)),
			Color3.fromRGB(101,232,221),
			Enum.Material.Neon
		)
		beacon.CanCollide = false
		local light = Instance.new("PointLight")
		light.Name = "FloorLight"
		light.Color = Color3.fromRGB(169,222,255)
		light.Brightness = 2.2
		light.Range = 28
		light.Shadows = false
		light.Parent = beacon
	end

	local frontLeft = makePart(model,"EntrancePostL",Vector3.new(0.7,8,0.7),CFrame.new(origin+Vector3.new(-8,4,-11.5)),Color3.fromRGB(94,87,255),Enum.Material.Neon)
	local frontRight = makePart(model,"EntrancePostR",Vector3.new(0.7,8,0.7),CFrame.new(origin+Vector3.new(8,4,-11.5)),Color3.fromRGB(91,232,219),Enum.Material.Neon)
	local frontTop = makePart(model,"EntranceTop",Vector3.new(16.7,0.7,0.7),CFrame.new(origin+Vector3.new(0,8,-11.5)),Color3.fromRGB(116,105,255),Enum.Material.Neon)
	frontLeft.CanCollide=false; frontRight.CanCollide=false; frontTop.CanCollide=false

	local frontSign = makePart(model,"FrontTowerSign",Vector3.new(12,3.1,0.35),CFrame.new(origin+Vector3.new(0,10.1,-11.4)),Color3.fromRGB(17,21,32),Enum.Material.SmoothPlastic)
	frontSign.CanCollide = false
	local frontGui = Instance.new("SurfaceGui")
	frontGui.Face = Enum.NormalId.Front
	frontGui.CanvasSize = Vector2.new(720,190)
	frontGui.AlwaysOnTop = true
	frontGui.Parent = frontSign
	local frontTitle = makeText(frontGui,"Title","CARD TOWER",UDim2.fromScale(0.94,0.48),UDim2.fromScale(0.03,0.05),48,Color3.fromRGB(242,245,255))
	frontTitle.TextXAlignment = Enum.TextXAlignment.Center
	local frontSub = makeText(frontGui,"Sub","30 STANDS · 3 FLOORS",UDim2.fromScale(0.94,0.30),UDim2.fromScale(0.03,0.57),23,Color3.fromRGB(99,235,223))
	frontSub.TextXAlignment = Enum.TextXAlignment.Center

	local sign = makePart(
		model,
		"OwnerSign",
		Vector3.new(18,5,0.5),
		CFrame.new(origin+Vector3.new(0,6,12)),
		Color3.fromRGB(12,15,22),
		Enum.Material.SmoothPlastic
	)
	sign.CanCollide = false
	local gui = Instance.new("SurfaceGui")
	gui.Face = Enum.NormalId.Front
	gui.CanvasSize = Vector2.new(720,200)
	gui.AlwaysOnTop = true
	gui.Parent = sign
	makeText(gui,"Owner",player.DisplayName,UDim2.fromScale(0.94,0.40),UDim2.fromScale(0.03,0.04),46,Color3.new(1,1,1))
	makeText(gui,"Title","Loading...",UDim2.fromScale(0.94,0.27),UDim2.fromScale(0.03,0.45),28,Color3.fromRGB(164,229,220))
	makeText(gui,"Income","0/s",UDim2.fromScale(0.94,0.20),UDim2.fromScale(0.03,0.72),24,Color3.fromRGB(255,231,143))

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
		gui.Income.Text = string.format("%.0f/s",Economy.TotalIncome(profile,entitlements))
		sign.Color = profile.Ascension >= 10 and Color3.fromRGB(34,25,50)
			or profile.Ascension >= 3 and Color3.fromRGB(15,31,38)
			or Color3.fromRGB(12,15,22)
	end

	for _,name in ipairs({"EntrancePostL","EntrancePostR","EntranceTop"}) do
		local entrance=model:FindFirstChild(name)
		if entrance then
			if entitlements.ShowcasePro then
				entrance.Color = name=="EntrancePostR" and Color3.fromRGB(100,255,230) or Color3.fromRGB(185,114,255)
				entrance.Material = Enum.Material.Neon
			else
				entrance.Color = name=="EntrancePostR" and Color3.fromRGB(91,232,219) or Color3.fromRGB(106,94,255)
			end
		end
	end

	for floor=1,Config.BaseFloorCount do
		local rail = model:FindFirstChild("BackRail_"..floor)
		if rail then
			rail.Color = profile.Ascension >= 10 and Color3.fromRGB(190,111,255)
				or profile.Ascension >= 3 and Color3.fromRGB(90,236,223)
				or Color3.fromRGB(55,67,92)
		end
	end

	for slot=1,Config.MaxStandSlots do
		local pedestal = model:FindFirstChild(string.format("Stand_%02d",slot))
		if not pedestal then continue end
		local board = pedestal:FindFirstChild("CardBoard")
		local gui = board and board:FindFirstChild("CardGui")
		local art = gui and gui:FindFirstChild("Art")
		local prompt = pedestal:FindFirstChild("ManagePrompt")
		local trim = pedestal:FindFirstChild("Trim")
		local light = board and board:FindFirstChild("TierLight")
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
			if art then
				art.BackgroundColor3 = Color3.fromRGB(14,16,22)
				art.BigId.Text = "LOCK"
				art.BigId.TextColor3 = Color3.fromRGB(72,76,88)
			end
			if trim then trim.Color = Color3.fromRGB(43,46,56) end
			if light then light.Enabled = false end
			if prompt then prompt.Enabled = false end
		elseif not card then
			board.Color = Color3.fromRGB(24,29,39)
			gui.Main.Text = "EMPTY"
			gui.Main.TextColor3 = Color3.fromRGB(200,207,219)
			gui.Meta.Text = "Press E to place a card"
			gui.Slot.Text = "SLOT "..slot
			if art then
				art.BackgroundColor3 = Color3.fromRGB(25,29,42)
				art.BigId.Text = "+"
				art.BigId.TextColor3 = Color3.fromRGB(114,124,151)
			end
			if trim then trim.Color = Color3.fromRGB(82,91,116) end
			if light then light.Enabled = false end
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
			if art then
				art.BackgroundColor3 = tier.color:Lerp(Color3.fromRGB(12,15,23),0.65)
				art.BigId.Text = string.format("#%04d",card.Id)
				art.BigId.TextColor3 = tier.color:Lerp(Color3.new(1,1,1),0.45)
				local grad = art:FindFirstChild("TierGradient")
				if grad then
					grad.Color = ColorSequence.new(tier.color:Lerp(Color3.new(1,1,1),0.20),tier.color:Lerp(Color3.fromRGB(8,10,16),0.72))
				end
			end
			if trim then trim.Color = mutationColor(card) end
			if prompt then prompt.Enabled = true end
			if light then
				light.Enabled = (card.Tier or 0) >= 6 or (card.Mutation2 or 0) > 0 or (card.Awakening or 0) > 0
				light.Color = mutationColor(card)
				light.Brightness = (card.Awakening or 0) > 0 and 1.55 or 0.8
			end

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

function PlotService.RenderGlobalLeaderboard(rows)
	if not GlobalBoardGui then return end
	local label = GlobalBoardGui:FindFirstChild("Rows")
	if not label then return end
	local lines = {}
	for index,entry in ipairs(rows or {}) do
		if index > 8 then break end
		local rank = tonumber(entry.Rank) or index
		local medal = rank == 1 and "🥇" or rank == 2 and "🥈" or rank == 3 and "🥉" or ("#"..rank)
		local asc = (tonumber(entry.Ascension) or 0) > 0 and ("ASC "..require(script.Parent.BaseService).Roman(entry.Ascension)) or "ASC —"
		table.insert(lines,string.format("%s  %s\n     %s · Base %d · %s/s",medal,tostring(entry.DisplayName or entry.Name or "Collector"),asc,tonumber(entry.BaseLevel) or 1,compactNumber(entry.Income)))
	end
	label.Text = #lines > 0 and table.concat(lines,"\n\n") or "No global ranking data yet."
end

function PlotService.RenderServerLeaderboard()
	if not ServerBoardGui then return end
	local rowsLabel = ServerBoardGui:FindFirstChild("Rows")
	if not rowsLabel then return end

	local entries = {}
	for _,player in ipairs(Players:GetPlayers()) do
		local profile = DataService and DataService.Get(player)
		if profile then
			local entitlements = MonetizationService and MonetizationService.GetEntitlements(player) or {}
			table.insert(entries,{
				Player = player,
				Ascension = math.max(0,math.floor(tonumber(profile.Ascension) or 0)),
				BaseLevel = math.max(1,math.floor(tonumber(profile.BaseLevel) or 1)),
				Income = Economy.TotalIncome(profile,entitlements),
			})
		end
	end

	table.sort(entries,function(a,b)
		if a.Ascension ~= b.Ascension then return a.Ascension > b.Ascension end
		if a.BaseLevel ~= b.BaseLevel then return a.BaseLevel > b.BaseLevel end
		return a.Income > b.Income
	end)

	local lines = {}
	for rank,entry in ipairs(entries) do
		if rank > 8 then break end
		local medal = rank == 1 and "🥇" or rank == 2 and "🥈" or rank == 3 and "🥉" or ("#"..rank)
		local asc = entry.Ascension > 0 and ("ASC "..require(script.Parent.BaseService).Roman(entry.Ascension)) or "ASC —"
		table.insert(lines,string.format("%s  %s\n     %s · Base %d · %s/s",medal,entry.Player.DisplayName,asc,entry.BaseLevel,compactNumber(entry.Income)))
	end
	rowsLabel.Text = #lines > 0 and table.concat(lines,"\n\n") or "Waiting for players..."
end

function PlotService.TeleportHub(player)
	return teleportCharacter(player,Vector3.new(-96,3,3),Vector3.new(-96,3,18))
end

function PlotService.TeleportHome(player)
	local slot = SlotByUser[player.UserId]
	local origin = slot and PlotOrigins[slot]
	if not origin then return false end
	return teleportCharacter(player,origin+Vector3.new(0,3,-22),origin+Vector3.new(0,4,0))
end

function PlotService.TeleportFloor(player,floor)
	floor = math.clamp(math.floor(tonumber(floor) or 1),1,Config.BaseFloorCount)
	local slot = SlotByUser[player.UserId]
	local origin = slot and PlotOrigins[slot]
	if not origin then return false end
	local y = (floor-1)*18
	return teleportCharacter(player,origin+Vector3.new(0,y+3,-8),origin+Vector3.new(0,y+4,0))
end

function PlotService.TeleportToPlayer(player,targetUserId)
	targetUserId = tonumber(targetUserId)
	if not targetUserId or targetUserId == player.UserId then return false end
	local target = Players:GetPlayerByUserId(targetUserId)
	if not target then return false end
	local slot = SlotByUser[targetUserId]
	local origin = slot and PlotOrigins[slot]
	if not origin then return false end
	return teleportCharacter(player,origin+Vector3.new(0,3,-22),origin+Vector3.new(0,6,0))
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
	local origin = PlotOrigins[chosen]
	player:SetAttribute("CardBasePlotX",origin.X)
	player:SetAttribute("CardBasePlotY",origin.Y)
	player:SetAttribute("CardBasePlotZ",origin.Z)
	local model = buildPlot(player,chosen)
	PlotService.Render(player)

	if CharacterConnections[player.UserId] then CharacterConnections[player.UserId]:Disconnect() end
	CharacterConnections[player.UserId] = player.CharacterAdded:Connect(function()
		task.wait(0.8)
		PlotService.TeleportHome(player)
	end)
	if player.Character then
		task.defer(function()
			task.wait(0.35)
			PlotService.TeleportHome(player)
		end)
	end
	return model
end

function PlotService.Remove(player)
	local model = PlotByUser[player.UserId]
	if model then model:Destroy() end
	PlotByUser[player.UserId] = nil
	local slot = SlotByUser[player.UserId]
	if slot then UserBySlot[slot] = nil end
	SlotByUser[player.UserId] = nil
	if CharacterConnections[player.UserId] then
		CharacterConnections[player.UserId]:Disconnect()
		CharacterConnections[player.UserId] = nil
	end
end

function PlotService.Start(dataService,monetizationService,remotes)
	DataService = dataService
	MonetizationService = monetizationService
	Remotes = remotes
	buildWorldShell()
	Players.PlayerRemoving:Connect(function(player)
		PlotService.Remove(player)
		task.defer(PlotService.RenderServerLeaderboard)
	end)

	task.spawn(function()
		while task.wait(3) do
			PlotService.RenderServerLeaderboard()
		end
	end)
end

return PlotService
