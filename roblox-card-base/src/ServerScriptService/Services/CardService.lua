local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Config = require(Root.Shared.GameConfig)
local Economy = require(Root.Shared.Economy)

local CardService = {}

local RollCooldowns = {}

local function getCard(profile,guid)
	if type(guid) ~= "string" then return nil end
	return profile.Cards[guid]
end

local function cardCount(profile)
	local n = 0
	for _ in pairs(profile.Cards) do n += 1 end
	return n
end

function CardService.CreateCard(profile,minId,maxId,tier,rng)
	rng = rng or Random.new()
	if cardCount(profile) >= Config.MaxCards then
		return nil,"คลังเต็ม "..Config.MaxCards.." ใบ"
	end
	local low = math.clamp(math.floor(tonumber(minId) or 1),1,100)
	local high = math.clamp(math.floor(tonumber(maxId) or 100),low,100)
	local guid = HttpService:GenerateGUID(false)
	local card = {
		Guid = guid,
		Id = rng:NextInteger(low,high),
		Tier = tier ~= nil and math.clamp(math.floor(tonumber(tier) or 0),0,#Config.Tiers-1) or Economy.RollTier(profile,rng),
		Grade = 0,
		Mutation1 = Economy.RollMutation(rng),
		Mutation2 = 0,
		Level = 1,
		Awakening = 0,
		Locked = false,
		ObtainedAt = os.time(),
	}
	profile.Cards[guid] = card
	profile.Collection = type(profile.Collection)=="table" and profile.Collection or {}
	profile.Collection[tostring(card.Id)] = true
	return card
end

function CardService.Roll(profile, entitlements, playerUserId)
	if cardCount(profile) >= Config.MaxCards then return false,"คลังเต็ม "..Config.MaxCards.." ใบ" end
	local now = os.clock()
	local cooldown = Config.RollSeconds * ((entitlements and entitlements.TurboCollector) and Config.TurboRollMultiplier or 1)
	local readyAt = RollCooldowns[playerUserId] or 0
	if now < readyAt then
		return false,string.format("รอ %.1f วิ",readyAt-now)
	end
	RollCooldowns[playerUserId] = now+cooldown

	local rng = Random.new()
	local tier = Economy.RollTier(profile,rng)
	local card,err = CardService.CreateCard(profile,1,100,tier,rng)
	if not card then return false,err end
	return true,card
end

function CardService.RollIdPack(profile, packIndex)
	packIndex = math.floor(tonumber(packIndex) or 0)
	local pack = Config.IdPacks[packIndex]
	if not pack then return false,"ไม่พบแพ็ก" end
	if cardCount(profile) >= Config.MaxCards then return false,"คลังเต็ม "..Config.MaxCards.." ใบ" end
	local cost = Economy.IdPackCost(profile.BaseLevel,packIndex)
	if profile.Money < cost then return false,"เงินไม่พอ · ต้องใช้ "..math.floor(cost) end
	profile.Money -= cost
	local rng = Random.new()
	local tier = Economy.RollTier(profile,rng)
	local card,err = CardService.CreateCard(profile,pack.minId,pack.maxId,tier,rng)
	if not card then return false,err end
	return true,card
end

function CardService.LevelUp(profile,guid)
	local card = getCard(profile,guid)
	if not card then return false,"ไม่พบการ์ด" end
	local cost = Economy.UpgradeCost(profile,card)
	if profile.Money < cost then return false,"เงินไม่พอ" end
	profile.Money -= cost
	card.Level = math.max(1,math.floor(tonumber(card.Level) or 1))+1
	return true,card
end

function CardService.RerollGrade(profile,guid)
	local card = getCard(profile,guid)
	if not card then return false,"ไม่พบการ์ด" end
	local cost = Economy.GradeRerollCost(profile,card)
	if profile.Money < cost then return false,"เงินไม่พอ" end
	profile.Money -= cost
	card.Grade = Economy.RollGrade(Random.new())
	return true,card
end

function CardService.Awaken(profile,guid)
	local card = getCard(profile,guid)
	if not card then return false,"ไม่พบการ์ด" end
	local current = math.max(0,math.floor(tonumber(card.Awakening) or 0))
	local requiredLevel = 100*(current+1)
	if (tonumber(card.Level) or 1) < requiredLevel then
		return false,"ต้อง Card Lv."..requiredLevel
	end
	if (tonumber(card.Grade) or 0) < (#Config.Grades-1) then
		return false,"ต้อง Grade EX★"
	end
	local mutations = 0
	if (tonumber(card.Mutation1) or 0) > 0 then mutations += 1 end
	if (tonumber(card.Mutation2) or 0) > 0 then mutations += 1 end
	if mutations < 2 then return false,"ต้อง Dual Mutation" end
	if profile.AscensionCores < 1 then return false,"Ascension Core ไม่พอ" end

	profile.AscensionCores -= 1
	card.Awakening = current+1
	return true,card
end

function CardService.Sell(profile,guid)
	local card = getCard(profile,guid)
	if not card then return false,"ไม่พบการ์ด" end
	if card.Locked then return false,"การ์ดถูกล็อก" end
	for _,placedGuid in pairs(profile.Placed) do
		if placedGuid == guid then return false,"ถอดการ์ดจากฐานก่อน" end
	end
	local value = Economy.SellValue(profile,card)
	profile.Cards[guid] = nil
	if profile.FeaturedCard == guid then profile.FeaturedCard = "" end
	profile.Money += value
	return true,value
end

local function mutationIds(card)
	local ids = {}
	local seen = {}
	for _,id in ipairs({tonumber(card.Mutation1) or 0,tonumber(card.Mutation2) or 0}) do
		id = math.floor(id)
		if id > 0 and Config.Mutations[id] and not seen[id] then
			seen[id] = true
			table.insert(ids,id)
		end
	end
	return ids
end

local function isPlaced(profile,guid)
	for _,placedGuid in pairs(profile.Placed or {}) do
		if placedGuid == guid then return true end
	end
	return false
end

local function donorChance(target,donor)
	local occupied = #mutationIds(target)
	local base = occupied > 0 and 0.18 or 0.38
	local diff = (tonumber(donor.Tier) or 0)-(tonumber(target.Tier) or 0)
	local tierFactor
	if diff >= 0 then
		tierFactor = math.min(1.82,1+(diff*0.18))
	else
		tierFactor = 0.72 ^ math.abs(diff)
	end
	return math.clamp(base*tierFactor,0.01,0.78)
end

function CardService.MutationInheritanceChance(profile,targetGuid,mutationId,donorGuids)
	local target = getCard(profile,targetGuid)
	mutationId = math.floor(tonumber(mutationId) or 0)
	if not target or mutationId <= 0 or not Config.Mutations[mutationId] then return 0 end
	local owned = {}
	for _,id in ipairs(mutationIds(target)) do owned[id] = true end
	if owned[mutationId] or #mutationIds(target) >= 2 then return 0 end

	local fail = 1
	local seen = {}
	local count = 0
	for _,guid in ipairs(type(donorGuids)=="table" and donorGuids or {}) do
		if count >= 3 then break end
		if type(guid)=="string" and guid ~= targetGuid and not seen[guid] then
			seen[guid] = true
			local donor = getCard(profile,guid)
			if donor and not donor.Locked and not isPlaced(profile,guid) then
				local hasMutation = false
				for _,id in ipairs(mutationIds(donor)) do
					if id == mutationId then hasMutation = true break end
				end
				if hasMutation then
					fail *= (1-donorChance(target,donor))
					count += 1
				end
			end
		end
	end
	if count == 0 then return 0 end
	return math.min(0.95,1-fail)
end

function CardService.InheritMutation(profile,targetGuid,mutationId,donorGuids)
	local target = getCard(profile,targetGuid)
	if not target then return false,"ไม่พบ Target" end
	if #mutationIds(target) >= 2 then return false,"Mutation เต็ม 2 ช่องแล้ว" end

	mutationId = math.floor(tonumber(mutationId) or 0)
	if mutationId <= 0 or not Config.Mutations[mutationId] then return false,"Mutation ไม่ถูกต้อง" end
	for _,id in ipairs(mutationIds(target)) do
		if id == mutationId then return false,"Target มี Mutation นี้อยู่แล้ว" end
	end

	local valid = {}
	local seen = {}
	for _,guid in ipairs(type(donorGuids)=="table" and donorGuids or {}) do
		if #valid >= 3 then break end
		if type(guid)=="string" and guid ~= targetGuid and not seen[guid] then
			seen[guid] = true
			local donor = getCard(profile,guid)
			if donor and not donor.Locked and not isPlaced(profile,guid) then
				for _,id in ipairs(mutationIds(donor)) do
					if id == mutationId then
						table.insert(valid,guid)
						break
					end
				end
			end
		end
	end
	if #valid == 0 then return false,"ไม่มี Donor ที่ใช้ได้" end

	local chance = CardService.MutationInheritanceChance(profile,targetGuid,mutationId,valid)
	for _,guid in ipairs(valid) do
		profile.Cards[guid] = nil
	end

	local success = Random.new():NextNumber() < chance
	if success then
		if (tonumber(target.Mutation1) or 0) <= 0 then
			target.Mutation1 = mutationId
		else
			target.Mutation2 = mutationId
		end
	end

	return true,{
		Success = success,
		Chance = chance,
		Consumed = #valid,
		MutationId = mutationId,
		TargetGuid = targetGuid,
	}
end

function CardService.ToggleLock(profile,guid)
	local card = getCard(profile,guid)
	if not card then return false,"ไม่พบการ์ด" end
	card.Locked = not card.Locked
	return true,card.Locked
end

return CardService
