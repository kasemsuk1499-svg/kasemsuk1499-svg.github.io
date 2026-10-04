local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Config = require(Root.Shared.GameConfig)
local Economy = require(Root.Shared.Economy)

local Services = script.Parent:WaitForChild("Services")
local DataService = require(Services.DataService)
local CardService = require(Services.CardService)
local BaseService = require(Services.BaseService)
local TowerService = require(Services.TowerService)
local RotatingShopService = require(Services.RotatingShopService)
local MonetizationService = require(Services.MonetizationService)
local PlotService = require(Services.PlotService)

local RemotesFolder = Root:FindFirstChild("Remotes") or Instance.new("Folder")
RemotesFolder.Name = "Remotes"
RemotesFolder.Parent = Root

local Action = RemotesFolder:FindFirstChild("Action") or Instance.new("RemoteFunction")
Action.Name = "Action"
Action.Parent = RemotesFolder

local State = RemotesFolder:FindFirstChild("State") or Instance.new("RemoteEvent")
State.Name = "State"
State.Parent = RemotesFolder

local Toast = RemotesFolder:FindFirstChild("Toast") or Instance.new("RemoteEvent")
Toast.Name = "Toast"
Toast.Parent = RemotesFolder

local OpenStand = RemotesFolder:FindFirstChild("OpenStand") or Instance.new("RemoteEvent")
OpenStand.Name = "OpenStand"
OpenStand.Parent = RemotesFolder

local Remotes = {Action=Action,State=State,Toast=Toast,OpenStand=OpenStand}

local function enrichedSnapshot(player)
	local profile = DataService.Get(player)
	if not profile then return nil end
	local snapshot = DataService.ClientSnapshot(player)
	local entitlements = MonetizationService.GetEntitlements(player)
	local conditionOk,conditionText = TowerService.Condition(profile,profile.Tower.Floor)
	snapshot.Computed = {
		Income = Economy.TotalIncome(profile,entitlements),
		Luck = Economy.EffectiveLuck(profile),
		StandLimit = Economy.StandLimit(profile.BaseLevel),
		RebirthCost = profile.BaseLevel < Config.BaseLevelCap and Economy.RebirthCost(profile.BaseLevel) or 0,
		Title = BaseService.Title(profile),
		AscensionRoman = BaseService.Roman(profile.Ascension),
		TowerPower = TowerService.Power(profile),
		TowerRequirement = TowerService.Requirement(profile.Tower.Floor),
		TowerConditionOk = conditionOk,
		TowerCondition = conditionText,
		RotatingShop = RotatingShopService.ClientState(profile),
		Entitlements = entitlements,
	}
	return snapshot
end

local function pushState(player,renderWorld)
	if not player.Parent then return end
	if renderWorld then PlotService.Render(player) end
	local snapshot = enrichedSnapshot(player)
	if snapshot then State:FireClient(player,snapshot) end
end

DataService.Start()
PlotService.Start(DataService,MonetizationService,Remotes)
MonetizationService.Start(DataService,pushState)
BaseService.Start(DataService,MonetizationService,pushState)

local function markAndPush(player,renderWorld)
	DataService.MarkDirty(player)
	pushState(player,renderWorld)
end

local function joinPlayer(player)
	local profile = DataService.Load(player)
	if not profile then return end
	MonetizationService.RefreshPasses(player)
	local offlineGain = BaseService.ApplyOfflineIncome(player)
	PlotService.Assign(player)
	pushState(player,true)
	if offlineGain > 0 then
		Toast:FireClient(player,string.format("Offline Income +%.0f",offlineGain),true)
	end
end

Players.PlayerAdded:Connect(joinPlayer)
Players.PlayerRemoving:Connect(function(player)
	DataService.Save(player,true)
end)
for _,player in ipairs(Players:GetPlayers()) do task.spawn(joinPlayer,player) end

local function result(ok,payload)
	return {ok=ok,data=ok and payload or nil,error=not ok and payload or nil}
end

Action.OnServerInvoke = function(player,action,args)
	local profile = DataService.Get(player)
	if not profile then return result(false,"Profile ยังไม่พร้อม") end
	args = type(args)=="table" and args or {}

	if action == "GetState" then
		return result(true,enrichedSnapshot(player))
	end
	if action == "TeleportHome" then
		return result(PlotService.TeleportHome(player),true)
	end
	if action == "TeleportFloor" then
		return result(PlotService.TeleportFloor(player,args.Floor),true)
	end

	local ok,payload
	if action == "RollPack" then
		local hadPlaced = next(profile.Placed) ~= nil
		ok,payload = CardService.Roll(profile,MonetizationService.GetEntitlements(player),player.UserId)
		if ok and not hadPlaced then
			local placed = BaseService.Place(profile,payload.Guid,1)
			if placed then
				Toast:FireClient(player,"การ์ดใบแรกถูกวางที่ Stand 1 อัตโนมัติ ✦",true)
			end
		end
	elseif action == "RollIdPack" then
		local hadPlaced = next(profile.Placed) ~= nil
		ok,payload = CardService.RollIdPack(profile,args.PackIndex)
		if ok and not hadPlaced then
			local placed = BaseService.Place(profile,payload.Guid,1)
			if placed then
				Toast:FireClient(player,"การ์ดใบแรกถูกวางที่ Stand 1 อัตโนมัติ ✦",true)
			end
		end
	elseif action == "BuyRotatingPack" then
		local hadPlaced = next(profile.Placed) ~= nil
		ok,payload = RotatingShopService.Buy(profile,args.OfferId,CardService)
		if ok and not hadPlaced and payload.Card then
			local placed = BaseService.Place(profile,payload.Card.Guid,1)
			if placed then
				Toast:FireClient(player,"การ์ดใบแรกถูกวางที่ Stand 1 อัตโนมัติ ✦",true)
			end
		end
	elseif action == "LevelUp" then
		ok,payload = CardService.LevelUp(profile,args.Guid)
	elseif action == "RerollGrade" then
		ok,payload = CardService.RerollGrade(profile,args.Guid)
	elseif action == "Awaken" then
		ok,payload = CardService.Awaken(profile,args.Guid)
	elseif action == "MutationInherit" then
		ok,payload = CardService.InheritMutation(profile,args.TargetGuid,args.MutationId,args.DonorGuids)
	elseif action == "Sell" then
		ok,payload = CardService.Sell(profile,args.Guid)
	elseif action == "ToggleLock" then
		ok,payload = CardService.ToggleLock(profile,args.Guid)
	elseif action == "Place" then
		ok,payload = BaseService.Place(profile,args.Guid,args.Slot)
	elseif action == "Remove" then
		ok,payload = BaseService.Remove(profile,args.Slot)
	elseif action == "AutoEquipBest" then
		ok,payload = BaseService.AutoEquipBest(profile,MonetizationService.GetEntitlements(player))
	elseif action == "Rebirth" then
		ok,payload = BaseService.Rebirth(profile)
	elseif action == "Ascend" then
		ok,payload = BaseService.Ascend(profile)
	elseif action == "BuyPerk" then
		ok,payload = BaseService.BuyPerk(profile,args.Key)
	elseif action == "TowerChallenge" then
		ok,payload = TowerService.Challenge(profile)
	elseif action == "TowerForgeCore" then
		ok,payload = TowerService.ForgeCore(profile)
	else
		return result(false,"Unknown action")
	end

	if ok then
		markAndPush(player,true)
		return result(true,payload)
	end
	return result(false,payload)
end
