local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Root = ReplicatedStorage:WaitForChild("CardBase")
local Economy = require(Root.Shared.Economy)

local DailyService = {}

local function utcDay()
	local t=os.date("!*t")
	return string.format("%04d-%02d-%02d",t.year,t.month,t.day)
end

local function yesterday(day)
	local y,m,d=string.match(day,"^(%d+)%-(%d+)%-(%d+)$")
	if not y then return "" end
	local stamp=os.time({year=tonumber(y),month=tonumber(m),day=tonumber(d),hour=12})
	local t=os.date("!*t",stamp-86400)
	return string.format("%04d-%02d-%02d",t.year,t.month,t.day)
end

local function ensure(profile)
	if type(profile.Daily)~="table" then profile.Daily={} end
	local d=profile.Daily
	d.Day=tostring(d.Day or "")
	d.LastLoginDay=tostring(d.LastLoginDay or "")
	d.Streak=math.max(0,math.floor(tonumber(d.Streak) or 0))
	d.LoginClaimed=d.LoginClaimed==true
	if type(d.Progress)~="table" then d.Progress={} end
	if type(d.Claimed)~="table" then d.Claimed={} end
	for _,key in ipairs({"Rolls","Upgrades","Places"}) do
		d.Progress[key]=math.max(0,math.floor(tonumber(d.Progress[key]) or 0))
		d.Claimed[key]=d.Claimed[key]==true
	end
	d.BonusClaimed=d.BonusClaimed==true
	return d
end

function DailyService.TouchLogin(profile)
	local d=ensure(profile)
	local today=utcDay()
	if d.Day~=today then
		d.Day=today
		d.Progress={Rolls=0,Upgrades=0,Places=0}
		d.Claimed={Rolls=false,Upgrades=false,Places=false}
		d.BonusClaimed=false
	end
	if d.LastLoginDay~=today then
		if d.LastLoginDay==yesterday(today) then d.Streak+=1 else d.Streak=1 end
		d.LastLoginDay=today
		d.LoginClaimed=false
	end
	return d
end

function DailyService.Add(profile,key,amount)
	local d=DailyService.TouchLogin(profile)
	if d.Progress[key]~=nil then
		d.Progress[key]+=math.max(1,math.floor(tonumber(amount) or 1))
	end
end

local function targets()
	return {Rolls=8,Upgrades=3,Places=3}
end

local function rewardCash(profile,entitlements,seconds)
	local income=Economy.TotalIncome(profile,entitlements or {})
	local starter=1000*Economy.EconomyScale(profile.BaseLevel)
	return math.max(starter,math.floor(income*seconds))
end

function DailyService.ClaimLogin(profile,entitlements)
	local d=DailyService.TouchLogin(profile)
	if d.LoginClaimed then return false,"รับ Login Reward วันนี้แล้ว" end
	local seconds=300+math.min(900,d.Streak*60)
	local amount=rewardCash(profile,entitlements,seconds)
	profile.Money+=amount
	d.LoginClaimed=true
	return true,{Money=amount,Streak=d.Streak}
end

function DailyService.ClaimMission(profile,key,entitlements)
	local d=DailyService.TouchLogin(profile)
	local t=targets()
	if not t[key] then return false,"Mission ไม่ถูกต้อง" end
	if d.Claimed[key] then return false,"รับรางวัลแล้ว" end
	if (d.Progress[key] or 0)<t[key] then return false,"Mission ยังไม่ครบ" end
	local rewardSeconds={Rolls=360,Upgrades=480,Places=420}
	local amount=rewardCash(profile,entitlements,rewardSeconds[key] or 360)
	profile.Money+=amount
	d.Claimed[key]=true
	return true,{Money=amount,Key=key}
end

function DailyService.ClaimBonus(profile,entitlements)
	local d=DailyService.TouchLogin(profile)
	if d.BonusClaimed then return false,"รับ Daily Bonus แล้ว" end
	for _,key in ipairs({"Rolls","Upgrades","Places"}) do
		if not d.Claimed[key] then return false,"รับรางวัล Mission ให้ครบก่อน" end
	end
	local amount=rewardCash(profile,entitlements,900)
	profile.Money+=amount
	d.BonusClaimed=true
	return true,{Money=amount}
end

function DailyService.ClientState(profile,entitlements)
	local d=DailyService.TouchLogin(profile)
	local t=targets()
	local missions={}
	local labels={
		Rolls="เปิดการ์ด 8 ครั้ง",
		Upgrades="อัป Card Level 3 ครั้ง",
		Places="จัดการ์ดลงฐาน 3 ครั้ง",
	}
	local rewardSeconds={Rolls=360,Upgrades=480,Places=420}
	for _,key in ipairs({"Rolls","Upgrades","Places"}) do
		table.insert(missions,{
			Key=key,
			Label=labels[key],
			Progress=math.min(d.Progress[key] or 0,t[key]),
			Target=t[key],
			Claimed=d.Claimed[key]==true,
			Reward=rewardCash(profile,entitlements,rewardSeconds[key]),
		})
	end
	return {
		Day=d.Day,
		Streak=d.Streak,
		LoginClaimed=d.LoginClaimed,
		LoginReward=rewardCash(profile,entitlements,300+math.min(900,d.Streak*60)),
		Missions=missions,
		BonusClaimed=d.BonusClaimed,
		BonusReward=rewardCash(profile,entitlements,900),
	}
end

return DailyService
