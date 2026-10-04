local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Root = ReplicatedStorage:WaitForChild("CardBase")
local Config = require(Root.Shared.GameConfig)

local DataService = {}

local LocalStudioData = {}
local Store

-- Unpublished .rbxlx files have PlaceId 0 and Roblox throws immediately when
-- GetDataStore is called. Use an in-memory adapter for local playtests, then
-- switch automatically to the real DataStore as soon as the experience is published.
if game.PlaceId ~= 0 then
	local ok,result = pcall(function()
		return DataStoreService:GetDataStore(Config.DataStoreName)
	end)
	if ok then Store = result end
end

if not Store then
	Store = {}
	function Store:UpdateAsync(key, transform)
		local nextValue = transform(LocalStudioData[key])
		if nextValue ~= nil then LocalStudioData[key] = nextValue end
		return LocalStudioData[key]
	end
	warn("[DataService] Unpublished Studio session: using in-memory save data")
end

local Profiles = {}
local Dirty = {}
local Started = false

local function deepCopy(value)
	if type(value) ~= "table" then return value end
	local out = {}
	for k,v in pairs(value) do out[k] = deepCopy(v) end
	return out
end

local function defaultProfile()
	return {
		Version = Config.Version,
		Money = 0,
		BaseLevel = 1,
		Ascension = 0,
		AscensionCores = 0,
		Perks = {Income=0,Luck=0,Forge=0},
		Cards = {},
		Collection = {},
		Placed = {},
		Tower = {Floor=1,Best=0,Shards=0},
		Boosts = {DoubleIncomeUntil=0},
		RotatingShop = {RotationId=0,Bought={}},
		Daily = {Day="",LastLoginDay="",Streak=0,LoginClaimed=false,Progress={Rolls=0,Upgrades=0,Places=0},Claimed={Rolls=false,Upgrades=false,Places=false},BonusClaimed=false},
		Receipts = {},
		LastSeen = os.time(),
		Meta = {
			SessionJobId = "",
			SessionUpdatedAt = 0,
		},
	}
end

local function reconcile(raw)
	local p = type(raw) == "table" and raw or defaultProfile()
	local d = defaultProfile()
	for k,v in pairs(d) do
		if p[k] == nil then p[k] = deepCopy(v) end
	end
	if type(p.Perks) ~= "table" then p.Perks = deepCopy(d.Perks) end
	if type(p.Cards) ~= "table" then p.Cards = {} end
	if type(p.Collection) ~= "table" then p.Collection = {} end
	for _,card in pairs(p.Cards) do
		local id=math.clamp(math.floor(tonumber(card.Id) or 0),0,100)
		if id > 0 then p.Collection[tostring(id)] = true end
	end
	if type(p.Placed) ~= "table" then p.Placed = {} end
	if type(p.Tower) ~= "table" then p.Tower = deepCopy(d.Tower) end
	if type(p.Boosts) ~= "table" then p.Boosts = deepCopy(d.Boosts) end
	if type(p.RotatingShop) ~= "table" then p.RotatingShop = deepCopy(d.RotatingShop) end
	if type(p.RotatingShop.Bought) ~= "table" then p.RotatingShop.Bought = {} end
	p.RotatingShop.RotationId = math.max(0,math.floor(tonumber(p.RotatingShop.RotationId) or 0))
	if type(p.Daily) ~= "table" then p.Daily = deepCopy(d.Daily) end
	if type(p.Daily.Progress) ~= "table" then p.Daily.Progress = deepCopy(d.Daily.Progress) end
	if type(p.Daily.Claimed) ~= "table" then p.Daily.Claimed = deepCopy(d.Daily.Claimed) end
	if type(p.Receipts) ~= "table" then p.Receipts = {} end
	if type(p.Meta) ~= "table" then p.Meta = deepCopy(d.Meta) end

	p.Version = Config.Version
	p.Money = math.max(0,tonumber(p.Money) or 0)
	p.BaseLevel = math.clamp(math.floor(tonumber(p.BaseLevel) or 1),1,Config.BaseLevelCap)
	p.Ascension = math.max(0,math.floor(tonumber(p.Ascension) or 0))
	p.AscensionCores = math.max(0,math.floor(tonumber(p.AscensionCores) or 0))
	p.Perks.Income = math.clamp(math.floor(tonumber(p.Perks.Income) or 0),0,10)
	p.Perks.Luck = math.clamp(math.floor(tonumber(p.Perks.Luck) or 0),0,10)
	p.Perks.Forge = math.clamp(math.floor(tonumber(p.Perks.Forge) or 0),0,10)
	p.Tower.Floor = math.max(1,math.floor(tonumber(p.Tower.Floor) or 1))
	p.Tower.Best = math.max(0,math.floor(tonumber(p.Tower.Best) or 0))
	p.Tower.Shards = math.max(0,math.floor(tonumber(p.Tower.Shards) or 0))
	p.Boosts.DoubleIncomeUntil = math.max(0,math.floor(tonumber(p.Boosts.DoubleIncomeUntil) or 0))
	p.LastSeen = math.max(0,math.floor(tonumber(p.LastSeen) or os.time()))
	return p
end

local function keyFor(userId)
	return "u_"..tostring(userId)
end

local function updateWithRetry(key,transform,attempts)
	attempts = math.max(1,math.floor(tonumber(attempts) or 3))
	local lastError
	for attempt=1,attempts do
		local ok,result = pcall(function()
			return Store:UpdateAsync(key,transform)
		end)
		if ok then return true,result end
		lastError=result
		if attempt < attempts then
			task.wait(0.45*attempt)
		end
	end
	return false,lastError
end

function DataService.Get(player)
	return Profiles[player.UserId]
end

function DataService.MarkDirty(player)
	if Profiles[player.UserId] then Dirty[player.UserId] = true end
end

function DataService.Load(player)
	local now = os.time()
	local conflict = false
	local ok,result = updateWithRetry(keyFor(player.UserId),function(old)
		local profile = reconcile(old)
		local lockId = tostring(profile.Meta.SessionJobId or "")
		local lockAt = tonumber(profile.Meta.SessionUpdatedAt) or 0
		if lockId ~= "" and lockId ~= game.JobId and now-lockAt < Config.SessionLockSeconds then
			conflict = true
			return profile
		end
		profile.Meta.SessionJobId = game.JobId
		profile.Meta.SessionUpdatedAt = now
		return profile
	end,3)
	if not ok then
		warn("[DataService] Load failed",player.UserId,result)
		player:Kick("โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่")
		return nil
	end
	if conflict then
		player:Kick("บัญชีนี้กำลังเล่นอยู่ในอีกเซิร์ฟเวอร์ กรุณารอสักครู่")
		return nil
	end
	result = reconcile(result)
	Profiles[player.UserId] = result
	Dirty[player.UserId] = false
	return result
end

function DataService.Save(player, release)
	local profile = Profiles[player.UserId]
	if not profile then return false end
	local snapshot = deepCopy(profile)
	local now = os.time()
	snapshot.LastSeen = now
	snapshot.Meta.SessionUpdatedAt = now
	snapshot.Meta.SessionJobId = release and "" or game.JobId

	local ok,result = updateWithRetry(keyFor(player.UserId),function(old)
		local current = reconcile(old)
		local lockId = tostring(current.Meta.SessionJobId or "")
		local lockAt = tonumber(current.Meta.SessionUpdatedAt) or 0
		if lockId ~= "" and lockId ~= game.JobId and now-lockAt < Config.SessionLockSeconds then
			return current
		end
		return snapshot
	end,3)
	if not ok then
		warn("[DataService] Save failed",player.UserId,result)
		return false
	end

	if not release then
		snapshot = reconcile(result)
		Profiles[player.UserId] = snapshot
		Dirty[player.UserId] = false
	else
		Profiles[player.UserId] = nil
		Dirty[player.UserId] = nil
	end
	return true
end

function DataService.ProcessReceipt(player, purchaseId, grantFn)
	if not player or not Profiles[player.UserId] then return false,"no_profile" end
	-- Push unsaved gameplay first so the receipt UpdateAsync becomes the latest canonical profile.
	if not DataService.Save(player,false) then return false,"pre_save_failed" end

	local duplicate = false
	local grantError = nil
	local ok,result = pcall(function()
		return Store:UpdateAsync(keyFor(player.UserId),function(old)
			local profile = reconcile(old)
			local key = tostring(purchaseId)
			if profile.Receipts[key] then
				duplicate = true
				return profile
			end
			local success,err = pcall(grantFn,profile)
			if not success then
				grantError = tostring(err)
				return nil
			end
			profile.Receipts[key] = os.time()
			profile.LastSeen = os.time()
			profile.Meta.SessionJobId = game.JobId
			profile.Meta.SessionUpdatedAt = os.time()
			return profile
		end)
	end)
	if not ok or grantError then
		warn("[DataService] Receipt failed",purchaseId,result,grantError)
		return false,grantError or tostring(result)
	end
	Profiles[player.UserId] = reconcile(result)
	Dirty[player.UserId] = false
	return true,duplicate and "duplicate" or "granted"
end

function DataService.ClientSnapshot(player)
	local profile = Profiles[player.UserId]
	if not profile then return nil end
	local out = deepCopy(profile)
	out.Meta = nil
	out.Receipts = nil
	return out
end

function DataService.Start()
	if Started then return end
	Started = true

	task.spawn(function()
		while task.wait(Config.AutosaveSeconds) do
			for _,player in ipairs(Players:GetPlayers()) do
				if Profiles[player.UserId] and Dirty[player.UserId] then
					DataService.Save(player,false)
				elseif Profiles[player.UserId] then
					-- Refresh session lock even when nothing changed.
					DataService.Save(player,false)
				end
			end
		end
	end)

	game:BindToClose(function()
		local deadline = os.clock()+25
		for _,player in ipairs(Players:GetPlayers()) do
			if os.clock() > deadline then break end
			DataService.Save(player,true)
		end
	end)
end

return DataService
