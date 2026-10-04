local Players = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Config = require(Root.Shared.GameConfig)
local Economy = require(Root.Shared.Economy)

local MonetizationService = {}

local DataService
local OnChanged
local Entitlements = {}

local function blankEntitlements()
	return {
		VIPCollector=false,
		TurboCollector=false,
		OfflineVault=false,
		ShowcasePro=false,
	}
end

local function productNameFromId(productId)
	for name,id in pairs(Config.ProductIds) do
		if id > 0 and id == productId then return name end
	end
	return nil
end

function MonetizationService.GetEntitlements(player)
	return Entitlements[player.UserId] or blankEntitlements()
end

function MonetizationService.RefreshPasses(player)
	local owned = blankEntitlements()
	for name,id in pairs(Config.PassIds) do
		if id > 0 then
			local ok,result = pcall(MarketplaceService.UserOwnsGamePassAsync,MarketplaceService,player.UserId,id)
			if ok then owned[name] = result == true end
		end
	end
	Entitlements[player.UserId] = owned
	if OnChanged then OnChanged(player,true) end
	return owned
end

local function grantProduct(profile,productName,entitlements)
	local cashSeconds = Config.ProductCashSeconds[productName]
	if cashSeconds then
		local income = Economy.TotalIncome(profile,entitlements)
		local starterFloor = 1000*Economy.EconomyScale(profile.BaseLevel)
		local amount = math.max(starterFloor,income*cashSeconds)
		profile.Money += amount
		return
	end

	local boostSeconds = Config.ProductBoostSeconds[productName]
	if boostSeconds then
		local now = os.time()
		local current = math.max(now,tonumber(profile.Boosts.DoubleIncomeUntil) or 0)
		profile.Boosts.DoubleIncomeUntil = current+boostSeconds
		return
	end

	if productName == "Tip10" or productName == "Tip50" or productName == "Tip100" then
		return
	end

	error("unknown_product:"..tostring(productName))
end

function MonetizationService.Start(dataService,onChanged)
	DataService = dataService
	OnChanged = onChanged

	MarketplaceService.ProcessReceipt = function(receiptInfo)
		local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
		if not player then
			return Enum.ProductPurchaseDecision.NotProcessedYet
		end
		local productName = productNameFromId(receiptInfo.ProductId)
		if not productName then
			warn("[Monetization] Unknown product id",receiptInfo.ProductId)
			return Enum.ProductPurchaseDecision.NotProcessedYet
		end

		local entitlements = MonetizationService.GetEntitlements(player)
		local ok,reason = DataService.ProcessReceipt(player,receiptInfo.PurchaseId,function(profile)
			grantProduct(profile,productName,entitlements)
		end)
		if not ok then
			warn("[Monetization] Receipt retry",receiptInfo.PurchaseId,reason)
			return Enum.ProductPurchaseDecision.NotProcessedYet
		end
		if OnChanged then OnChanged(player,true) end
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end

	MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player,passId,purchased)
		if not purchased then return end
		for _,id in pairs(Config.PassIds) do
			if id > 0 and id == passId then
				task.defer(function()
					MonetizationService.RefreshPasses(player)
				end)
				break
			end
		end
	end)

	Players.PlayerRemoving:Connect(function(player)
		Entitlements[player.UserId] = nil
	end)
end

return MonetizationService
