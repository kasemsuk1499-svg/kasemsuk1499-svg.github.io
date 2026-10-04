local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Economy = require(Root.Shared.Economy)

local GlobalLeaderboardService = {}

local DataService
local MonetizationService
local OrderedStore
local SnapshotStore
local Cache = {At=0,Rows={}}
local Started = false

local function rankingScore(profile,income)
	local asc = math.clamp(math.floor(tonumber(profile.Ascension) or 0),0,999999)
	local base = math.clamp(math.floor(tonumber(profile.BaseLevel) or 1),1,40)
	local logIncome = math.log10(math.max(1,tonumber(income) or 0)+1)
	local incomeBand = math.clamp(math.floor(logIncome*10000),0,999999)
	-- Ascension dominates Base; Base dominates income magnitude.
	-- Stays safely under Lua/OrderedDataStore integer precision for practical values.
	return asc*10000000000 + base*100000000 + incomeBand
end

local function snapshotFor(player,profile,entitlements)
	local income = Economy.TotalIncome(profile,entitlements or {})
	return {
		UserId = player.UserId,
		Name = player.Name,
		DisplayName = player.DisplayName,
		Ascension = math.max(0,math.floor(tonumber(profile.Ascension) or 0)),
		BaseLevel = math.max(1,math.floor(tonumber(profile.BaseLevel) or 1)),
		Income = income,
		UpdatedAt = os.time(),
		Score = rankingScore(profile,income),
	}
end

local function ensureStores()
	if OrderedStore and SnapshotStore then return true end
	if game.PlaceId == 0 then return false end
	local ok,err = pcall(function()
		OrderedStore = DataStoreService:GetOrderedDataStore("CardBase_GlobalPrestige_v1")
		SnapshotStore = DataStoreService:GetDataStore("CardBase_GlobalSnapshot_v1")
	end)
	if not ok then
		warn("[GlobalLeaderboard] DataStore unavailable",err)
		return false
	end
	return true
end

function GlobalLeaderboardService.Record(player)
	if not ensureStores() then return false end
	local profile = DataService and DataService.Get(player)
	if not profile then return false end
	local entitlements = MonetizationService and MonetizationService.GetEntitlements(player) or {}
	local snap = snapshotFor(player,profile,entitlements)
	local key = tostring(player.UserId)

	local ok,err = pcall(function()
		OrderedStore:SetAsync(key,snap.Score)
		SnapshotStore:SetAsync(key,snap)
	end)
	if not ok then
		warn("[GlobalLeaderboard] Record failed",player.UserId,err)
		return false
	end
	Cache.At = 0
	return true
end

local function fallbackServerRows(limit)
	local rows = {}
	for _,player in ipairs(Players:GetPlayers()) do
		local profile = DataService and DataService.Get(player)
		if profile then
			local entitlements = MonetizationService and MonetizationService.GetEntitlements(player) or {}
			table.insert(rows,snapshotFor(player,profile,entitlements))
		end
	end
	table.sort(rows,function(a,b) return a.Score > b.Score end)
	while #rows > limit do table.remove(rows) end
	return rows
end

function GlobalLeaderboardService.GetTop(limit)
	limit = math.clamp(math.floor(tonumber(limit) or 25),1,50)
	if os.time()-Cache.At < 25 and #Cache.Rows > 0 then
		local out = {}
		for i=1,math.min(limit,#Cache.Rows) do out[i]=Cache.Rows[i] end
		return out
	end

	if not ensureStores() then
		return fallbackServerRows(limit)
	end

	local ok,pages = pcall(function()
		return OrderedStore:GetSortedAsync(false,limit)
	end)
	if not ok or not pages then
		return fallbackServerRows(limit)
	end

	local page = pages:GetCurrentPage()
	local rows = {}
	for rank,item in ipairs(page) do
		local userId = tonumber(item.key)
		local snap
		local snapOk,snapResult = pcall(function()
			return SnapshotStore:GetAsync(item.key)
		end)
		if snapOk and type(snapResult) == "table" then
			snap = snapResult
		else
			snap = {
				UserId=userId or 0,
				Name="User "..tostring(userId or "?"),
				DisplayName="User "..tostring(userId or "?"),
				Ascension=0,BaseLevel=1,Income=0,UpdatedAt=0,
			}
		end
		snap.Rank = rank
		snap.Score = tonumber(item.value) or 0
		table.insert(rows,snap)
	end

	Cache = {At=os.time(),Rows=rows}
	return rows
end

function GlobalLeaderboardService.Start(dataService,monetizationService)
	if Started then return end
	Started = true
	DataService = dataService
	MonetizationService = monetizationService
	ensureStores()

	task.spawn(function()
		task.wait(8)
		while true do
			for _,player in ipairs(Players:GetPlayers()) do
				GlobalLeaderboardService.Record(player)
				task.wait(0.35)
			end
			task.wait(50)
		end
	end)
end

return GlobalLeaderboardService
