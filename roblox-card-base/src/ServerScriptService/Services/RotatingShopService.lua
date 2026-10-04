local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Config = require(Root.Shared.GameConfig)
local Economy = require(Root.Shared.Economy)

local RotatingShopService = {}

local MOD = 4294967296

local function rotationId(now)
	return math.floor((now or os.time())/Config.RotatingShopRestockSeconds)
end

local function rngFor(seed)
	local state = math.floor(tonumber(seed) or 1) % MOD
	return function()
		state = (state*1664525 + 1013904223) % MOD
		return state/MOD
	end
end

local function weightedPickList(pool,rng)
	local total = 0
	for _,item in ipairs(pool) do total += tonumber(item.weight) or 0 end
	if total <= 0 then return pool[1] end
	local roll = rng()*total
	for _,item in ipairs(pool) do
		roll -= tonumber(item.weight) or 0
		if roll <= 0 then return item end
	end
	return pool[#pool]
end

local function weightedTier(weights,rng)
	local total = 0
	for _,weight in pairs(weights or {}) do total += tonumber(weight) or 0 end
	if total <= 0 then return 0 end
	local roll = rng:NextNumber(0,total)
	for tier=0,#Config.Tiers-1 do
		local weight = tonumber(weights[tier]) or 0
		if weight > 0 then
			roll -= weight
			if roll <= 0 then return tier end
		end
	end
	return 0
end

local function copyArray(source)
	local out = {}
	for i,v in ipairs(source) do out[i]=v end
	return out
end

local function ensureProfileState(profile)
	local id = rotationId()
	profile.RotatingShop = type(profile.RotatingShop)=="table" and profile.RotatingShop or {RotationId=id,Bought={}}
	if tonumber(profile.RotatingShop.RotationId) ~= id then
		profile.RotatingShop = {RotationId=id,Bought={}}
	end
	if type(profile.RotatingShop.Bought) ~= "table" then profile.RotatingShop.Bought = {} end
	return id
end

function RotatingShopService.RotationId()
	return rotationId()
end

function RotatingShopService.RemainingSeconds()
	local elapsed = os.time() % Config.RotatingShopRestockSeconds
	return math.max(0,Config.RotatingShopRestockSeconds-elapsed)
end

function RotatingShopService.Offers(profile)
	local id = ensureProfileState(profile)
	local rng = rngFor((id + 0x51F15EED) % MOD)
	local themes = copyArray(Config.IdPacks)
	local archetypes = copyArray(Config.RotatingPackArchetypes)
	local offers = {}

	local entryIndex = 1
	for i,a in ipairs(archetypes) do
		if a.key == "rare-bloom" then entryIndex=i break end
	end
	local entry = table.remove(archetypes,entryIndex)

	for slot=1,Config.RotatingShopSlots do
		if #themes == 0 then themes = copyArray(Config.IdPacks) end
		local themeIndex = math.clamp(math.floor(rng()*#themes)+1,1,#themes)
		local theme = table.remove(themes,themeIndex)

		local archetype
		if slot == 1 then
			archetype = entry
		else
			archetype = weightedPickList(archetypes,rng)
			for i,a in ipairs(archetypes) do
				if a == archetype then table.remove(archetypes,i) break end
			end
		end

		local stockRange = math.max(1,(archetype.stockMax-archetype.stockMin)+1)
		local stock = archetype.stockMin + math.floor(rng()*stockRange)
		local offerId = tostring(id).."-"..tostring(slot-1)
		local bought = math.max(0,math.floor(tonumber(profile.RotatingShop.Bought[offerId]) or 0))
		local cost = Economy.ModeledBaseIncomeForShop(profile.BaseLevel)*archetype.priceSeconds
		local normalRates = {}
		local maxTierCount = Economy.MaxTierForLevel(profile.BaseLevel)
		for tier,weight in pairs(archetype.rates) do
			if tier < maxTierCount and weight > 0 then normalRates[tier]=weight end
		end
		if next(normalRates) == nil then normalRates[archetype.featuredTier]=1 end

		table.insert(offers,{
			Id=offerId,
			Slot=slot,
			RotationId=id,
			ThemeIndex=themeIndex,
			ThemeName=theme.name,
			MinId=theme.minId,
			MaxId=theme.maxId,
			Name=archetype.name,
			Label=archetype.label,
			MinLevel=archetype.minLevel,
			FeaturedTier=archetype.featuredTier,
			Stock=stock,
			Bought=bought,
			StockLeft=math.max(0,stock-bought),
			Cost=cost,
			OutRate=archetype.outRate,
			Rates=normalRates,
			OutPool=archetype.outPool,
		})
	end
	return offers
end

function RotatingShopService.ClientState(profile)
	return {
		RotationId=ensureProfileState(profile),
		RemainingSeconds=RotatingShopService.RemainingSeconds(),
		Offers=RotatingShopService.Offers(profile),
	}
end

function RotatingShopService.Buy(profile,offerId,cardService)
	local selected
	for _,offer in ipairs(RotatingShopService.Offers(profile)) do
		if offer.Id == tostring(offerId) then selected=offer break end
	end
	if not selected then return false,"ร้านรีสต็อกแล้ว · เลือกแพ็กใหม่" end
	if profile.BaseLevel < selected.MinLevel then
		return false,"ปลดล็อกที่ Base Lv."..selected.MinLevel
	end
	if selected.StockLeft <= 0 then return false,"แพ็กนี้ SOLD OUT แล้ว" end
	if profile.Money < selected.Cost then return false,"เงินไม่พอ" end

	local rng = Random.new()
	local outOfRate = rng:NextNumber() < selected.OutRate
	local tier = outOfRate and weightedTier(selected.OutPool,rng) or weightedTier(selected.Rates,rng)
	local card,err = cardService.CreateCard(profile,selected.MinId,selected.MaxId,tier,rng)
	if not card then return false,err end

	profile.Money -= selected.Cost
	profile.RotatingShop.Bought[selected.Id] = selected.Bought+1
	return true,{
		Card=card,
		OfferId=selected.Id,
		OfferName=selected.Name,
		ThemeName=selected.ThemeName,
		OutOfRate=outOfRate,
		Tier=tier,
		Cost=selected.Cost,
		StockLeft=selected.StockLeft-1,
	}
end

return RotatingShopService
