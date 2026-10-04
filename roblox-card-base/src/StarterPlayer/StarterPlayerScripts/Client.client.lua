local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")

local player = Players.LocalPlayer
local Root = ReplicatedStorage:WaitForChild("CardBase")
local Config = require(Root.Shared.GameConfig)
local Economy = require(Root.Shared.Economy)
local Remotes = Root:WaitForChild("Remotes")
local Action = Remotes:WaitForChild("Action")
local StateEvent = Remotes:WaitForChild("State")
local ToastEvent = Remotes:WaitForChild("Toast")
local OpenStandEvent = Remotes:WaitForChild("OpenStand")

local state = nil
local selectedSlot = nil
local mutationTargetGuid = nil
local activePanel = nil
local busy = false

local COLORS = {
	bg = Color3.fromRGB(8,10,16),
	panel = Color3.fromRGB(16,19,28),
	panel2 = Color3.fromRGB(23,28,40),
	line = Color3.fromRGB(48,56,74),
	text = Color3.fromRGB(242,245,252),
	muted = Color3.fromRGB(142,151,173),
	accent = Color3.fromRGB(120,101,255),
	accent2 = Color3.fromRGB(91,232,219),
	gold = Color3.fromRGB(255,235,157),
	danger = Color3.fromRGB(255,92,114),
}

local function fmt(n)
	n = tonumber(n) or 0
	if math.abs(n) < 1000 then return string.format("%.0f",n) end
	local units = {"K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"}
	local index = math.floor(math.log10(math.abs(n))/3)
	if index <= #units then
		local v = n/(1000^index)
		return string.format(v >= 100 and "%.0f%s" or v >= 10 and "%.1f%s" or "%.2f%s",v,units[index])
	end
	return string.format("%.2e",n)
end

local function corner(instance,radius)
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0,radius or 10)
	c.Parent = instance
end

local function stroke(instance,color,transparency,thickness)
	local s = Instance.new("UIStroke")
	s.Color = color or COLORS.line
	s.Transparency = transparency or 0
	s.Thickness = thickness or 1
	s.Parent = instance
end

local function padding(instance,left,right,top,bottom)
	local p = Instance.new("UIPadding")
	p.PaddingLeft = UDim.new(0,left or 0)
	p.PaddingRight = UDim.new(0,right or left or 0)
	p.PaddingTop = UDim.new(0,top or left or 0)
	p.PaddingBottom = UDim.new(0,bottom or top or left or 0)
	p.Parent = instance
end

local function makeLabel(parent,text,size,pos,textSize,color,bold)
	local t = Instance.new("TextLabel")
	t.BackgroundTransparency = 1
	t.Size = size
	t.Position = pos or UDim2.new()
	t.Text = text or ""
	t.TextColor3 = color or COLORS.text
	t.TextSize = textSize or 14
	t.Font = bold and Enum.Font.GothamBold or Enum.Font.Gotham
	t.TextXAlignment = Enum.TextXAlignment.Left
	t.TextYAlignment = Enum.TextYAlignment.Center
	t.Parent = parent
	return t
end

local function makeButton(parent,text,size,pos)
	local b = Instance.new("TextButton")
	b.AutoButtonColor = true
	b.BackgroundColor3 = COLORS.panel2
	b.Size = size
	b.Position = pos or UDim2.new()
	b.Text = text
	b.TextColor3 = COLORS.text
	b.TextSize = 13
	b.Font = Enum.Font.GothamBold
	b.Parent = parent
	corner(b,10)
	stroke(b,COLORS.line,0.15,1)
	return b
end

local gui = Instance.new("ScreenGui")
gui.Name = "CardBaseUI"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = false
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
gui.Parent = player:WaitForChild("PlayerGui")

local top = Instance.new("Frame")
top.Name = "TopBar"
top.BackgroundColor3 = Color3.fromRGB(10,12,19)
top.BackgroundTransparency = 0.05
top.Size = UDim2.new(1,-24,0,74)
top.Position = UDim2.new(0,12,0,10)
top.Parent = gui
corner(top,15)
stroke(top,COLORS.line,0.15,1)

local brand = makeLabel(top,"CARD BASE",UDim2.new(0,160,0,26),UDim2.new(0,16,0,10),18,COLORS.text,true)
local subtitle = makeLabel(top,"ROBLOX · SERVER AUTHORITY",UDim2.new(0,220,0,18),UDim2.new(0,16,0,38),9,COLORS.muted,true)

local hintBar = Instance.new("TextLabel")
hintBar.Name = "ProgressHint"
hintBar.AnchorPoint = Vector2.new(0.5,0)
hintBar.Position = UDim2.new(0.5,0,0,92)
hintBar.Size = UDim2.new(0,560,0,36)
hintBar.BackgroundColor3 = Color3.fromRGB(14,18,27)
hintBar.BackgroundTransparency = 0.08
hintBar.Text = "Loading collector profile..."
hintBar.TextColor3 = COLORS.accent2
hintBar.TextSize = 11
hintBar.Font = Enum.Font.GothamBold
hintBar.TextWrapped = true
hintBar.Parent = gui
corner(hintBar,12)
stroke(hintBar,COLORS.line,0.28,1)

local stats = Instance.new("Frame")
stats.BackgroundTransparency = 1
stats.Size = UDim2.new(1,-210,1,-12)
stats.Position = UDim2.new(0,200,0,6)
stats.Parent = top
local grid = Instance.new("UIGridLayout")
grid.CellPadding = UDim2.new(0,6,0,0)
grid.CellSize = UDim2.new(0.245,-5,1,0)
grid.FillDirectionMaxCells = 4
grid.Parent = stats

local statLabels = {}
for _,key in ipairs({"Money","Income","Base","Ascension"}) do
	local box = Instance.new("Frame")
	box.BackgroundColor3 = COLORS.panel
	box.Parent = stats
	corner(box,10)
	stroke(box,COLORS.line,0.4,1)
	local k = makeLabel(box,string.upper(key),UDim2.new(1,-12,0,18),UDim2.new(0,8,0,6),8,COLORS.muted,true)
	local v = makeLabel(box,"—",UDim2.new(1,-12,0,28),UDim2.new(0,8,0,26),15,COLORS.text,true)
	statLabels[key] = v
end

local actionBar = Instance.new("Frame")
actionBar.BackgroundColor3 = Color3.fromRGB(10,12,19)
actionBar.Size = UDim2.new(0,640,0,64)
actionBar.AnchorPoint = Vector2.new(0.5,1)
actionBar.Position = UDim2.new(0.5,0,1,-16)
actionBar.Parent = gui
corner(actionBar,15)
stroke(actionBar,COLORS.line,0.15,1)
padding(actionBar,8,8,8,8)

local actionLayout = Instance.new("UIGridLayout")
actionLayout.CellPadding = UDim2.new(0,7,0,0)
actionLayout.CellSize = UDim2.new(0.158,-2,1,0)
actionLayout.FillDirectionMaxCells = 6
actionLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
actionLayout.Parent = actionBar

local rollBtn = makeButton(actionBar,"◇ ROLL PACK",UDim2.new(),UDim2.new())
rollBtn.BackgroundColor3 = COLORS.accent
local baseBtn = makeButton(actionBar,"⌂ BASE",UDim2.new(),UDim2.new())
local collectionBtn = makeButton(actionBar,"▦ CARDS",UDim2.new(),UDim2.new())
local endgameBtn = makeButton(actionBar,"✦ ENDGAME",UDim2.new(),UDim2.new())
local packShopBtn = makeButton(actionBar,"▣ PACKS",UDim2.new(),UDim2.new())
local storeBtn = makeButton(actionBar,"R$ STORE",UDim2.new(),UDim2.new())

local overlay = Instance.new("Frame")
overlay.Name = "Overlay"
overlay.Visible = false
overlay.BackgroundColor3 = Color3.new(0,0,0)
overlay.BackgroundTransparency = 0.28
overlay.Size = UDim2.fromScale(1,1)
overlay.ZIndex = 20
overlay.Parent = gui

local panel = Instance.new("Frame")
panel.Name = "Panel"
panel.BackgroundColor3 = COLORS.panel
panel.Size = UDim2.new(0.78,0,0.78,0)
panel.AnchorPoint = Vector2.new(0.5,0.5)
panel.Position = UDim2.fromScale(0.5,0.5)
panel.ZIndex = 21
panel.Parent = overlay
corner(panel,18)
stroke(panel,COLORS.line,0,1)

local panelTitle = makeLabel(panel,"PANEL",UDim2.new(1,-90,0,40),UDim2.new(0,18,0,10),20,COLORS.text,true)
panelTitle.ZIndex = 22
local panelSub = makeLabel(panel,"",UDim2.new(1,-100,0,25),UDim2.new(0,18,0,48),10,COLORS.muted,false)
panelSub.ZIndex = 22
local closeBtn = makeButton(panel,"✕",UDim2.new(0,42,0,42),UDim2.new(1,-56,0,12))
closeBtn.ZIndex = 22

local content = Instance.new("ScrollingFrame")
content.Name = "Content"
content.BackgroundTransparency = 1
content.BorderSizePixel = 0
content.Size = UDim2.new(1,-24,1,-92)
content.Position = UDim2.new(0,12,0,82)
content.ScrollBarThickness = 5
content.ScrollBarImageColor3 = COLORS.accent2
content.AutomaticCanvasSize = Enum.AutomaticSize.Y
content.CanvasSize = UDim2.new()
content.ZIndex = 22
content.Parent = panel
padding(content,6,8,6,16)

local listLayout = Instance.new("UIListLayout")
listLayout.Padding = UDim.new(0,8)
listLayout.SortOrder = Enum.SortOrder.LayoutOrder
listLayout.Parent = content

local toast = Instance.new("TextLabel")
toast.Visible = false
toast.AnchorPoint = Vector2.new(0.5,0)
toast.Position = UDim2.new(0.5,0,0,94)
toast.Size = UDim2.new(0,420,0,44)
toast.BackgroundColor3 = COLORS.panel2
toast.TextColor3 = COLORS.text
toast.TextSize = 13
toast.Font = Enum.Font.GothamBold
toast.ZIndex = 100
toast.Parent = gui
corner(toast,12)
stroke(toast,COLORS.line,0.1,1)

local reveal = Instance.new("Frame")
reveal.Visible = false
reveal.AnchorPoint = Vector2.new(0.5,0.5)
reveal.Position = UDim2.fromScale(0.5,0.5)
reveal.Size = UDim2.new(0,360,0,430)
reveal.BackgroundColor3 = COLORS.panel
reveal.ZIndex = 80
reveal.Parent = gui
corner(reveal,18)
stroke(reveal,COLORS.accent2,0.1,2)
local revealTitle = makeLabel(reveal,"YOU GOT",UDim2.new(1,-30,0,30),UDim2.new(0,15,0,15),12,COLORS.muted,true)
revealTitle.ZIndex = 81
local revealMain = makeLabel(reveal,"",UDim2.new(1,-30,0,170),UDim2.new(0,15,0,75),28,COLORS.text,true)
revealMain.TextWrapped = true
revealMain.TextXAlignment = Enum.TextXAlignment.Center
revealMain.ZIndex = 81
local revealMeta = makeLabel(reveal,"",UDim2.new(1,-30,0,90),UDim2.new(0,15,0,250),13,COLORS.muted,false)
revealMeta.TextWrapped = true
revealMeta.TextXAlignment = Enum.TextXAlignment.Center
revealMeta.ZIndex = 81
local revealClose = makeButton(reveal,"เก็บเข้าคลัง",UDim2.new(1,-30,0,48),UDim2.new(0,15,1,-64))
revealClose.BackgroundColor3 = COLORS.accent
revealClose.ZIndex = 81

local function showToast(message,good)
	toast.Text = tostring(message)
	toast.TextColor3 = good and COLORS.accent2 or COLORS.text
	toast.Visible = true
	local stamp = os.clock()
	toast:SetAttribute("Stamp",stamp)
	task.delay(2.8,function()
		if toast:GetAttribute("Stamp") == stamp then toast.Visible = false end
	end)
end

local function clearContent()
	for _,child in ipairs(content:GetChildren()) do
		if child ~= listLayout and not child:IsA("UIPadding") then child:Destroy() end
	end
end

local function invoke(action,args)
	if busy then return nil end
	busy = true
	local ok,response = pcall(Action.InvokeServer,Action,action,args or {})
	busy = false
	if not ok then
		showToast("Server error: "..tostring(response),false)
		return nil
	end
	if not response.ok then
		showToast(response.error or "ทำรายการไม่สำเร็จ",false)
		return nil
	end
	return response.data
end

local function frameHomeCamera(duration)
	local camera = workspace.CurrentCamera
	if not camera then return end
	local x = player:GetAttribute("CardBasePlotX")
	local y = player:GetAttribute("CardBasePlotY")
	local z = player:GetAttribute("CardBasePlotZ")
	if x == nil or z == nil then return end
	y = tonumber(y) or 0
	local oldFov = camera.FieldOfView
	local target = Vector3.new(x,y+20,z+1)
	local eye = Vector3.new(x,y+35,z-62)
	camera.FieldOfView = 72
	camera.CameraType = Enum.CameraType.Scriptable
	camera.CFrame = CFrame.lookAt(eye,target)
	task.delay(duration or 1.8,function()
		if workspace.CurrentCamera == camera then
			camera.CameraType = Enum.CameraType.Custom
			camera.FieldOfView = oldFov
		end
	end)
end

local function cardMutationText(card)
	local names = {}
	for _,id in ipairs({card.Mutation1,card.Mutation2}) do
		id = tonumber(id) or 0
		if id > 0 and Config.Mutations[id] then table.insert(names,Config.Mutations[id].name) end
	end
	return #names > 0 and table.concat(names," + ") or "Normal"
end

local function cardMutationIds(card)
	local out,seen = {},{}
	for _,id in ipairs({tonumber(card.Mutation1) or 0,tonumber(card.Mutation2) or 0}) do
		id = math.floor(id)
		if id > 0 and Config.Mutations[id] and not seen[id] then
			seen[id] = true
			table.insert(out,id)
		end
	end
	return out
end

local function isGuidPlaced(guid)
	for _,placedGuid in pairs(state and state.Placed or {}) do
		if placedGuid == guid then return true end
	end
	return false
end

local function mutationSingleChance(target,donor)
	local occupied = #cardMutationIds(target)
	local base = occupied > 0 and 0.18 or 0.38
	local diff = (tonumber(donor.Tier) or 0)-(tonumber(target.Tier) or 0)
	local tierFactor = diff >= 0 and math.min(1.82,1+(diff*0.18)) or (0.72 ^ math.abs(diff))
	return math.clamp(base*tierFactor,0.01,0.78)
end

local function mutationBestDonors(target,mutationId)
	local donors = {}
	for guid,card in pairs(state and state.Cards or {}) do
		if guid ~= target.Guid and not card.Locked and not isGuidPlaced(guid) then
			for _,id in ipairs(cardMutationIds(card)) do
				if id == mutationId then
					table.insert(donors,card)
					break
				end
			end
		end
	end
	table.sort(donors,function(a,b)
		return mutationSingleChance(target,a) > mutationSingleChance(target,b)
	end)
	while #donors > 3 do table.remove(donors) end
	return donors
end

local function mutationCombinedChance(target,donors)
	local fail = 1
	for _,donor in ipairs(donors) do fail *= (1-mutationSingleChance(target,donor)) end
	return math.min(0.95,1-fail)
end

local openMutationLab

local function makeSectionHeader(text,sub)
	local holder = Instance.new("Frame")
	holder.BackgroundTransparency = 1
	holder.Size = UDim2.new(1,-4,0,48)
	holder.ZIndex = 23
	holder.Parent = content
	local a = makeLabel(holder,text,UDim2.new(1,0,0,25),UDim2.new(),14,COLORS.text,true)
	a.ZIndex = 24
	local b = makeLabel(holder,sub or "",UDim2.new(1,0,0,20),UDim2.new(0,0,0,26),9,COLORS.muted,false)
	b.ZIndex = 24
	return holder
end

local function makeCardRow(card,mode)
	local tier = Config.Tiers[(card.Tier or 0)+1]
	local grade = Config.Grades[(card.Grade or 0)+1]
	local row = Instance.new("Frame")
	row.BackgroundColor3 = COLORS.panel2
	row.Size = UDim2.new(1,-4,0,132)
	row.ZIndex = 23
	row.Parent = content
	corner(row,12)
	stroke(row,tier.color,0.45,1)

	local accent = Instance.new("Frame")
	accent.BorderSizePixel = 0
	accent.BackgroundColor3 = tier.color
	accent.Size = UDim2.new(0,5,1,-12)
	accent.Position = UDim2.new(0,6,0,6)
	accent.ZIndex = 24
	accent.Parent = row
	corner(accent,5)

	local title = makeLabel(row,string.format("#%04d · %s · %s",card.Id,tier.name,grade.name),UDim2.new(0.48,0,0,23),UDim2.new(0,22,0,9),13,COLORS.text,true)
	title.ZIndex = 24
	local meta = makeLabel(row,"Lv."..card.Level.." · "..cardMutationText(card)..((card.Awakening or 0)>0 and (" · AWAKEN ★"..card.Awakening) or ""),UDim2.new(0.54,0,0,20),UDim2.new(0,22,0,35),9,COLORS.muted,false)
	meta.ZIndex = 24
	if state then
		local inc = Economy.CardIncome(state,card,state.Computed and state.Computed.Entitlements or {})
		local incomeLabel = makeLabel(row,fmt(inc).."/s",UDim2.new(0.45,0,0,22),UDim2.new(0,22,0,61),11,tier.color,true)
		incomeLabel.ZIndex = 24
	end

	local actions = Instance.new("Frame")
	actions.BackgroundTransparency = 1
	actions.Size = UDim2.new(0.43,-14,1,-18)
	actions.Position = UDim2.new(0.57,0,0,9)
	actions.ZIndex = 24
	actions.Parent = row
	local layout = Instance.new("UIGridLayout")
	layout.CellPadding = UDim2.new(0,5,0,5)
	layout.CellSize = UDim2.new(0.48,0,0,34)
	layout.FillDirectionMaxCells = 2
	layout.Parent = actions

	local function actionButton(text,fn)
		local b = makeButton(actions,text,UDim2.new(),UDim2.new())
		b.TextSize = 10
		b.ZIndex = 25
		b.MouseButton1Click:Connect(fn)
		return b
	end

	if mode == "place" then
		actionButton("วาง Slot "..selectedSlot,function()
			if invoke("Place",{Guid=card.Guid,Slot=selectedSlot}) then
				showToast("วางการ์ดแล้ว",true)
				overlay.Visible = false
			end
		end)
	elseif mode ~= "preview" then
		local levelCost = state and Economy.UpgradeCost(state,card) or 0
		local gradeCost = state and Economy.GradeRerollCost(state,card) or 0
		actionButton("Level +1 · "..fmt(levelCost),function() invoke("LevelUp",{Guid=card.Guid}) end)
		actionButton("Grade Roll · "..fmt(gradeCost),function() invoke("RerollGrade",{Guid=card.Guid}) end)
		actionButton("Mutation Lab",function() openMutationLab(card.Guid) end)
		actionButton("Awaken",function() invoke("Awaken",{Guid=card.Guid}) end)
		actionButton(card.Locked and "Unlock" or "Lock",function() invoke("ToggleLock",{Guid=card.Guid}) end)
		local sellValue = state and Economy.SellValue(state,card) or 0
		local sell = actionButton("SELL · "..fmt(sellValue),function()
			local sold = invoke("Sell",{Guid=card.Guid})
			if sold then showToast("ขายการ์ด +"..fmt(sold),true) end
		end)
		if card.Locked or isGuidPlaced(card.Guid) then
			sell.Active = false
			sell.AutoButtonColor = false
			sell.BackgroundColor3 = Color3.fromRGB(50,39,46)
			sell.TextColor3 = COLORS.muted
		end
	end
	return row
end

openMutationLab = function(guid)
	if not state then return end
	local target = state.Cards and state.Cards[guid]
	if not target then
		showToast("ไม่พบ Target",false)
		return
	end
	mutationTargetGuid = guid
	selectedSlot = nil
	activePanel = "mutation"
	overlay.Visible = true
	panelTitle.Text = "MUTATION LAB"
	panelSub.Text = string.format("Target #%04d · %d/2 Mutation Slot",target.Id,#cardMutationIds(target))
	clearContent()

	makeSectionHeader("TARGET",cardMutationText(target))
	makeCardRow(target,"preview")

	local owned = {}
	for _,id in ipairs(cardMutationIds(target)) do owned[id] = true end
	if #cardMutationIds(target) >= 2 then
		makeSectionHeader("Mutation เต็มแล้ว","การ์ดใบนี้มี Mutation ครบ 2 ช่อง")
		return
	end

	makeSectionHeader("INHERIT MUTATION","ใช้ Donor สูงสุด 3 ใบ · Donor จะหายไม่ว่าจะสำเร็จหรือล้มเหลว")
	local any = false
	for mutationId=1,12 do
		if not owned[mutationId] then
			local donors = mutationBestDonors(target,mutationId)
			if #donors > 0 then
				any = true
				local chance = mutationCombinedChance(target,donors)
				local def = Config.Mutations[mutationId]
				local donorGuids = {}
				for _,donor in ipairs(donors) do table.insert(donorGuids,donor.Guid) end

				local box = Instance.new("Frame")
				box.BackgroundColor3 = COLORS.panel2
				box.Size = UDim2.new(1,-4,0,72)
				box.ZIndex = 23
				box.Parent = content
				corner(box,12)
				stroke(box,def.color,0.35,1)

				local title = makeLabel(box,def.icon.." "..def.name,UDim2.new(0.56,0,0,24),UDim2.new(0,12,0,7),12,def.color,true)
				title.ZIndex = 24
				local info = makeLabel(box,string.format("%d Donor · %.1f%% chance · Income ×%.2f",#donors,chance*100,def.income),UDim2.new(0.58,0,0,22),UDim2.new(0,12,0,35),9,COLORS.muted,false)
				info.ZIndex = 24
				local inherit = makeButton(box,"INHERIT",UDim2.new(0,126,0,42),UDim2.new(1,-138,0,15))
				inherit.ZIndex = 24
				inherit.BackgroundColor3 = def.color:Lerp(COLORS.panel2,0.58)
				inherit.MouseButton1Click:Connect(function()
					local result = invoke("MutationInherit",{
						TargetGuid = guid,
						MutationId = mutationId,
						DonorGuids = donorGuids,
					})
					if result then
						if result.Success then
							showToast("🧬 สืบทอด "..def.name.." สำเร็จ!",true)
						else
							showToast(string.format("สืบทอดไม่สำเร็จ · ใช้ Donor %d ใบ",result.Consumed or #donorGuids),false)
						end
						task.defer(function()
							if state and state.Cards and state.Cards[guid] then openMutationLab(guid) end
						end)
					end
				end)
			end
		end
	end
	if not any then
		makeSectionHeader("ยังไม่มี Donor","หา Card ที่ติด Mutation และถอดออกจากฐานก่อน แล้วค่อยนำมาสืบทอด")
	end
end

local function openCollection()
	if not state then return end
	activePanel = "collection"
	selectedSlot = nil
	overlay.Visible = true
	panelTitle.Text = "CARD COLLECTION"
	panelSub.Text = tostring((function() local n=0 for _ in pairs(state.Cards or {}) do n+=1 end return n end)()).." cards"
	clearContent()
	local cards = {}
	for _,card in pairs(state.Cards or {}) do table.insert(cards,card) end
	table.sort(cards,function(a,b)
		return Economy.CardIncome(state,a,state.Computed.Entitlements) > Economy.CardIncome(state,b,state.Computed.Entitlements)
	end)
	makeSectionHeader("คลังการ์ด","จัดเรียงตาม Final Income")
	for _,card in ipairs(cards) do makeCardRow(card,"manage") end
	if #cards == 0 then makeSectionHeader("ยังไม่มีการ์ด","กด ROLL PACK เพื่อเริ่มสะสม") end
end

local function openStand(slot)
	if not state then return end
	selectedSlot = slot
	activePanel = "stand"
	overlay.Visible = true
	panelTitle.Text = "CARD STAND "..slot
	panelSub.Text = "เลือกการ์ดสำหรับแท่นนี้ · Floor "..(math.floor((slot-1)/10)+1)
	clearContent()

	local currentGuid = state.Placed and state.Placed[tostring(slot)]
	local current = currentGuid and state.Cards[currentGuid]
	if current then
		makeSectionHeader("การ์ดปัจจุบัน","ถอดออกเพื่อเปลี่ยน หรือจัดการจาก Collection")
		makeCardRow(current,"manage")
		local remove = makeButton(content,"ถอดการ์ดจาก Stand "..slot,UDim2.new(1,-4,0,42),UDim2.new())
		remove.BackgroundColor3 = Color3.fromRGB(80,28,40)
		remove.ZIndex = 24
		remove.MouseButton1Click:Connect(function()
			if invoke("Remove",{Slot=slot}) then openStand(slot) end
		end)
	end

	makeSectionHeader("เลือกการ์ด","การ์ดที่ยังไม่ได้ใช้ในฐาน")
	local used = {}
	for _,guid in pairs(state.Placed or {}) do used[guid]=true end
	local cards = {}
	for guid,card in pairs(state.Cards or {}) do
		if not used[guid] or guid == currentGuid then table.insert(cards,card) end
	end
	table.sort(cards,function(a,b)
		return Economy.CardIncome(state,a,state.Computed.Entitlements) > Economy.CardIncome(state,b,state.Computed.Entitlements)
	end)
	for _,card in ipairs(cards) do makeCardRow(card,"place") end
end

local function openBasePanel()
	if not state then return end
	activePanel = "base"
	selectedSlot = nil
	overlay.Visible = true
	panelTitle.Text = "YOUR CARD TOWER"
	panelSub.Text = "3 Floors · "..state.Computed.StandLimit.." unlocked stands · "..fmt(state.Computed.Income).."/s"
	clearContent()

	makeSectionHeader("QUICK TRAVEL","ไปยังชั้นของฐานทันที")
	for floor=1,Config.BaseFloorCount do
		local firstSlot = (floor-1)*Config.BaseFloorSize+1
		local unlocked = firstSlot <= state.Computed.StandLimit
		local button = makeButton(content,"FLOOR "..floor.." · STANDS "..firstSlot.."–"..(firstSlot+Config.BaseFloorSize-1),UDim2.new(1,-4,0,46),UDim2.new())
		button.ZIndex = 24
		if unlocked then
			button.BackgroundColor3 = floor == 1 and COLORS.accent or COLORS.panel2
			button.MouseButton1Click:Connect(function()
				if invoke("TeleportFloor",{Floor=floor}) then
					overlay.Visible = false
					activePanel = nil
					showToast("ไป Floor "..floor.." แล้ว · กด E ที่ Stand เพื่อจัดการ",true)
				end
			end)
		else
			button.Text ..= " · LOCKED"
			button.Active = false
			button.AutoButtonColor = false
			button.TextColor3 = COLORS.muted
			button.BackgroundColor3 = Color3.fromRGB(31,33,41)
		end
	end

	local overview = makeButton(content,"⌂ TOWER OVERVIEW",UDim2.new(1,-4,0,46),UDim2.new())
	overview.ZIndex = 24
	overview.MouseButton1Click:Connect(function()
		if invoke("TeleportHome") then
			overlay.Visible = false
			activePanel = nil
			task.wait(0.08)
			frameHomeCamera(2.2)
		end
	end)

	makeSectionHeader("BASE LOADOUT","จัดฐานแบบเร็ว แล้วค่อยแต่งราย Stand ทีหลัง")
	local equipped = 0
	for _,guid in pairs(state.Placed or {}) do
		if guid and state.Cards and state.Cards[guid] then equipped += 1 end
	end
	makeSectionHeader("ACTIVE STANDS · "..equipped.." / "..state.Computed.StandLimit,"ระบบคิด Income จากการ์ดที่วางใน Stand ที่ปลดล็อกแล้ว")

	local auto = makeButton(content,"⚡ AUTO EQUIP BEST CARDS",UDim2.new(1,-4,0,50),UDim2.new())
	auto.ZIndex = 24
	auto.BackgroundColor3 = COLORS.accent
	auto.MouseButton1Click:Connect(function()
		local result = invoke("AutoEquipBest")
		if result then
			showToast("จัด Best Cards ลงฐาน "..result.Placed.." ใบแล้ว ✦",true)
		end
	end)

	makeSectionHeader("TIP","Card Tower มี 10 Stand ต่อชั้น · Base Level สูงขึ้นจะปลดล็อก Stand เพิ่ม")
end

local function makeInfoCard(title,value,sub)
	local box = Instance.new("Frame")
	box.BackgroundColor3 = COLORS.panel2
	box.Size = UDim2.new(1,-4,0,72)
	box.ZIndex = 23
	box.Parent = content
	corner(box,12)
	stroke(box,COLORS.line,0.3,1)
	local a = makeLabel(box,title,UDim2.new(0.5,-10,0,22),UDim2.new(0,12,0,8),10,COLORS.muted,true)
	a.ZIndex=24
	local v = makeLabel(box,value,UDim2.new(0.5,-10,0,27),UDim2.new(0,12,0,30),16,COLORS.text,true)
	v.ZIndex=24
	local s = makeLabel(box,sub or "",UDim2.new(0.48,-10,1,-16),UDim2.new(0.52,0,0,8),9,COLORS.muted,false)
	s.TextWrapped=true;s.ZIndex=24
	return box
end

local function openEndgame()
	if not state then return end
	activePanel = "endgame"
	overlay.Visible = true
	panelTitle.Text = "ASCENSION / ENDGAME"
	panelSub.Text = state.Computed.Title
	clearContent()

	local roman = state.Computed.AscensionRoman ~= "" and state.Computed.AscensionRoman or "0"
	makeInfoCard("ASCENSION",roman,"ทุกครั้ง: Income +20% · Luck +2% · Core +1")
	makeInfoCard("ASCENSION CORE",tostring(state.AscensionCores),"ใช้กับ Core Tree หรือ Awakening")
	makeInfoCard("ENDLESS TOWER","Floor "..state.Tower.Floor,"Power "..fmt(state.Computed.TowerPower).." / "..fmt(state.Computed.TowerRequirement).." · "..state.Computed.TowerCondition)

	local progressText
	if state.BaseLevel >= Config.BaseLevelCap then
		progressText = "ASCENSION READY · RESET TO Lv.1"
	else
		progressText = "REBIRTH → Lv."..(state.BaseLevel+1).." · COST "..fmt(state.Computed.RebirthCost)
	end
	local main = makeButton(content,progressText,UDim2.new(1,-4,0,48),UDim2.new())
	main.ZIndex=24
	main.BackgroundColor3 = state.BaseLevel >= Config.BaseLevelCap and COLORS.accent or COLORS.panel2
	main.MouseButton1Click:Connect(function()
		if state.BaseLevel >= Config.BaseLevelCap then
			if invoke("Ascend") then showToast("ASCENSION สำเร็จ ✦",true) end
		else
			if invoke("Rebirth") then showToast("Base Level เพิ่มแล้ว",true) end
		end
	end)

	makeSectionHeader("ASCENSION CORE TREE","1 Core ต่อ 1 ขั้น · สูงสุด 10")
	for _,key in ipairs({"Income","Luck","Forge"}) do
		local row = Instance.new("Frame")
		row.BackgroundColor3=COLORS.panel2;row.Size=UDim2.new(1,-4,0,55);row.ZIndex=23;row.Parent=content;corner(row,10)
		local descriptions={Income="+10% Global Income / ขั้น",Luck="+3% Luck / ขั้น",Forge="-6% Level / Grade cost / ขั้น"}
		local label=makeLabel(row,key.." Core · "..state.Perks[key].."/10",UDim2.new(0.65,0,0,24),UDim2.new(0,12,0,5),11,COLORS.text,true);label.ZIndex=24
		local sub=makeLabel(row,descriptions[key],UDim2.new(0.65,0,0,18),UDim2.new(0,12,0,29),8,COLORS.muted,false);sub.ZIndex=24
		local buy=makeButton(row,"UPGRADE",UDim2.new(0,110,0,34),UDim2.new(1,-122,0,10));buy.ZIndex=24
		buy.MouseButton1Click:Connect(function() invoke("BuyPerk",{Key=key}) end)
	end

	makeSectionHeader("ENDLESS TOWER","ผ่าน Floor ได้ +1 Shard · 10 Shards = 1 Core")
	local challenge = makeButton(content,"ท้าทาย Floor "..state.Tower.Floor,UDim2.new(1,-4,0,46),UDim2.new());challenge.ZIndex=24
	challenge.MouseButton1Click:Connect(function() invoke("TowerChallenge") end)
	local forge = makeButton(content,"หลอม 10 Shards → 1 Core · มี "..state.Tower.Shards,UDim2.new(1,-4,0,46),UDim2.new());forge.ZIndex=24
	forge.MouseButton1Click:Connect(function() invoke("TowerForgeCore") end)

	makeSectionHeader("SPECIAL ASCENSION REWARDS I–X","หลัง X ยัง Ascend ต่อได้ แต่ของพิเศษหยุดที่ X")
	for i,reward in ipairs(Config.AscensionRewards) do
		local unlocked = state.Ascension >= i
		local row=makeInfoCard("ASC "..({"I","II","III","IV","V","VI","VII","VIII","IX","X"})[i],unlocked and "✓ "..reward or reward,unlocked and "UNLOCKED" or "LOCKED")
		if unlocked then row.BackgroundColor3=Color3.fromRGB(17,35,35) end
	end
end

local function showCardReveal(card,extra)
	local tier = Config.Tiers[(card.Tier or 0)+1]
	local grade = Config.Grades[(card.Grade or 0)+1]
	revealMain.Text = string.format("#%04d\n%s",card.Id,tier.name)
	revealMain.TextColor3 = tier.color
	local autoPlaced = state and state.Placed and state.Placed["1"] == card.Guid
	local suffix = autoPlaced and "\n✦ Auto-placed on Stand 1" or ""
	if extra and extra ~= "" then suffix ..= "\n"..extra end
	revealMeta.Text = grade.name.." · "..cardMutationText(card)..suffix
	reveal.Visible = true
end

local function shopTimer(seconds)
	local total = math.max(0,math.floor(tonumber(seconds) or 0))
	return string.format("%02d:%02d",math.floor(total/60),total%60)
end

local function offerRateSummary(offer)
	local entries = {}
	local total = 0
	for tier,weight in pairs(offer.Rates or {}) do total += tonumber(weight) or 0 end
	for tier=0,#Config.Tiers-1 do
		local weight = tonumber((offer.Rates or {})[tier]) or 0
		if weight > 0 and total > 0 then
			local pct = (1-(tonumber(offer.OutRate) or 0))*(weight/total)*100
			table.insert(entries,Config.Tiers[tier+1].name.." "..string.format(pct<10 and "%.1f%%" or "%.0f%%",pct))
		end
	end
	table.insert(entries,"OUT "..string.format("%.1f%%",(tonumber(offer.OutRate) or 0)*100))
	return table.concat(entries," · ")
end

local function openPackShop()
	if not state then return end
	activePanel = "packs"
	selectedSlot = nil
	mutationTargetGuid = nil
	overlay.Visible = true
	panelTitle.Text = "PACK SHOP"
	panelSub.Text = "Character Packs + Limited Rotation · เงินในเกมเท่านั้น · ไม่มี Robux RNG"
	clearContent()

	local rotating = state.Computed and state.Computed.RotatingShop
	if rotating and type(rotating.Offers)=="table" then
		makeSectionHeader("LIMITED ROTATION · "..shopTimer(rotating.RemainingSeconds),"รีสต็อกทุก 10 นาที · Stock เป็นของผู้เล่นแต่ละคน")
		for _,offer in ipairs(rotating.Offers) do
			local tier = Config.Tiers[(offer.FeaturedTier or 0)+1]
			local locked = state.BaseLevel < (offer.MinLevel or 1)
			local sold = (offer.StockLeft or 0) <= 0

			local row = Instance.new("Frame")
			row.BackgroundColor3 = COLORS.panel2
			row.Size = UDim2.new(1,-4,0,104)
			row.ZIndex = 23
			row.Parent = content
			corner(row,12)
			stroke(row,tier.color,0.20,2)

			local ribbon = makeLabel(row,offer.Label.." · "..offer.Name,UDim2.new(0.57,0,0,24),UDim2.new(0,12,0,7),12,tier.color,true)
			ribbon.ZIndex = 24
			local theme = makeLabel(row,offer.ThemeName.." · ID "..string.format("#%04d–#%04d",offer.MinId,offer.MaxId),UDim2.new(0.58,0,0,20),UDim2.new(0,12,0,32),9,COLORS.text,true)
			theme.ZIndex = 24
			local rates = makeLabel(row,offerRateSummary(offer),UDim2.new(0.64,0,0,34),UDim2.new(0,12,0,55),8,COLORS.muted,false)
			rates.TextWrapped = true
			rates.ZIndex = 24
			local stock = makeLabel(row,"STOCK "..offer.StockLeft.."/"..offer.Stock,UDim2.new(0,120,0,18),UDim2.new(1,-280,0,72),8,COLORS.muted,true)
			stock.TextXAlignment = Enum.TextXAlignment.Right
			stock.ZIndex = 24

			local caption
			if locked then caption = "UNLOCK Lv."..offer.MinLevel
			elseif sold then caption = "SOLD OUT"
			else caption = "OPEN · "..fmt(offer.Cost) end
			local buy = makeButton(row,caption,UDim2.new(0,150,0,46),UDim2.new(1,-162,0,17))
			buy.ZIndex = 24
			buy.BackgroundColor3 = (not locked and not sold and state.Money >= offer.Cost) and tier.color:Lerp(COLORS.panel2,0.45) or Color3.fromRGB(44,47,58)
			buy.Active = not locked and not sold
			buy.AutoButtonColor = not locked and not sold
			buy.MouseButton1Click:Connect(function()
				if locked then showToast("ปลดที่ Base Lv."..offer.MinLevel,false) return end
				if sold then showToast("แพ็กนี้ SOLD OUT แล้ว",false) return end
				local result = invoke("BuyRotatingPack",{OfferId=offer.Id})
				if result and result.Card then
					local extra = result.OutOfRate and ("🌌 OUT OF RATE · "..result.OfferName) or result.OfferName
					showCardReveal(result.Card,extra)
				end
			end)
		end
	end

	makeSectionHeader("CHARACTER PACKS","เลือก Character Pool 10 ใบ · Tier ใช้ Luck ปัจจุบัน")
	for index,pack in ipairs(Config.IdPacks) do
		local cost = Economy.IdPackCost(state.BaseLevel,index)
		local row = Instance.new("Frame")
		row.BackgroundColor3 = COLORS.panel2
		row.Size = UDim2.new(1,-4,0,78)
		row.ZIndex = 23
		row.Parent = content
		corner(row,12)
		stroke(row,index%2==0 and COLORS.accent2 or COLORS.accent,0.45,1)

		local title = makeLabel(row,pack.name,UDim2.new(0.58,0,0,24),UDim2.new(0,12,0,8),12,COLORS.text,true)
		title.ZIndex = 24
		local meta = makeLabel(row,string.format("ID #%04d–#%04d · Cost %s",pack.minId,pack.maxId,fmt(cost)),UDim2.new(0.60,0,0,22),UDim2.new(0,12,0,36),9,COLORS.muted,false)
		meta.ZIndex = 24
		local buy = makeButton(row,"OPEN · "..fmt(cost),UDim2.new(0,150,0,44),UDim2.new(1,-162,0,17))
		buy.ZIndex = 24
		buy.BackgroundColor3 = state.Money >= cost and COLORS.accent or Color3.fromRGB(46,49,61)
		buy.MouseButton1Click:Connect(function()
			local card = invoke("RollIdPack",{PackIndex=index})
			if card then showCardReveal(card,pack.name) end
		end)
	end
end

local function getPrice(id,infoType)
	if not id or id <= 0 then return "ID NOT SET" end
	local ok,info = pcall(MarketplaceService.GetProductInfo,MarketplaceService,id,infoType)
	if ok and info then return tostring(info.PriceInRobux or "?").." R$" end
	return "— R$"
end

local function storeItem(title,subtitle,id,kind)
	local row=Instance.new("Frame")
	row.BackgroundColor3=COLORS.panel2;row.Size=UDim2.new(1,-4,0,72);row.ZIndex=23;row.Parent=content;corner(row,12);stroke(row,COLORS.line,0.25,1)
	local a=makeLabel(row,title,UDim2.new(0.62,0,0,24),UDim2.new(0,12,0,8),11,COLORS.text,true);a.ZIndex=24
	local s=makeLabel(row,subtitle,UDim2.new(0.62,0,0,31),UDim2.new(0,12,0,32),8,COLORS.muted,false);s.TextWrapped=true;s.ZIndex=24
	local infoType = kind=="pass" and Enum.InfoType.GamePass or Enum.InfoType.Product
	local buy=makeButton(row,getPrice(id,infoType),UDim2.new(0,128,0,40),UDim2.new(1,-140,0,16));buy.ZIndex=24
	if id <= 0 then buy.Active=false;buy.AutoButtonColor=false;buy.BackgroundColor3=Color3.fromRGB(40,42,50) end
	buy.MouseButton1Click:Connect(function()
		if id <= 0 then showToast("ยังไม่ได้ใส่ Roblox ID ของสินค้านี้",false);return end
		if kind=="pass" then MarketplaceService:PromptGamePassPurchase(player,id)
		else MarketplaceService:PromptProductPurchase(player,id) end
	end)
	return row
end

local function openStore()
	activePanel="store";overlay.Visible=true;panelTitle.Text="COLLECTOR STORE";panelSub.Text="ไม่ขายสุ่มการ์ดด้วย Robux · ราคาอ่านจาก Roblox ตามภูมิภาค";clearContent()
	makeSectionHeader("GAME PASSES","ซื้อครั้งเดียว · สิทธิ์ถาวร")
	storeItem("VIP Collector","Income +15% · VIP/Profile/Base cosmetic",Config.PassIds.VIPCollector,"pass")
	storeItem("Turbo Collector","Roll/Auto animation เร็วขึ้น โดยไม่เพิ่ม Odds",Config.PassIds.TurboCollector,"pass")
	storeItem("Offline Vault","Offline Income cap 2 ชม. → 8 ชม.",Config.PassIds.OfflineVault,"pass")
	storeItem("Showcase Pro","Particle Theme / Base Entrance / Showcase cosmetic",Config.PassIds.ShowcasePro,"pass")

	makeSectionHeader("DEVELOPER PRODUCTS","ซื้อซ้ำได้ · ไม่มี Paid RNG")
	storeItem("15 Minutes Income","เงินตามรายได้ฐานปัจจุบัน 15 นาที",Config.ProductIds.Cash15Minutes,"product")
	storeItem("1 Hour Income","เงินตามรายได้ฐานปัจจุบัน 1 ชั่วโมง",Config.ProductIds.Cash1Hour,"product")
	storeItem("3 Hours Income","เงินตามรายได้ฐานปัจจุบัน 3 ชั่วโมง",Config.ProductIds.Cash3Hours,"product")
	storeItem("2× Income · 30m","คูณรายได้ทั้งหมด 30 นาที",Config.ProductIds.DoubleIncome30Minutes,"product")
	storeItem("2× Income · 2h","คูณรายได้ทั้งหมด 2 ชั่วโมง",Config.ProductIds.DoubleIncome2Hours,"product")
	storeItem("Support DEV · 10","Tip ไม่มีพลังเพิ่ม",Config.ProductIds.Tip10,"product")
	storeItem("Support DEV · 50","Tip ไม่มีพลังเพิ่ม",Config.ProductIds.Tip50,"product")
	storeItem("Support DEV · 100","Tip ไม่มีพลังเพิ่ม",Config.ProductIds.Tip100,"product")
end

local function renderHud()
	if not state then return end
	statLabels.Money.Text = fmt(state.Money)
	statLabels.Income.Text = fmt(state.Computed.Income).."/s"
	statLabels.Base.Text = "Lv."..state.BaseLevel
	statLabels.Ascension.Text = state.Computed.AscensionRoman ~= "" and state.Computed.AscensionRoman or "—"

	local cardCount = 0
	for _ in pairs(state.Cards or {}) do cardCount += 1 end
	local placedCount = 0
	for _,guid in pairs(state.Placed or {}) do
		if guid and state.Cards and state.Cards[guid] then placedCount += 1 end
	end
	if cardCount == 0 then
		hintBar.Text = "START → กด ROLL PACK เพื่อรับการ์ดใบแรกฟรี"
		hintBar.TextColor3 = COLORS.accent2
	elseif placedCount == 0 then
		hintBar.Text = "NEXT → ไปที่ BASE แล้วกด E ที่ Stand เพื่อวางการ์ด"
		hintBar.TextColor3 = COLORS.gold
	elseif state.BaseLevel >= Config.BaseLevelCap then
		hintBar.Text = "ASCENSION READY ✦ เข้า ENDGAME เพื่อจุติและรับ Permanent Buff"
		hintBar.TextColor3 = COLORS.gold
	else
		hintBar.Text = "NEXT → Rebirth Lv."..(state.BaseLevel+1).." ที่ "..fmt(state.Computed.RebirthCost).." · ตอนนี้ "..fmt(state.Money)
		hintBar.TextColor3 = state.Money >= state.Computed.RebirthCost and COLORS.accent2 or COLORS.text
	end

	if activePanel=="collection" and overlay.Visible then openCollection()
	elseif activePanel=="endgame" and overlay.Visible then openEndgame()
	elseif activePanel=="stand" and overlay.Visible and selectedSlot then openStand(selectedSlot)
	elseif activePanel=="mutation" and overlay.Visible and mutationTargetGuid then openMutationLab(mutationTargetGuid)
	elseif activePanel=="packs" and overlay.Visible then openPackShop()
	elseif activePanel=="base" and overlay.Visible then openBasePanel() end
end

local function handleState(newState)
	state = newState
	renderHud()
end

rollBtn.MouseButton1Click:Connect(function()
	local card = invoke("RollPack")
	if card then showCardReveal(card) end
end)
baseBtn.MouseButton1Click:Connect(openBasePanel)
collectionBtn.MouseButton1Click:Connect(openCollection)
endgameBtn.MouseButton1Click:Connect(openEndgame)
packShopBtn.MouseButton1Click:Connect(openPackShop)
storeBtn.MouseButton1Click:Connect(openStore)
closeBtn.MouseButton1Click:Connect(function() overlay.Visible=false;activePanel=nil;selectedSlot=nil;mutationTargetGuid=nil end)
revealClose.MouseButton1Click:Connect(function() reveal.Visible=false end)
OpenStandEvent.OnClientEvent:Connect(openStand)
ToastEvent.OnClientEvent:Connect(showToast)
StateEvent.OnClientEvent:Connect(handleState)

local function applyResponsive()
	local camera = workspace.CurrentCamera
	if not camera then return end
	local width = camera.ViewportSize.X
	if width < 720 then
		top.Size = UDim2.new(1,-12,0,112)
		top.Position = UDim2.new(0,6,0,6)
		hintBar.Position = UDim2.new(0.5,0,0,124)
		hintBar.Size = UDim2.new(1,-12,0,38)
		brand.Size = UDim2.new(1,-20,0,22)
		subtitle.Size = UDim2.new(1,-20,0,16)
		stats.Position = UDim2.new(0,8,0,60)
		stats.Size = UDim2.new(1,-16,0,44)
		grid.CellSize = UDim2.new(0.245,-4,1,0)
		actionBar.Size = UDim2.new(1,-12,0,104)
		actionBar.Position = UDim2.new(0.5,0,1,-6)
		actionLayout.CellPadding = UDim2.new(0,3,0,4)
		actionLayout.CellSize = UDim2.new(0.32,-2,0,42)
		actionLayout.FillDirectionMaxCells = 3
		panel.Size = UDim2.new(0.96,0,0.80,0)
	else
		top.Size = UDim2.new(1,-24,0,74)
		top.Position = UDim2.new(0,12,0,10)
		hintBar.Position = UDim2.new(0.5,0,0,92)
		hintBar.Size = UDim2.new(0,560,0,36)
		stats.Position = UDim2.new(0,200,0,6)
		stats.Size = UDim2.new(1,-210,1,-12)
		actionBar.Size = UDim2.new(0,760,0,64)
		actionBar.Position = UDim2.new(0.5,0,1,-16)
		actionLayout.CellPadding = UDim2.new(0,7,0,0)
		actionLayout.CellSize = UDim2.new(0.158,-2,1,0)
		actionLayout.FillDirectionMaxCells = 6
		panel.Size = UDim2.new(0.78,0,0.78,0)
	end
end

workspace:GetPropertyChangedSignal("CurrentCamera"):Connect(applyResponsive)
if workspace.CurrentCamera then workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(applyResponsive) end
applyResponsive()

task.spawn(function()
	local initial = invoke("GetState")
	if initial then
		handleState(initial)
		task.wait(0.8)
		frameHomeCamera(2.4)
	end
end)
