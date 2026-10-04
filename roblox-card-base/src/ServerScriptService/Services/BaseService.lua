local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Config = require(Root.Shared.GameConfig)
local Economy = require(Root.Shared.Economy)

local BaseService = {}

local DataService
local MonetizationService
local OnChanged

local function roman(value)
	local n = math.max(0,math.floor(tonumber(value) or 0))
	if n == 0 then return "" end
	local map = {{1000,"M"},{900,"CM"},{500,"D"},{400,"CD"},{100,"C"},{90,"XC"},{50,"L"},{40,"XL"},{10,"X"},{9,"IX"},{5,"V"},{4,"IV"},{1,"I"}}
	local out = ""
	for _,pair in ipairs(map) do
		while n >= pair[1] do out ..= pair[2]; n -= pair[1] end
	end
	return out
end

function BaseService.Roman(value)
	return roman(value)
end

function BaseService.Title(profile)
	local lv = math.clamp(math.floor(tonumber(profile.BaseLevel) or 1),1,Config.BaseLevelCap)
	local title = Config.Titles[lv] or Config.Titles[1]
	local r = roman(profile.Ascension)
	return r ~= "" and (title.." "..r) or title
end

function BaseService.Place(profile,guid,slot)
	slot = math.floor(tonumber(slot) or 0)
	if slot < 1 or slot > Economy.StandLimit(profile.BaseLevel) then
		return false,"ช่องนี้ยังไม่ปลดล็อก"
	end
	if type(guid) ~= "string" or not profile.Cards[guid] then return false,"ไม่พบการ์ด" end
	for key,placedGuid in pairs(profile.Placed) do
		if placedGuid == guid then profile.Placed[key] = nil end
	end
	profile.Placed[tostring(slot)] = guid
	return true
end

function BaseService.Remove(profile,slot)
	slot = math.floor(tonumber(slot) or 0)
	if slot < 1 or slot > Config.MaxStandSlots then return false,"ช่องไม่ถูกต้อง" end
	profile.Placed[tostring(slot)] = nil
	return true
end

function BaseService.AutoEquipBest(profile,entitlements)
	local cards = {}
	for _,card in pairs(profile.Cards or {}) do
		table.insert(cards,card)
	end
	if #cards == 0 then return false,"ยังไม่มีการ์ด" end

	table.sort(cards,function(a,b)
		return Economy.CardIncome(profile,a,entitlements) > Economy.CardIncome(profile,b,entitlements)
	end)

	local limit = Economy.StandLimit(profile.BaseLevel)
	profile.Placed = {}
	for slot=1,math.min(limit,#cards) do
		profile.Placed[tostring(slot)] = cards[slot].Guid
	end
	return true,{Placed=math.min(limit,#cards),Limit=limit}
end

function BaseService.Rebirth(profile)
	if profile.BaseLevel >= Config.BaseLevelCap then return false,"ถึง Lv.40 แล้ว ใช้ Ascension" end
	local cost = Economy.RebirthCost(profile.BaseLevel)
	if profile.Money < cost then return false,"เงินไม่พอ" end
	profile.Money = 0
	profile.BaseLevel += 1
	return true,{Level=profile.BaseLevel,Cost=cost}
end

function BaseService.Ascend(profile)
	if profile.BaseLevel < Config.BaseLevelCap then return false,"ต้องถึง Base Lv.40" end
	profile.Ascension += 1
	profile.AscensionCores += 1
	profile.BaseLevel = 1
	profile.Money = 0
	return true,{
		Ascension=profile.Ascension,
		Core=1,
		Reward=profile.Ascension <= 10 and Config.AscensionRewards[profile.Ascension] or nil,
	}
end

function BaseService.BuyPerk(profile,key)
	if key ~= "Income" and key ~= "Luck" and key ~= "Forge" then return false,"Perk ไม่ถูกต้อง" end
	local current = math.max(0,math.floor(tonumber(profile.Perks[key]) or 0))
	if current >= 10 then return false,"สายนี้เต็มแล้ว" end
	if profile.AscensionCores < 1 then return false,"Ascension Core ไม่พอ" end
	profile.AscensionCores -= 1
	profile.Perks[key] = current+1
	return true,profile.Perks[key]
end

function BaseService.ApplyOfflineIncome(player)
	local profile = DataService.Get(player)
	if not profile then return 0 end
	local entitlements = MonetizationService.GetEntitlements(player)
	local cap = entitlements.OfflineVault and Config.OfflineVaultCapSeconds or Config.DefaultOfflineCapSeconds
	local elapsed = math.clamp(os.time()-(tonumber(profile.LastSeen) or os.time()),0,cap)
	if elapsed <= 2 then return 0 end
	local gain = Economy.TotalIncome(profile,entitlements)*elapsed
	profile.Money += gain
	DataService.MarkDirty(player)
	return gain
end

function BaseService.Start(dataService,monetizationService,onChanged)
	DataService = dataService
	MonetizationService = monetizationService
	OnChanged = onChanged

	task.spawn(function()
		local last = os.clock()
		while task.wait(1) do
			local now = os.clock()
			local dt = math.clamp(now-last,0,3)
			last = now
			for _,player in ipairs(Players:GetPlayers()) do
				local profile = DataService.Get(player)
				if profile then
					local income = Economy.TotalIncome(profile,MonetizationService.GetEntitlements(player))
					if income > 0 then
						profile.Money += income*dt
						DataService.MarkDirty(player)
					end
					if OnChanged then OnChanged(player,false) end
				end
			end
		end
	end)
end

return BaseService
