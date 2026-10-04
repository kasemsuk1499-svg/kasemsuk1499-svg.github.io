local Config = require(script.Parent.GameConfig)

local Economy = {}

local function tierDef(tier)
	return Config.Tiers[math.clamp(math.floor(tonumber(tier) or 0),0,#Config.Tiers-1)+1]
end

local function gradeDef(grade)
	return Config.Grades[math.clamp(math.floor(tonumber(grade) or 0),0,#Config.Grades-1)+1]
end

local function mutationDef(id)
	return Config.Mutations[math.clamp(math.floor(tonumber(id) or 0),0,12)] or Config.Mutations[0]
end

local function roundUpNice(value)
	if value <= 0 then return 0 end
	local power = math.max(0, math.floor(math.log10(value)) - 2)
	local step = 10 ^ power
	return math.ceil(value / step) * step
end

function Economy.StandLimit(level)
	local lv = math.clamp(math.floor(tonumber(level) or 1),1,Config.BaseLevelCap)
	return Config.StandLimits[lv] or Config.MaxStandSlots
end

function Economy.BaseIncomeMultiplier(level)
	local lv = math.clamp(tonumber(level) or 1,1,Config.BaseLevelCap)
	return 1 + (lv - 1) * 0.25
end

function Economy.EconomyScale(level)
	local lv = math.clamp(tonumber(level) or 1,1,Config.BaseLevelCap)
	return 5 ^ (lv - 1)
end

function Economy.AscensionIncomeMultiplier(profile, entitlements)
	local asc = math.max(0,math.floor(tonumber(profile.Ascension) or 0))
	local incomePerk = math.max(0,math.floor(tonumber(profile.Perks and profile.Perks.Income) or 0))
	local value = 1 + asc * Config.AscensionIncomePerCycle + incomePerk * 0.10
	if entitlements and entitlements.VIPCollector then
		value *= (1 + Config.VipIncomeBonus)
	end
	local untilTime = tonumber(profile.Boosts and profile.Boosts.DoubleIncomeUntil) or 0
	if untilTime > os.time() then
		value *= 2
	end
	return value
end

function Economy.LuckValue(level)
	local x = math.max(0,(tonumber(level) or 1)-1)
	return 1 + 0.045*x + 0.0035*(x^1.28)
end

function Economy.MutationIncomeMultiplier(card)
	local result = 1
	for _,id in ipairs({card.Mutation1,card.Mutation2}) do
		local n = tonumber(id) or 0
		if n > 0 then result *= mutationDef(n).income end
	end
	return result
end

function Economy.MutationLuckRawBonus(card)
	local result = 0
	for _,id in ipairs({card.Mutation1,card.Mutation2}) do
		local n = tonumber(id) or 0
		if n > 0 then result += math.max(0,mutationDef(n).luck-1) end
	end
	return result
end

function Economy.PlacedMutationLuckMultiplier(profile)
	local limit = Economy.StandLimit(profile.BaseLevel)
	local raw = 0
	for slot=1,limit do
		local guid = profile.Placed and profile.Placed[tostring(slot)]
		local card = guid and profile.Cards and profile.Cards[guid]
		if card then raw += Economy.MutationLuckRawBonus(card) end
	end
	local soft = raw / (1 + raw/1.25)
	return 1 + soft
end

function Economy.EffectiveLuck(profile)
	local asc = math.max(0,math.floor(tonumber(profile.Ascension) or 0))
	local luckPerk = math.max(0,math.floor(tonumber(profile.Perks and profile.Perks.Luck) or 0))
	return Economy.LuckValue(profile.BaseLevel)
		* Economy.PlacedMutationLuckMultiplier(profile)
		* (1 + asc*Config.AscensionLuckPerCycle + luckPerk*0.03)
end

function Economy.MaxTierForLevel(level)
	local lv = math.max(1,tonumber(level) or 1)
	local count = 0
	for _,need in ipairs(Config.TierUnlockAt) do
		if lv >= need then count += 1 end
	end
	return math.clamp(count,3,10)
end

local function lowTierWeightMultiplier(tier, level)
	local p = math.clamp(((tonumber(level) or 1)-8)/18,0,1)
	if tier == 0 then return 1-(0.88*p) end
	if tier == 1 then return 1-(0.68*p) end
	if tier == 2 then return 1-(0.38*p) end
	if tier == 3 then return 1-(0.12*p) end
	return 1
end

function Economy.TierOdds(profile)
	local maxTier = Economy.MaxTierForLevel(profile.BaseLevel)
	local luck = Economy.EffectiveLuck(profile)
	local ratio = math.min(0.40,0.235+0.08*math.max(0,luck-1))
	local weights,total = {},0
	for tier=0,9 do
		local w = 0
		if tier < maxTier then
			w = (ratio^tier)*lowTierWeightMultiplier(tier,profile.BaseLevel)
		end
		weights[tier] = w
		total += w
	end
	for tier=0,9 do
		weights[tier] = total > 0 and weights[tier]/total or 0
	end
	return weights
end

function Economy.RollTier(profile, rng)
	rng = rng or Random.new()
	local odds = Economy.TierOdds(profile)
	local r = rng:NextNumber()
	for tier=0,9 do
		r -= odds[tier] or 0
		if r <= 0 then return tier end
	end
	return 0
end

function Economy.RollGrade(rng)
	rng = rng or Random.new()
	local total = 0
	for _,w in ipairs(Config.GradeWeights) do total += w end
	local r = rng:NextNumber(0,total)
	for i,w in ipairs(Config.GradeWeights) do
		r -= w
		if r <= 0 then return i-1 end
	end
	return 0
end

function Economy.RollMutation(rng)
	rng = rng or Random.new()
	local total = 0
	for id=0,12 do total += mutationDef(id).weight end
	local r = rng:NextNumber(0,total)
	for id=0,12 do
		r -= mutationDef(id).weight
		if r <= 0 then return id end
	end
	return 0
end

function Economy.CardIntrinsicIncome(card)
	local id = math.clamp(math.floor(tonumber(card.Id) or 1),1,100)
	local charMulti = 1 + (id-1)*0.003
	local charBase = 470*charMulti
	local levelMulti = 1.04 ^ math.max(0,(tonumber(card.Level) or 1)-1)
	local awakenMulti = 1 + math.max(0,tonumber(card.Awakening) or 0)*Config.AwakeningIncomePerStar
	return charBase
		* tierDef(card.Tier).multi
		* gradeDef(card.Grade).multi
		* levelMulti
		* awakenMulti
		* Economy.MutationIncomeMultiplier(card)
end

function Economy.CardIncome(profile, card, entitlements)
	return Economy.CardIntrinsicIncome(card)
		* Economy.BaseIncomeMultiplier(profile.BaseLevel)
		* Economy.EconomyScale(profile.BaseLevel)
		* Economy.AscensionIncomeMultiplier(profile,entitlements)
end

function Economy.TotalIncome(profile, entitlements)
	local limit = Economy.StandLimit(profile.BaseLevel)
	local total = 0
	for slot=1,limit do
		local guid = profile.Placed and profile.Placed[tostring(slot)]
		local card = guid and profile.Cards and profile.Cards[guid]
		if card then total += Economy.CardIncome(profile,card,entitlements) end
	end
	return total
end

function Economy.ForgeCostMultiplier(profile)
	local forge = math.max(0,math.floor(tonumber(profile.Perks and profile.Perks.Forge) or 0))
	return 0.94 ^ forge
end

function Economy.UpgradeCost(profile, card)
	local income = Economy.CardIntrinsicIncome(card)
	local level = math.max(1,tonumber(card.Level) or 1)
	local seconds = 40 * (1.05^(level-1))
	return roundUpNice(income*seconds*Economy.BaseIncomeMultiplier(profile.BaseLevel)*Economy.EconomyScale(profile.BaseLevel)*Economy.ForgeCostMultiplier(profile))
end

function Economy.GradeRerollCost(profile, card)
	local tier = math.clamp(math.floor(tonumber(card.Tier) or 0),0,9)
	return (Config.GradeRerollCosts[tier+1] or Config.GradeRerollCosts[1])
		* Economy.EconomyScale(profile.BaseLevel)
		* Economy.ForgeCostMultiplier(profile)
end

local function expectedTierMultiplier(level)
	local lv = math.max(1,tonumber(level) or 1)
	local legacyMax = math.min(10,math.max(3,lv+2))
	local legacyLuck = 1+(lv-1)*0.145
	local legacyRatio = math.min(0.62,0.24+0.124*math.max(0,legacyLuck-1))
	local weights,total = {},0
	for tier=0,9 do
		local w = tier < legacyMax and legacyRatio^tier or 0
		weights[tier]=w
		total += w
	end
	local out = 0
	for tier=0,9 do
		out += (total > 0 and weights[tier]/total or 0)*tierDef(tier).multi
	end
	return out
end

function Economy.RebirthTargetSeconds(level)
	local lv = math.clamp(math.floor(tonumber(level) or 1),1,Config.BaseLevelCap)
	local x = lv-1
	return math.floor(240*(1.16^x)+35*x+0.5)
end

function Economy.RebirthCost(level)
	local lv = math.clamp(math.floor(tonumber(level) or 1),1,Config.BaseLevelCap)
	local x = lv-1
	local avgCharacterIncome = 545
	local assumedCardLevel = 1+math.floor(x*4.2+0.5)
	local optimizationFactor = 1+(0.10*x)+(0.018*x*x)
	local expectedCardIncome = avgCharacterIncome
		* expectedTierMultiplier(lv)
		* (1.04^(assumedCardLevel-1))
		* Economy.BaseIncomeMultiplier(lv)
	local expectedBaseIncome = expectedCardIncome*Economy.StandLimit(lv)
	return roundUpNice(expectedBaseIncome*Economy.RebirthTargetSeconds(lv)*optimizationFactor*Economy.EconomyScale(lv))
end

function Economy.Title(profile)
	local lv = math.clamp(math.floor(tonumber(profile.BaseLevel) or 1),1,Config.BaseLevelCap)
	return Config.Titles[lv] or Config.Titles[1]
end

return Economy
