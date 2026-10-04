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
local GlobalLeaderboardService = require(Services.GlobalLeaderboardService)
local TradeService = require(Services.TradeService)
local DailyService = require(Services.DailyService)

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

local OpenPanel = RemotesFolder:FindFirstChild("OpenPanel") or Instance.new("RemoteEvent")
OpenPanel.Name = "OpenPanel"
OpenPanel.Parent = RemotesFolder

local TradeEvent = RemotesFolder:FindFirstChild("TradeEvent") or Instance.new("RemoteEvent")
TradeEvent.Name = "TradeEvent"
TradeEvent.Parent = RemotesFolder

local Remotes = {Action=Action,State=State,Toast=Toast,OpenStand=OpenStand,OpenPanel=OpenPanel,TradeEvent=TradeEvent}

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
		Daily = DailyService.ClientState(profile,entitlements),
		Entitlements = entitlements,
	}
	return snapshot
end

local function updateLeaderstats(player,profile,snapshot)
	local folder = player:FindFirstChild("leaderstats")
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "leaderstats"
		folder.Parent = player
	end

	local function numberValue(name,value)
		local item = folder:FindFirstChild(name)
		if not item then
			item = Instance.new("IntValue")
			item.Name = name
			item.Parent = folder
		end
		item.Value = math.max(0,math.floor(tonumber(value) or 0))
	end

	numberValue("Base",profile.BaseLevel)
	numberValue("Asc",profile.Ascension)
	numberValue("Income",snapshot.Computed.Income)
end

local function pushState(player,renderWorld)
	if not player.Parent then return end
	if renderWorld then PlotService.Render(player) end
	local snapshot = enrichedSnapshot(player)
	if snapshot then
		local profile = DataService.Get(player)
		if profile then updateLeaderstats(player,profile,snapshot) end
		State:FireClient(player,snapshot)
	end
end

DataService.Start()
PlotService.Start(DataService,MonetizationService,Remotes)
MonetizationService.Start(DataService,pushState)
BaseService.Start(DataService,MonetizationService,pushState)
GlobalLeaderboardService.Start(DataService,MonetizationService)
TradeService.Start(DataService,pushState,TradeEvent)

task.spawn(function()
	while task.wait(30) do
		PlotService.RenderGlobalLeaderboard(GlobalLeaderboardService.GetTop(8))
	end
end)

local function markAndPush(player,renderWorld)
	DataService.MarkDirty(player)
	pushState(player,renderWorld)
end

local function joinPlayer(player)
	local profile = DataService.Load(player)
	if not profile then return end
	DailyService.TouchLogin(profile)
	DataService.MarkDirty(player)
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

local ActionRate = {}

local function actionAllowed(player,action)
	local userId = player.UserId
	local now = os.clock()
	local bucket = ActionRate[userId]
	if not bucket or now-bucket.Window >= 1 then
		bucket = {Window=now,Count=0,Last={}}
		ActionRate[userId]=bucket
	end
	bucket.Count += 1
	if bucket.Count > 28 then return false end

	local cooldown = action == "GetSocial" and 0.8
		or string.sub(action,1,5) == "Trade" and 0.12
		or action == "GetState" and 0.25
		or 0.04
	local last = bucket.Last[action] or 0
	if now-last < cooldown then return false end
	bucket.Last[action]=now
	return true
end

Players.PlayerRemoving:Connect(function(player)
	ActionRate[player.UserId]=nil
end)

local function serverPlayersSnapshot(viewer)
	local rows = {}
	for _,other in ipairs(Players:GetPlayers()) do
		if other ~= viewer then
			local profile = DataService.Get(other)
			if profile then
				local entitlements = MonetizationService.GetEntitlements(other)
				table.insert(rows,{
					UserId=other.UserId,
					Name=other.Name,
					DisplayName=other.DisplayName,
					BaseLevel=profile.BaseLevel,
					Ascension=profile.Ascension,
					Income=Economy.TotalIncome(profile,entitlements),
				})
			end
		end
	end
	table.sort(rows,function(a,b)
		if a.Ascension ~= b.Ascension then return a.Ascension > b.Ascension end
		if a.BaseLevel ~= b.BaseLevel then return a.BaseLevel > b.BaseLevel end
		return a.Income > b.Income
	end)
	return rows
end

Action.OnServerInvoke = function(player,action,args)
	action = tostring(action or "")
	if not actionAllowed(player,action) then
		return result(false,"ทำรายการเร็วเกินไป กรุณารอสักครู่")
	end
	local profile = DataService.Get(player)
	if not profile then return result(false,"Profile ยังไม่พร้อม") end
	args = type(args)=="table" and args or {}

	if action == "GetState" then
		return result(true,enrichedSnapshot(player))
	end
	if action == "GetSocial" then
		return result(true,{
			ServerPlayers=serverPlayersSnapshot(player),
			Global=GlobalLeaderboardService.GetTop(25),
			Trade=TradeService.GetSession(player),
		})
	end
	if action == "ClaimDailyLogin" then
		local ok,payload=DailyService.ClaimLogin(profile,MonetizationService.GetEntitlements(player))
		if ok then markAndPush(player,false) end
		return result(ok,payload)
	end
	if action == "ClaimDailyMission" then
		local ok,payload=DailyService.ClaimMission(profile,args.Key,MonetizationService.GetEntitlements(player))
		if ok then markAndPush(player,false) end
		return result(ok,payload)
	end
	if action == "ClaimDailyBonus" then
		local ok,payload=DailyService.ClaimBonus(profile,MonetizationService.GetEntitlements(player))
		if ok then markAndPush(player,false) end
		return result(ok,payload)
	end
	if action == "TradeRequest" then
		local ok,payload=TradeService.Request(player,args.TargetUserId)
		return result(ok,payload)
	end
	if action == "TradeRespond" then
		local ok,payload=TradeService.Respond(player,args.FromUserId,args.Accept==true)
		return result(ok,payload)
	end
	if action == "TradeSetOffer" then
		local ok,payload=TradeService.SetOffer(player,args.CardGuids)
		return result(ok,payload)
	end
	if action == "TradeReady" then
		local ok,payload=TradeService.SetReady(player,args.Ready==true)
		return result(ok,payload)
	end
	if action == "TradeConfirm" then
		local ok,payload=TradeService.Confirm(player)
		return result(ok,payload)
	end
	if action == "TradeCancel" then
		return result(TradeService.Cancel(player),"Trade cancelled")
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
		if ok then DailyService.Add(profile,"Rolls",1) end
		if ok and not hadPlaced then
			local placed = BaseService.Place(profile,payload.Guid,1)
			if placed then
				DailyService.Add(profile,"Places",1)
				Toast:FireClient(player,"การ์ดใบแรกถูกวางที่ Stand 1 อัตโนมัติ ✦",true)
			end
		end
	elseif action == "RollIdPack" then
		local hadPlaced = next(profile.Placed) ~= nil
		ok,payload = CardService.RollIdPack(profile,args.PackIndex)
		if ok then DailyService.Add(profile,"Rolls",1) end
		if ok and not hadPlaced then
			local placed = BaseService.Place(profile,payload.Guid,1)
			if placed then
				DailyService.Add(profile,"Places",1)
				Toast:FireClient(player,"การ์ดใบแรกถูกวางที่ Stand 1 อัตโนมัติ ✦",true)
			end
		end
	elseif action == "BuyRotatingPack" then
		local hadPlaced = next(profile.Placed) ~= nil
		ok,payload = RotatingShopService.Buy(profile,args.OfferId,CardService)
		if ok then DailyService.Add(profile,"Rolls",1) end
		if ok and not hadPlaced and payload.Card then
			local placed = BaseService.Place(profile,payload.Card.Guid,1)
			if placed then
				Toast:FireClient(player,"การ์ดใบแรกถูกวางที่ Stand 1 อัตโนมัติ ✦",true)
			end
		end
	elseif action == "LevelUp" then
		ok,payload = CardService.LevelUp(profile,args.Guid)
		if ok then DailyService.Add(profile,"Upgrades",1) end
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
		if ok then DailyService.Add(profile,"Places",1) end
	elseif action == "Remove" then
		ok,payload = BaseService.Remove(profile,args.Slot)
	elseif action == "AutoEquipBest" then
		ok,payload = BaseService.AutoEquipBest(profile,MonetizationService.GetEntitlements(player))
		if ok then DailyService.Add(profile,"Places",1) end
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
