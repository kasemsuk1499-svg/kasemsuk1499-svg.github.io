local Players = game:GetService("Players")

local TradeService = {}

local DataService
local OnChanged
local TradeEvent

local PendingByTarget = {}
local SessionByUser = {}
local NextSessionId = 0

local function cardPublic(card)
	return {
		Guid=card.Guid,
		Id=card.Id,
		Tier=card.Tier,
		Grade=card.Grade,
		Level=card.Level,
		Mutation1=card.Mutation1,
		Mutation2=card.Mutation2,
		Awakening=card.Awakening,
		Locked=card.Locked == true,
	}
end

local function isPlaced(profile,guid)
	for _,placedGuid in pairs(profile.Placed or {}) do
		if placedGuid == guid then return true end
	end
	return false
end

local function validTradeCard(profile,guid)
	local card = profile.Cards and profile.Cards[guid]
	if not card then return false,"ไม่พบการ์ด" end
	if card.Locked then return false,"การ์ดถูก Lock" end
	if isPlaced(profile,guid) then return false,"ถอดการ์ดจากฐานก่อน" end
	return true,card
end

local function sideFor(session,userId)
	if session.A.UserId == userId then return session.A,session.B end
	if session.B.UserId == userId then return session.B,session.A end
	return nil,nil
end

local function sessionPublic(session,viewerId)
	local mine,other = sideFor(session,viewerId)
	if not mine then return nil end
	local function cardsFor(side)
		local p = Players:GetPlayerByUserId(side.UserId)
		local profile = p and DataService.Get(p)
		local out = {}
		if profile then
			for _,guid in ipairs(side.Offer) do
				local card = profile.Cards[guid]
				if card then table.insert(out,cardPublic(card)) end
			end
		end
		return out
	end
	return {
		Id=session.Id,
		PartnerUserId=other.UserId,
		PartnerName=other.Name,
		MyOffer=cardsFor(mine),
		TheirOffer=cardsFor(other),
		MyReady=mine.Ready,
		TheirReady=other.Ready,
		MyConfirmed=mine.Confirmed,
		TheirConfirmed=other.Confirmed,
		LockedAt=session.LockedAt,
		State=session.State,
	}
end

local function fireSession(session)
	for _,side in ipairs({session.A,session.B}) do
		local player = Players:GetPlayerByUserId(side.UserId)
		if player and TradeEvent then
			TradeEvent:FireClient(player,{Type="Session",Session=sessionPublic(session,side.UserId)})
		end
	end
end

local function endSession(session,reason)
	if not session then return end
	SessionByUser[session.A.UserId] = nil
	SessionByUser[session.B.UserId] = nil
	for _,side in ipairs({session.A,session.B}) do
		local player = Players:GetPlayerByUserId(side.UserId)
		if player and TradeEvent then
			TradeEvent:FireClient(player,{Type="Ended",Reason=reason or "Trade ended"})
		end
	end
end

local function normalizeOffer(profile,guids)
	if type(guids) ~= "table" then return false,"Offer ไม่ถูกต้อง" end
	local seen,out = {},{}
	for _,guid in ipairs(guids) do
		if type(guid)=="string" and not seen[guid] then
			local ok,cardOrError = validTradeCard(profile,guid)
			if not ok then return false,cardOrError end
			seen[guid]=true
			table.insert(out,guid)
			if #out >= 4 then break end
		end
	end
	return true,out
end

local function revalidate(session)
	for _,side in ipairs({session.A,session.B}) do
		local player = Players:GetPlayerByUserId(side.UserId)
		local profile = player and DataService.Get(player)
		if not profile then return false,"ผู้เล่นออกจากเซิร์ฟเวอร์" end
		for _,guid in ipairs(side.Offer) do
			local ok,err = validTradeCard(profile,guid)
			if not ok then return false,side.Name..": "..tostring(err) end
		end
	end
	return true
end

local function swapCards(session)
	local playerA = Players:GetPlayerByUserId(session.A.UserId)
	local playerB = Players:GetPlayerByUserId(session.B.UserId)
	local profileA = playerA and DataService.Get(playerA)
	local profileB = playerB and DataService.Get(playerB)
	if not profileA or not profileB then return false,"ผู้เล่นออกจากเซิร์ฟเวอร์" end

	local ok,err = revalidate(session)
	if not ok then return false,err end

	local cardsA,cardsB = {},{}
	for _,guid in ipairs(session.A.Offer) do
		cardsA[guid]=profileA.Cards[guid]
	end
	for _,guid in ipairs(session.B.Offer) do
		cardsB[guid]=profileB.Cards[guid]
	end

	profileA.Collection = type(profileA.Collection)=="table" and profileA.Collection or {}
	profileB.Collection = type(profileB.Collection)=="table" and profileB.Collection or {}
	local oldFeaturedA,oldFeaturedB=profileA.FeaturedCard,profileB.FeaturedCard
	local oldCollectionA,oldCollectionB={},{}
	for _,card in pairs(cardsB) do
		local key=tostring(card.Id)
		oldCollectionA[key]=profileA.Collection[key]
	end
	for _,card in pairs(cardsA) do
		local key=tostring(card.Id)
		oldCollectionB[key]=profileB.Collection[key]
	end

	for guid in pairs(cardsA) do
		profileA.Cards[guid]=nil
		if profileA.FeaturedCard==guid then profileA.FeaturedCard="" end
	end
	for guid in pairs(cardsB) do
		profileB.Cards[guid]=nil
		if profileB.FeaturedCard==guid then profileB.FeaturedCard="" end
	end
	for guid,card in pairs(cardsA) do
		if profileB.Cards[guid] then
			-- Extremely unlikely GUID collision; rollback before touching saves.
			for g in pairs(cardsA) do profileA.Cards[g]=cardsA[g] end
			for g in pairs(cardsB) do profileB.Cards[g]=cardsB[g] end
			return false,"Card GUID collision"
		end
		profileB.Cards[guid]=card
		profileB.Collection[tostring(card.Id)]=true
	end
	for guid,card in pairs(cardsB) do
		profileA.Cards[guid]=card
		profileA.Collection[tostring(card.Id)]=true
	end

	DataService.MarkDirty(playerA)
	DataService.MarkDirty(playerB)

	local savedA = DataService.Save(playerA,false)
	local savedB = DataService.Save(playerB,false)
	if not savedA or not savedB then
		-- Best-effort rollback and re-save both profiles.
		for guid in pairs(cardsA) do profileB.Cards[guid]=nil end
		for guid in pairs(cardsB) do profileA.Cards[guid]=nil end
		for guid,card in pairs(cardsA) do profileA.Cards[guid]=card end
		for guid,card in pairs(cardsB) do profileB.Cards[guid]=card end
		profileA.FeaturedCard=oldFeaturedA
		profileB.FeaturedCard=oldFeaturedB
		for key,value in pairs(oldCollectionA) do profileA.Collection[key]=value end
		for key,value in pairs(oldCollectionB) do profileB.Collection[key]=value end
		DataService.MarkDirty(playerA)
		DataService.MarkDirty(playerB)
		DataService.Save(playerA,false)
		DataService.Save(playerB,false)
		return false,"บันทึก Trade ไม่สำเร็จ กรุณาลองใหม่"
	end

	if OnChanged then
		OnChanged(playerA,true)
		OnChanged(playerB,true)
	end
	return true
end

function TradeService.Request(player,targetUserId)
	targetUserId = tonumber(targetUserId)
	if not targetUserId or targetUserId == player.UserId then return false,"เลือกผู้เล่นไม่ถูกต้อง" end
	if SessionByUser[player.UserId] then return false,"คุณกำลัง Trade อยู่" end
	local target = Players:GetPlayerByUserId(targetUserId)
	if not target or not DataService.Get(target) then return false,"ผู้เล่นไม่พร้อม" end
	if SessionByUser[targetUserId] then return false,"ผู้เล่นกำลัง Trade อยู่" end

	PendingByTarget[targetUserId] = {From=player.UserId,At=os.time()}
	if TradeEvent then
		TradeEvent:FireClient(target,{Type="Request",FromUserId=player.UserId,FromName=player.DisplayName})
	end
	return true,"ส่งคำขอแล้ว"
end

function TradeService.Respond(player,fromUserId,accept)
	fromUserId = tonumber(fromUserId)
	local pending = PendingByTarget[player.UserId]
	if not pending or pending.From ~= fromUserId or os.time()-pending.At > 30 then
		PendingByTarget[player.UserId]=nil
		return false,"คำขอหมดอายุ"
	end
	PendingByTarget[player.UserId]=nil
	local from = Players:GetPlayerByUserId(fromUserId)
	if not accept then
		if from and TradeEvent then TradeEvent:FireClient(from,{Type="Declined",ByName=player.DisplayName}) end
		return true,"ปฏิเสธแล้ว"
	end
	if not from or SessionByUser[fromUserId] or SessionByUser[player.UserId] then return false,"เริ่ม Trade ไม่ได้" end

	NextSessionId += 1
	local session = {
		Id=NextSessionId,
		State="ACTIVE",
		LockedAt=0,
		A={UserId=from.UserId,Name=from.DisplayName,Offer={},Ready=false,Confirmed=false},
		B={UserId=player.UserId,Name=player.DisplayName,Offer={},Ready=false,Confirmed=false},
	}
	SessionByUser[from.UserId]=session
	SessionByUser[player.UserId]=session
	fireSession(session)
	return true,sessionPublic(session,player.UserId)
end

function TradeService.SetOffer(player,guids)
	local session = SessionByUser[player.UserId]
	if not session then return false,"ยังไม่ได้ Trade" end
	if session.State ~= "ACTIVE" then return false,"Offer ถูกล็อกแล้ว" end
	local mine = sideFor(session,player.UserId)
	local profile = DataService.Get(player)
	local ok,offerOrError = normalizeOffer(profile,guids)
	if not ok then return false,offerOrError end
	mine.Offer=offerOrError
	session.A.Ready=false; session.B.Ready=false
	session.A.Confirmed=false; session.B.Confirmed=false
	session.LockedAt=0
	fireSession(session)
	return true,sessionPublic(session,player.UserId)
end

function TradeService.SetReady(player,ready)
	local session = SessionByUser[player.UserId]
	if not session then return false,"ยังไม่ได้ Trade" end
	if session.State ~= "ACTIVE" then return false,"Offer ถูกล็อกแล้ว" end
	local mine = sideFor(session,player.UserId)
	mine.Ready = ready == true
	mine.Confirmed=false
	if session.A.Ready and session.B.Ready then
		local ok,err = revalidate(session)
		if not ok then
			session.A.Ready=false;session.B.Ready=false
			fireSession(session)
			return false,err
		end
		session.State="LOCKED"
		session.LockedAt=os.time()
	end
	fireSession(session)
	return true,sessionPublic(session,player.UserId)
end

function TradeService.Confirm(player)
	local session = SessionByUser[player.UserId]
	if not session or session.State ~= "LOCKED" then return false,"Trade ยังไม่พร้อมยืนยัน" end
	if os.time()-session.LockedAt < 3 then return false,"รอ Safety Lock 3 วินาที" end
	local mine = sideFor(session,player.UserId)
	mine.Confirmed=true
	fireSession(session)
	if session.A.Confirmed and session.B.Confirmed then
		local ok,err = swapCards(session)
		if not ok then
			session.State="ACTIVE"
			session.A.Ready=false;session.B.Ready=false
			session.A.Confirmed=false;session.B.Confirmed=false
			session.LockedAt=0
			fireSession(session)
			return false,err
		end
		endSession(session,"Trade สำเร็จ ✦")
	end
	return true,"ยืนยันแล้ว"
end

function TradeService.Cancel(player)
	local session = SessionByUser[player.UserId]
	if session then
		endSession(session,player.DisplayName.." ยกเลิก Trade")
		return true
	end
	PendingByTarget[player.UserId]=nil
	return true
end

function TradeService.GetSession(player)
	local session = SessionByUser[player.UserId]
	return session and sessionPublic(session,player.UserId) or nil
end

function TradeService.Start(dataService,onChanged,tradeEvent)
	DataService=dataService
	OnChanged=onChanged
	TradeEvent=tradeEvent

	Players.PlayerRemoving:Connect(function(player)
		PendingByTarget[player.UserId]=nil
		local session=SessionByUser[player.UserId]
		if session then endSession(session,player.DisplayName.." ออกจากเซิร์ฟเวอร์") end
	end)
end

return TradeService
