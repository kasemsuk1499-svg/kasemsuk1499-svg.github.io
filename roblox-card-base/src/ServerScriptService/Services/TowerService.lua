local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Economy = require(Root.Shared.Economy)

local TowerService = {}

local function cardsOnActiveBase(profile)
	local out = {}
	local limit = Economy.StandLimit(profile.BaseLevel)
	for slot=1,limit do
		local guid = profile.Placed[tostring(slot)]
		local card = guid and profile.Cards[guid]
		if card then table.insert(out,card) end
	end
	return out
end

function TowerService.Power(profile)
	local total = 0
	for _,card in ipairs(cardsOnActiveBase(profile)) do
		local mutations = 0
		if (tonumber(card.Mutation1) or 0) > 0 then mutations += 1 end
		if (tonumber(card.Mutation2) or 0) > 0 then mutations += 1 end
		total += ((tonumber(card.Tier) or 0)+1)*15
		total += ((tonumber(card.Grade) or 0)+1)*4
		total += math.floor((tonumber(card.Level) or 1)/10)
		total += mutations*18
		total += math.max(0,tonumber(card.Awakening) or 0)*60
	end
	return math.floor(total)
end

function TowerService.Requirement(floor)
	floor = math.max(1,tonumber(floor) or 1)
	return math.floor(150+(floor*42)+(floor^1.38)*10)
end

function TowerService.Condition(profile,floor)
	floor = math.max(1,math.floor(tonumber(floor) or 1))
	local cards = cardsOnActiveBase(profile)
	local mythic,dual,ex,awaken,totalLevel = 0,0,0,0,0
	for _,card in ipairs(cards) do
		if (tonumber(card.Tier) or 0) >= 5 then mythic += 1 end
		local m = ((tonumber(card.Mutation1) or 0)>0 and 1 or 0)+((tonumber(card.Mutation2) or 0)>0 and 1 or 0)
		if m >= 2 then dual += 1 end
		if (tonumber(card.Grade) or 0) >= 10 then ex += 1 end
		awaken += math.max(0,tonumber(card.Awakening) or 0)
		totalLevel += math.max(1,tonumber(card.Level) or 1)
	end
	local ok = true
	local text = "Power Check"
	local mod = floor%5
	if mod == 2 then
		local need = math.min(10,1+math.floor(floor/8))
		ok = mythic >= need
		text = "Mythic+ "..mythic.."/"..need
	elseif mod == 3 then
		local need = math.min(8,1+math.floor(floor/10))
		ok = dual >= need
		text = "Dual Mutation "..dual.."/"..need
	elseif mod == 4 then
		local need = 300+floor*25
		ok = totalLevel >= need
		text = "Total Card Lv. "..totalLevel.."/"..need
	elseif mod == 0 then
		local need = math.min(8,1+math.floor(floor/12))
		ok = ex >= need
		text = "EX+ "..ex.."/"..need
	end
	if floor%10 == 0 then
		local need = math.max(1,math.floor(floor/10))
		ok = ok and awaken >= need
		text ..= " · Awaken Stars "..awaken.."/"..need
	end
	return ok,text
end

function TowerService.Challenge(profile)
	if profile.Ascension < 1 then return false,"ปลดหลัง Ascension I" end
	local floor = profile.Tower.Floor
	local power = TowerService.Power(profile)
	local required = TowerService.Requirement(floor)
	local conditionOk,conditionText = TowerService.Condition(profile,floor)
	if power < required or not conditionOk then
		return false,"ยังไม่ผ่าน · Power "..power.."/"..required.." · "..conditionText
	end
	profile.Tower.Best = math.max(profile.Tower.Best,floor)
	profile.Tower.Shards += 1
	profile.Tower.Floor += 1
	return true,{Cleared=floor,Shard=1}
end

function TowerService.ForgeCore(profile)
	if profile.Tower.Shards < 10 then return false,"ต้องใช้ 10 Shards" end
	profile.Tower.Shards -= 10
	profile.AscensionCores += 1
	return true,profile.AscensionCores
end

return TowerService
