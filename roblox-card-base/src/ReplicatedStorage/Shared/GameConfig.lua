local Config = {}

Config.Version = 1
Config.DataStoreName = "CardBase_Profile_v1"
Config.BaseLevelCap = 40
Config.BaseFloorSize = 10
Config.BaseFloorCount = 3
Config.MaxStandSlots = 30
Config.RollSeconds = 2.5
Config.DefaultOfflineCapSeconds = 2 * 60 * 60
Config.OfflineVaultCapSeconds = 8 * 60 * 60
Config.AutosaveSeconds = 60
Config.SessionLockSeconds = 180

Config.AscensionIncomePerCycle = 0.20
Config.AscensionLuckPerCycle = 0.02
Config.VipIncomeBonus = 0.15
Config.TurboRollMultiplier = 0.50
Config.AwakeningIncomePerStar = 0.35

Config.PassIds = {
	VIPCollector = 0,
	TurboCollector = 0,
	OfflineVault = 0,
	ShowcasePro = 0,
}

Config.ProductIds = {
	Cash15Minutes = 0,
	Cash1Hour = 0,
	Cash3Hours = 0,
	DoubleIncome30Minutes = 0,
	DoubleIncome2Hours = 0,
	Tip10 = 0,
	Tip50 = 0,
	Tip100 = 0,
}

Config.ProductCashSeconds = {
	Cash15Minutes = 15 * 60,
	Cash1Hour = 60 * 60,
	Cash3Hours = 3 * 60 * 60,
}

Config.ProductBoostSeconds = {
	DoubleIncome30Minutes = 30 * 60,
	DoubleIncome2Hours = 2 * 60 * 60,
}

Config.Tiers = {
	{name="Common", color=Color3.fromRGB(154,161,173), multi=1},
	{name="Uncommon", color=Color3.fromRGB(98,213,139), multi=1.8},
	{name="Rare", color=Color3.fromRGB(88,169,255), multi=3},
	{name="Epic", color=Color3.fromRGB(165,121,255), multi=5.5},
	{name="Legendary", color=Color3.fromRGB(255,189,74), multi=10},
	{name="Mythic", color=Color3.fromRGB(255,99,139), multi=18},
	{name="Divine", color=Color3.fromRGB(103,241,228), multi=32},
	{name="Celestial", color=Color3.fromRGB(127,140,255), multi=60},
	{name="Transcendent", color=Color3.fromRGB(255,121,238), multi=110},
	{name="Eternal", color=Color3.fromRGB(255,240,168), multi=200},
}

Config.Grades = {
	{name="C", color=Color3.fromRGB(160,166,177), multi=1},
	{name="B", color=Color3.fromRGB(126,203,148), multi=1.12},
	{name="A", color=Color3.fromRGB(99,183,255), multi=1.28},
	{name="A+", color=Color3.fromRGB(143,156,255), multi=1.48},
	{name="S", color=Color3.fromRGB(193,124,255), multi=1.75},
	{name="S+", color=Color3.fromRGB(255,127,206), multi=2.10},
	{name="SS", color=Color3.fromRGB(255,141,121), multi=2.55},
	{name="SS+", color=Color3.fromRGB(255,209,102), multi=3.10},
	{name="SSS", color=Color3.fromRGB(130,255,243), multi=3.80},
	{name="SSS★", color=Color3.fromRGB(255,242,169), multi=5.00},
	{name="EX", color=Color3.fromRGB(143,246,255), multi=6.50},
	{name="EX+", color=Color3.fromRGB(215,152,255), multi=8.50},
	{name="EX★", color=Color3.fromRGB(255,255,255), multi=12.00},
}

Config.GradeWeights = {44,25,14,7,4,2.5,1.5,0.8,0.18,0.02,0.01,0.0025,0.0005}
Config.GradeRerollCosts = {5000,10000,20000,40000,80000,160000,320000,640000,1280000,2560000}

Config.Mutations = {
	[0]={name="Normal", icon="·", color=Color3.fromRGB(141,148,163), income=1.00, luck=1.00, weight=95.85},
	[1]={name="Blaze", icon="🔥", color=Color3.fromRGB(255,112,67), income=2.00, luck=1.15, weight=0.65},
	[2]={name="Thunder", icon="⚡", color=Color3.fromRGB(105,231,255), income=2.20, luck=1.18, weight=0.55},
	[3]={name="Frost", icon="❄", color=Color3.fromRGB(157,234,255), income=2.40, luck=1.21, weight=0.50},
	[4]={name="Gale", icon="◌", color=Color3.fromRGB(114,255,213), income=2.60, luck=1.24, weight=0.45},
	[5]={name="Nature", icon="❧", color=Color3.fromRGB(126,228,126), income=2.80, luck=1.27, weight=0.45},
	[6]={name="Solar", icon="☀", color=Color3.fromRGB(255,215,97), income=3.00, luck=1.30, weight=0.40},
	[7]={name="Lunar", icon="☾", color=Color3.fromRGB(189,201,255), income=3.30, luck=1.34, weight=0.35},
	[8]={name="Void", icon="◆", color=Color3.fromRGB(170,105,255), income=3.60, luck=1.38, weight=0.30},
	[9]={name="Prismatic", icon="◇", color=Color3.fromRGB(255,131,232), income=4.20, luck=1.45, weight=0.20},
	[10]={name="Celestial Surge", icon="✦", color=Color3.fromRGB(255,240,165), income=5.00, luck=1.55, weight=0.15},
	[11]={name="Abyssal Bloom", icon="✺", color=Color3.fromRGB(255,95,183), income=5.80, luck=1.62, weight=0.10},
	[12]={name="Chrono Flux", icon="⧖", color=Color3.fromRGB(119,255,241), income=6.80, luck=1.72, weight=0.05},
}

Config.TierUnlockAt = {1,1,1,3,6,10,15,21,28,36}
Config.StandLimits = {
	10,11,12,13,14,15,16,17,18,19,
	20,21,22,23,24,25,26,27,28,30,
	30,30,30,30,30,30,30,30,30,30,
	30,30,30,30,30,30,30,30,30,30,
}

Config.Titles = {
	"Rookie Collector","Card Scout","Pack Seeker","Card Hunter","Vault Keeper",
	"Elite Collector","Card Warden","Treasure Keeper","Renowned Collector","Hall Master",
	"Card Baron","Vault Lord","Collection Master","Grand Collector","Card Duke",
	"Legend Keeper","Collector King","Card Emperor","Legend Sovereign","Grand Sovereign",
	"Astral Collector","Relic Monarch","Star Vault Lord","Celestial Warden","Mythic Overlord",
	"Divine Curator","Arcane Sovereign","Eternal Keeper","Cosmic Baron","Galaxy Emperor",
	"Nebula Sovereign","Infinite Collector","Fate Archivist","Void Monarch","Omni Warden",
	"Supreme Curator","Transcendent King","Eternal Emperor","Apex Sovereign","Absolute Collector",
}

Config.AscensionRewards = {
	"Ascension Aura",
	"Roman Radiance",
	"Ascended Tower",
	"Base Arrival FX",
	"Awaken Showcase",
	"Stellar Field",
	"Ascended Leader Frame",
	"Dual Mutation Prestige",
	"Sovereign Crown",
	"Cosmic Sovereign",
}

Config.IdPacks = {
	{name="WUWA pack v1", minId=1, maxId=10},
	{name="ARISA pack v1", minId=11, maxId=20},
	{name="NARUTO pack v1", minId=21, maxId=30},
	{name="FATE pack v1", minId=31, maxId=40},
	{name="VG pack v1", minId=41, maxId=50},
	{name="HxH pack v1", minId=51, maxId=60},
	{name="Slime pack v1", minId=61, maxId=70},
	{name="Mushoku pack v1", minId=71, maxId=80},
	{name="Frieren pack v1", minId=81, maxId=90},
	{name="AOT pack v1", minId=91, maxId=100},
}

return Config
