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

function CardService.Roll(profile, entitlements, playerUserId)
	if cardCount(profile) >= 500 then return false,"คลังเต็ม 500 ใบ" end
	local now = os.clock()
	local cooldown = Config.RollSeconds * ((entitlements and entitlements.TurboCollector) and Config.TurboRollMultiplier or 1)
	local readyAt = RollCooldowns[playerUserId] or 0
	if now < readyAt then
		return false,string.format("รอ %.1f วิ",readyAt-now)
	end
	RollCooldowns[playerUserId] = now+cooldown

	local rng = Random.new()
	local tier = Economy.RollTier(profile,rng)
	local id = rng:NextInteger(1,100)
	local guid = HttpService:GenerateGUID(false)
	local card = {
		Guid = guid,
		Id = id,
		Tier = tier,
		Grade = 0,
		Mutation1 = Economy.RollMutation(rng),
		Mutation2 = 0,
		Level = 1,
		Awakening = 0,
		Locked = false,
		ObtainedAt = os.time(),
	}
	profile.Cards[guid] = card
	return true,card
end

function CardService.RollIdPack(profile, packIndex, cost)
	local pack = Config.IdPacks[tonumber(packIndex) or 0]
	if not pack then return false,"ไม่พบแพ็ก" end
	cost = math.max(0,tonumber(cost) or 0)
	if profile.Money < cost then return false,"เงินไม่พอ" end
	profile.Money -= cost
	local rng = Random.new()
	local guid = HttpService:GenerateGUID(false)
	local card = {
		Guid=guid,
		Id=rng:NextInteger(pack.minId,pack.maxId),
		Tier=Economy.RollTier(profile,rng),
		Grade=0,
		Mutation1=Economy.RollMutation(rng),
		Mutation2=0,
		Level=1,
		Awakening=0,
		Locked=false,
		ObtainedAt=os.time(),
	}
	profile.Cards[guid]=card
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
	local income = Economy.CardIntrinsicIncome(card)
	local level = math.max(1,tonumber(card.Level) or 1)
	local value = income*(4+math.min(20,level*0.14))*Economy.EconomyScale(profile.BaseLevel)
	profile.Cards[guid] = nil
	profile.Money += value
	return true,value
end

function CardService.ToggleLock(profile,guid)
	local card = getCard(profile,guid)
	if not card then return false,"ไม่พบการ์ด" end
	card.Locked = not card.Locked
	return true,card.Locked
end

return CardService
