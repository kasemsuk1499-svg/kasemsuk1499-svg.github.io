(() => {
  "use strict";

  // Clickjacking guard for static hosting: if another origin frames the game,
  // blank this document before it becomes interactive.
  if(window.top!==window.self){
    try{window.top.location=window.self.location.href}catch{}
    document.documentElement.innerHTML="";
    return;
  }

  const SAVE_KEY = "card-base-prototype-v01";
  const MONEY_CAP = 1e300;
  const PARTICLES_PREF_KEY = "card-base-particles-enabled-v1";
  const TRADE_NOTIFY_PREF_KEY = "card-base-trade-notify-enabled-v1";
  const TRADE_NOTIFIED_KEY_PREFIX = "card-base-trade-notified-v1:";
  const CARD_MIN_ID = 1;
  const CARD_MAX_ID = 120;
  const CARD_NAMES = Object.freeze({
    1:"Rover",
    2:"Cartethyia",
    3:"Shorekeeper",
    4:"Camellya",
    5:"Phrolova",
    6:"Hiyuki",
    7:"Phoebe",
    8:"Chisa",
    9:"Qingxiao",
    10:"Hsin",
    11:"Alya",
    12:"Masha",
    13:"Ayano",
    14:"Nonoa",
    15:"Suou Yuki",
    16:"Wedding Alya",
    17:"Santies Masha",
    18:"Nurse Ayano",
    19:"Luxury Nonoa",
    20:"Santies Yuki",
    21:"Konan",
    22:"Tsunade",
    23:"Hinata",
    24:"Kushina",
    25:"Minato",
    26:"Naruto",
    27:"Itachi",
    28:"Sazuke",
    29:"Kaguya",
    30:"Karin",
    31:"Lord Logres",
    32:"Ishtar",
    33:"Enkidu",
    34:"BB Dubai",
    35:"Sesshōin Kiara",
    36:"U-Olga Marie",
    37:"Semiramis",
    38:"Space Ishtar",
    39:"Meltryllis",
    40:"Demeter",
    41:"Blaster Blade",
    42:"Dragonic Overlord",
    43:"Majesty lord Blaster",
    44:"Blaster Dark",
    45:"Tsukuyomi",
    46:"Lucia",
    47:"Blue Storm",
    48:"Phantom Blaster Overlord",
    49:"The Omega lord",
    50:"Blaster Blade 'His Highness'",
    51:"Gon",
    52:"Killua",
    53:"Hisoka",
    54:"Kurapika",
    55:"Machi",
    56:"Klye",
    57:"Netero",
    58:"Neferpitou",
    59:"Alluka",
    60:"Shizuku",
    61:"Rimuru",
    62:"Luminous",
    63:"Milim",
    64:"Velgrynd",
    65:"Velzard",
    66:"Kuronoa",
    67:"Hinata",
    68:"Carrera",
    69:"Sizu",
    70:"Testarossa",
    71:"Rudeus",
    72:"Eris",
    73:"Roxy",
    74:"Sylphiette",
    75:"Elinalise",
    76:"Sara",
    77:"Aisha",
    78:"Nanahoshi",
    79:"Pursena",
    80:"Lara",
    81:"Luafen",
    82:"Lawine",
    83:"Linie",
    84:"Aura",
    85:"Sense",
    86:"Serie",
    87:"Methode",
    88:"Ubel",
    89:"Fren",
    90:"Frieren",
    91:"Petra",
    92:"Ymir",
    93:"Hange",
    94:"Sasha",
    95:"Annie",
    96:"Historia",
    97:"CaCarla",
    98:"Mikasa",
    99:"Levi",
    100:"Pieck",
    101:"Aqua",
    102:"Minami",
    103:"Abiko",
    104:"Akane",
    105:"Ai",
    106:"Frill",
    107:"Kana",
    108:"Ruby",
    109:"Mem-cho",
    110:"アド",
    111:"Mikey",
    112:"Ken Ryūgūji",
    113:"Tetta Kisaki",
    114:"Kazutora",
    115:"Takemichi",
    116:"Tachibana Hinata",
    117:"Hakkai Shiba",
    118:"Chifuyu",
    119:"Baji Keisuke",
    120:"Takashi Mitsuya"
  });
  const ROLL_MS = 2500;
  const SUPABASE_URL = "https://qlaykelpabbjojpqjfwi.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_KBWwFJ2v26lLH8UVoNIZ9Q_MtWguO29";
  const CLOUD_TABLE = "card_base_saves";
  const GAME_SESSION_KEY = "card-base-username-session-v1";
  const PACK_AUTO_SESSION_KEY = "card-base-pack-auto-session-v1";
  const MUTATION_EVENT_SESSION_KEY = "card-base-mutation-event-session-v1";
  const GRADE_ROLL_MS = 450;
  const ID_PACK_AUTO_MS = 1200;
  const ROTATING_SHOP_RESTOCK_MS = 5*60*1000;
  const CLOUD_IDLE_SAVE_MS = 20000;
  const ROTATING_SHOP_SLOTS = 4;
  const ASCENSION_LEVEL_CAP = 40;
  const ASCENSION_PERK_MAX = 10;

  const TIERS = [
    {name:"Common",color:"#9aa1ad",multi:1},
    {name:"Uncommon",color:"#62d58b",multi:1.8},
    {name:"Rare",color:"#58a9ff",multi:3},
    {name:"Epic",color:"#a579ff",multi:5.5},
    {name:"Legendary",color:"#ffbd4a",multi:10},
    {name:"Mythic",color:"#ff638b",multi:18},
    {name:"Divine",color:"#67f1e4",multi:32},
    {name:"Celestial",color:"#7f8cff",multi:60},
    {name:"Transcendent",color:"#ff79ee",multi:110},
    {name:"Eternal",color:"#fff0a8",multi:200},
    {name:"Singularity",color:"#e8fbff",multi:420}
  ];

  const GRADES = [
    {name:"C",color:"#a0a6b1",multi:1},
    {name:"B",color:"#7ecb94",multi:1.12},
    {name:"A",color:"#63b7ff",multi:1.28},
    {name:"A+",color:"#8f9cff",multi:1.48},
    {name:"S",color:"#c17cff",multi:1.75},
    {name:"S+",color:"#ff7fce",multi:2.10},
    {name:"SS",color:"#ff8d79",multi:2.55},
    {name:"SS+",color:"#ffd166",multi:3.10},
    {name:"SSS",color:"#82fff3",multi:3.80},
    {name:"SSS★",color:"#fff2a9",multi:5.00},
    {name:"EX",color:"#8ff6ff",multi:6.50},
    {name:"EX+",color:"#d798ff",multi:8.50},
    {name:"EX★",color:"#ffffff",multi:12.00},
    {name:"Ω",color:"#ffb7ff",multi:18.00}
  ];
  const AWAKEN_GRADE_INDEX = 12; // EX★ remains the Awaken requirement

  // Grade reroll is a major money sink. Base Level scaling is applied on top.
  const GRADE_REROLL_COSTS = [5000,10000,20000,40000,80000,160000,320000,640000,1280000,2560000];
  // Ultra-end grades are chase outcomes. Luck intentionally does not affect Grade.
  const GRADE_WEIGHTS = [44,25,14,7,4,2.5,1.5,.8,.18,.02,.01,.0025,.0005,.0001];

  const MUTATIONS = [
    {name:"Normal",icon:"·",color:"#8d94a3",income:1.00,luck:1.00,weight:95.396},
    {name:"Blaze",icon:"🔥",color:"#ff7043",income:2.00,luck:1.15,weight:.65},
    {name:"Thunder",icon:"⚡",color:"#69e7ff",income:2.20,luck:1.18,weight:.55},
    {name:"Frost",icon:"❄",color:"#9deaff",income:2.40,luck:1.21,weight:.50},
    {name:"Gale",icon:"◌",color:"#72ffd5",income:2.60,luck:1.24,weight:.45},
    {name:"Nature",icon:"❧",color:"#7ee47e",income:2.80,luck:1.27,weight:.45},
    {name:"Solar",icon:"☀",color:"#ffd761",income:3.00,luck:1.30,weight:.40},
    {name:"Lunar",icon:"☾",color:"#bdc9ff",income:3.30,luck:1.34,weight:.35},
    {name:"Void",icon:"◆",color:"#aa69ff",income:3.60,luck:1.38,weight:.30},
    {name:"Prismatic",icon:"◇",color:"#ff83e8",income:4.20,luck:1.45,weight:.20},
    {name:"Celestial Surge",icon:"✦",color:"#fff0a5",income:5.00,luck:1.55,weight:.15},
    {name:"Abyssal Bloom",icon:"✺",color:"#ff5fb7",income:5.80,luck:1.62,weight:.10},
    {name:"Chrono Flux",icon:"⧖",color:"#77fff1",income:6.80,luck:1.72,weight:.05},
    {name:"Glitch Core",icon:"▧",color:"#5fffea",income:7.50,luck:1.80,weight:.06},
    {name:"Helix Drive",icon:"🧬",color:"#b9ff6a",income:8.00,luck:1.84,weight:.04},
    {name:"Riftglass",icon:"◈",color:"#ff7cf5",income:8.60,luck:1.90,weight:.03},
    {name:"Inverse Rain",icon:"⇡",color:"#6fe7ff",income:9.20,luck:1.96,weight:.025},
    {name:"Quantum Scan",icon:"⌁",color:"#7aa2ff",income:10.00,luck:2.02,weight:.018},
    {name:"Echo Frame",icon:"◫",color:"#ff9ad5",income:10.80,luck:2.08,weight:.012},
    {name:"Event Horizon",icon:"◉",color:"#8a64ff",income:12.00,luck:2.16,weight:.009},
    {name:"Rune Circuit",icon:"⌬",color:"#ffe47a",income:13.50,luck:2.25,weight:.006},
    {name:"Amaterasu",icon:"⦿",color:"#ff2b35",income:15.00,luck:2.35,weight:.004},
    {name:"Chokun",icon:"刀",color:"#c548ff",income:3.90,luck:1.415,weight:.25}
  ];
  // Display order only. Keep mutation IDs stable for saves, trades and FX.
  // Chokun is mutation #22 but visually belongs between Void (#8) and Prismatic (#9).
  const MUTATION_DISPLAY_ORDER = [
    0,1,2,3,4,5,6,7,8,22,9,10,11,12,13,14,15,16,17,18,19,20,21
  ];
  // Mutation Storm pool totals 100%. New ultra mutations are rarer, but obtainable.
  const MUTATION_EVENT_WEIGHTS = [0,11.058878,10.598092,10.137305,9.676519,9.215732,8.754945,8.294159,7.372586,6.451012,5.068653,3.225506,2.303933,.232721,.186176,.139632,.111706,.093088,.074471,.055853,.027926,.009309,6.911799];
  const MUTATION_EVENT_PULSE_CHANCE = 0.005; // 0.5% per Normal displayed card every 30 sec
  const TOWER_LV100_TICKET_DROP_CHANCE = 0.03; // rolled once per cleared Endless Tower floor
  // Grade does not increase Event hit frequency. It improves mutation quality after a hit.
  const MUTATION_GRADE_EVENT_BONUS = [0,.03,.06,.10,.15,.22,.30,.39,.49,.60,.70,.80,.90,1.00];
  // Flat bonus applied once to the final Mutation Inheritance success chance.
  const MUTATION_GRADE_INHERIT_BONUS = [0,.01,.02,.03,.05,.07,.09,.11,.13,.15,.17,.19,.21,.23];

  // =========================================================
  // ID PACK CUSTOMIZATION
  // แก้ชื่อ/รูปแพ็กตรงนี้ได้เลย
  // image: ใช้ path เช่น "./assets/packs/my-pack.png" หรือ URL รูปก็ได้
  // เว้น image:"" = ใช้หน้าปกสำรองของเกม
  // priceSeconds: ไม่ใส่ = ใช้ราคามาตรฐานตามลำดับแพ็ก
  // =========================================================
  const ID_PACK_CUSTOM = {
    1:  {name:"WUWA pack v1", image:"./assets/packs/8.png", priceSeconds:null},
    11: {name:"ARISA pack v1", image:"./assets/packs/16.png", priceSeconds:null},
    21: {name:"NARUTO pack v1", image:"./assets/packs/27.png", priceSeconds:null},
    31: {name:"FATE pack v1", image:"./assets/packs/31.png", priceSeconds:null},
    41: {name:"VG pack v1", image:"./assets/packs/41.png", priceSeconds:null},
    51:  {name:"HxH pack v1", image:"./assets/packs/60.png", priceSeconds:null},
    61: {name:"Slime pack v1", image:"./assets/packs/62.png", priceSeconds:null},
    71: {name:"Mushoku pack v1", image:"./assets/packs/77.png", priceSeconds:null},
    81: {name:"Frieren pack v1", image:"./assets/packs/90.png", priceSeconds:null},
    91: {name:"AOT pack v1", image:"./assets/packs/98.png", priceSeconds:null},
    101: {name:"Oshi pack v1", image:"./assets/packs/105.png", priceSeconds:null},
    111: {name:"TokyoReven pack v1", image:"./assets/packs/111.png", priceSeconds:null}
  };

  const ROTATING_PACK_ARCHETYPES = [
    {
      key:"rare-bloom",name:"Rare Bloom",label:"RATE UP",minLevel:1,weight:30,featuredTier:2,
      stockMin:4,stockMax:7,priceSeconds:18,outRate:.020,
      rates:{1:15,2:55,3:24,4:6},
      outPool:{5:74.5,6:20,7:5,10:.5}
    },
    {
      key:"epic-mirage",name:"Epic Mirage",label:"RATE UP",minLevel:3,weight:26,featuredTier:3,
      stockMin:3,stockMax:5,priceSeconds:30,outRate:.025,
      rates:{2:18,3:56,4:20,5:6},
      outPool:{6:71.5,7:23,8:5,10:.5}
    },
    {
      key:"legendary-crown",name:"Legendary Crown",label:"LIMITED",minLevel:6,weight:20,featuredTier:4,
      stockMin:2,stockMax:4,priceSeconds:55,outRate:.020,
      rates:{3:22,4:58,5:15,6:5},
      outPool:{7:69,8:25,9:5.5,10:.5}
    },
    {
      key:"mythic-rift",name:"Mythic Rift",label:"LIMITED",minLevel:10,weight:13,featuredTier:5,
      stockMin:2,stockMax:3,priceSeconds:90,outRate:.018,
      rates:{4:24,5:56,6:16,7:4},
      outPool:{8:81,9:18,10:1}
    },
    {
      key:"divine-vault",name:"Divine Vault",label:"PREMIUM",minLevel:15,weight:7,featuredTier:6,
      stockMin:1,stockMax:2,priceSeconds:150,outRate:.015,
      rates:{5:28,6:55,7:14,8:3},
      outPool:{9:98.5,10:1.5}
    },
    {
      key:"celestial-gate",name:"Celestial Gate",label:"PREMIUM",minLevel:21,weight:3,featuredTier:7,
      stockMin:1,stockMax:1,priceSeconds:230,outRate:.012,
      rates:{6:32,7:56,8:12},
      outPool:{9:97.5,10:2.5}
    },
    {
      key:"jackpot-echo",name:"Jackpot Echo",label:"JACKPOT",minLevel:10,weight:1,featuredTier:5,
      stockMin:1,stockMax:1,priceSeconds:320,outRate:.050,
      rates:{4:35,5:35,6:20,7:10},
      outPool:{8:68,9:31,10:1}
    }
  ];

  const TITLES = [
    "Rookie Collector","Card Scout","Pack Seeker","Card Hunter","Vault Keeper",
    "Elite Collector","Card Warden","Treasure Keeper","Renowned Collector","Hall Master",
    "Card Baron","Vault Lord","Collection Master","Grand Collector","Card Duke",
    "Legend Keeper","Collector King","Card Emperor","Legend Sovereign","Grand Sovereign",
    "Astral Collector","Relic Monarch","Star Vault Lord","Celestial Warden","Mythic Overlord",
    "Divine Curator","Arcane Sovereign","Eternal Keeper","Cosmic Baron","Galaxy Emperor",
    "Nebula Sovereign","Infinite Collector","Fate Archivist","Void Monarch","Omni Warden",
    "Supreme Curator","Transcendent King","Eternal Emperor","Apex Sovereign","Absolute Collector"
  ];
  const ASCENSION_REWARDS = [
    {name:"Ascension Aura",desc:"ออร่าพิเศษรอบยศและโปรไฟล์"},
    {name:"Roman Radiance",desc:"เลขโรมันและยศเรืองแสงเด่นขึ้น"},
    {name:"Ascended Tower",desc:"กรอบ Card Tower แบบ Ascended"},
    {name:"Base Arrival FX",desc:"เอฟเฟกต์พิเศษเวลาคนอื่นเปิดดูฐาน"},
    {name:"Awaken Showcase",desc:"การ์ด Awaken ได้กรอบ Showcase เพิ่ม"},
    {name:"Stellar Field",desc:"พื้นฐานมีสนามดาว Ascension"},
    {name:"Ascended Leader Frame",desc:"กรอบพิเศษบน Leaderboard"},
    {name:"Dual Mutation Prestige",desc:"Dual Mutation ได้ Prestige Border"},
    {name:"Sovereign Crown",desc:"มงกุฎบนยศและโปรไฟล์"},
    {name:"Cosmic Sovereign",desc:"Cosmic Base Theme ขั้นสูงสุด"}
  ];

  const TITLE_FX = [
    ["#aab2c0","#e8edf5"],["#6ee7a8","#c7ffe1"],["#58c7ff","#c9f2ff"],["#6688ff","#d2dbff"],
    ["#a979ff","#eadcff"],["#d66cff","#f5d7ff"],["#ff72bd","#ffd7ee"],["#ff8e68","#ffe0d5"],
    ["#ffc857","#fff1bd"],["#ff675f","#ffd29e"],["#54e0c1","#ffe287"],["#8b78ff","#ff9ee9"],
    ["#67d8ff","#ffe99b"],["#ff5578","#ffd7e0"],["#d26cff","#70efff"],["#83a8ff","#ffffff"],
    ["#48f2ff","#a478ff"],["#ffd45a","#ff665f"],["#ff63e6","#55f5ff"],["#fff3a8","#ffffff"],
    ["#70f6ff","#9f7bff"],["#ff8cd9","#ffd56a"],["#75a7ff","#ecfbff"],["#73fff2","#fff0a5"],
    ["#ff6dba","#a778ff"],["#fff17e","#70ecff"],["#bb7cff","#ff77cf"],["#ffffff","#69f7e6"],
    ["#ffae66","#ff6fcb"],["#75d7ff","#ffe278"],["#9a86ff","#65f5ff"],["#e7fbff","#ff83ea"],
    ["#ffd56f","#89f4ff"],["#8c79ff","#ff597c"],["#65fff0","#d18cff"],["#fff4a5","#ff8dd8"],
    ["#81f5ff","#ffffff"],["#ffe06b","#ff6d6d"],["#ff6ff0","#6ffaff"],["#ffffff","#ffe47a"]
  ];
  const STANDS = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30];

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  function clampMoney(value){
    const n=Number(value);
    if(n===Infinity)return MONEY_CAP;
    if(!Number.isFinite(n)||n<=0)return 0;
    return Math.min(MONEY_CAP,n);
  }

  const newState = () => ({
    money:0, baseLevel:1, cards:[], placed:[],
    currentPack:null, rollingUntil:0, lastTick:Date.now(), uidCounter:1,
    autoTargets:[], autoRolling:false, fullAuto:false, targetFound:false,
    storedPacks:[], packUidCounter:1, gradeAuto:null, cardIndex:{},
    items:{level100Ticket:0},
    serverGiftClaims:{},
    rotatingShop:{rotationId:null,bought:{}},
    ascension:{stars:0,cores:0,perks:{income:0,luck:0,forge:0}},
    tower:{floor:1,best:0,shards:0},
    lounge:{initialized:false,selected:[],sound:true,theme:"night",music:{current:"",history:[]}}
  });

  let state = load();
  let activeStand = null;
  let activeBaseFloor = 0;
  let activeVisitorFloor = 0;
  let visitorBaseView = null;
  const BASE_FLOOR_SIZE = 10;
  const BASE_FLOOR_COUNT = 3;
  let rollFrame = 0;
  let autoTimer = 0;
  let gradeTimer = 0;
  let gradeAutoSetupUid = null;
  let mutationLabTargetUid = null;
  let mutationCleanseTargetUid = null;
  let idPackAutoTimer = 0;
  let idPackAutoIndex = null;
  let idPackAutoCount = 0;
  const ID_PACK_PAGE_SIZE = 10;
  let idPackPage = 0;
  let supabaseClient = null;
  function loadGameSessionToken(){
    try{
      const current=sessionStorage.getItem(GAME_SESSION_KEY);
      if(current)return current;
      const legacy=localStorage.getItem(GAME_SESSION_KEY);
      if(legacy){
        sessionStorage.setItem(GAME_SESSION_KEY,legacy);
        try{sessionStorage.removeItem(GAME_SESSION_KEY)}catch{}
    try{localStorage.removeItem(GAME_SESSION_KEY)}catch{}
        return legacy;
      }
    }catch{}
    return null;
  }
  let gameToken = loadGameSessionToken();
  let gameAccount = null;
  let cloudReady = false;
  let cloudLoading = false;
  let cloudTimer = 0;
  let cloudDirty = false;
  let cloudRevision = 0;
  let lastExitCloudFlushAt = 0;
  let onlineProfile = null;
  let onlineHeartbeatTimer = 0;
  let mutationEventTimer = 0;
  let rotatingShopTimer = 0;
  let mutationEventBusy = false;
  let towerChallengeBusy = false;
  let mutationEventClockOffset = 0;
  let mutationEventStatus = null;
  let mutationEventClientSession = getMutationEventSession();
  let onlineCache = {online:[],requests:[],friends:[],leaders:[],myRank:null,totalPlayers:0};
  let socialProfiles = new Map();
  let tradeCache = {incoming:[],outgoing:[],recent:[]};
  let tradeLockedGids = new Set();
  let tradeNotificationRegistration = null;
  const baseDocumentTitle = document.title;
  let tradeModalState = {mode:null,targetId:null,tradeId:null,selectedGid:null};
  let tradeBusy = false;
  let authRequestBusy = false;
  let loungeAudioContext = null;
  let loungeAmbientTimer = 0;
  let loungeTalkTimers = new Map();
  let loungeMood = new Map();
  let loungeWalkTimers = new Map();
  let loungeWalkState = new Map();

  function newMutationEventSession(){
    const raw=globalThis.crypto&&typeof crypto.randomUUID==="function"
      ? crypto.randomUUID()
      : "evt-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
    return raw.replace(/[^A-Za-z0-9_-]/g,"").slice(0,80);
  }

  function getMutationEventSession(){
    try{
      let id=sessionStorage.getItem(MUTATION_EVENT_SESSION_KEY);
      if(!id||id.length<12){
        id=newMutationEventSession();
        sessionStorage.setItem(MUTATION_EVENT_SESSION_KEY,id);
      }
      return id;
    }catch{
      return newMutationEventSession();
    }
  }

  function rotateMutationEventSession(){
    mutationEventClientSession=newMutationEventSession();
    try{sessionStorage.setItem(MUTATION_EVENT_SESSION_KEY,mutationEventClientSession)}catch{}
    mutationEventStatus=null;
    renderMutationEvent();
  }

  function packAutoSessionActive(){
    try{return sessionStorage.getItem(PACK_AUTO_SESSION_KEY)==="1"}catch{return false}
  }

  function setPackAutoSession(active){
    try{
      if(active)sessionStorage.setItem(PACK_AUTO_SESSION_KEY,"1");
      else sessionStorage.removeItem(PACK_AUTO_SESSION_KEY);
    }catch{}
  }

  function makeCardGid(){
    if(globalThis.crypto&&typeof crypto.randomUUID==="function")return crypto.randomUUID();
    const rnd=Math.random().toString(36).slice(2);
    return "card-"+Date.now().toString(36)+"-"+rnd+"-"+Math.random().toString(36).slice(2);
  }

  function validCardGid(value){
    return typeof value==="string"&&value.length>=8&&value.length<=80;
  }

  function normalizeCardIndex(raw){
    const out={};
    if(!raw||typeof raw!=="object"||Array.isArray(raw))return out;
    for(const [key,value] of Object.entries(raw)){
      const charId=Number(key);
      if(!Number.isInteger(charId)||charId<CARD_MIN_ID||charId>CARD_MAX_ID||!value||typeof value!=="object")continue;
      const tiers=[...new Set((Array.isArray(value.tiers)?value.tiers:[]).map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<TIERS.length))].sort((a,b)=>a-b);
      const bestGrade=Math.max(0,Math.min(GRADES.length-1,Number(value.bestGrade)||0));
      const mutations=[...new Set((Array.isArray(value.mutations)?value.mutations:[]).map(Number).filter(i=>Number.isInteger(i)&&i>0&&i<MUTATIONS.length))].sort((a,b)=>a-b);
      out[charId]={
        tiers,
        mutations,
        bestGrade,
        firstSeen:Number(value.firstSeen)||Date.now(),
        lastSeen:Number(value.lastSeen)||Number(value.firstSeen)||Date.now()
      };
    }
    return out;
  }

  function recordCardInIndex(card,seenAt=Date.now(),targetState=state){
    if(!card||!Number.isInteger(Number(card.charId)))return;
    const charId=Number(card.charId),tier=Math.max(0,Math.min(TIERS.length-1,Number(card.tier)||0));
    const grade=Math.max(0,Math.min(GRADES.length-1,Number(card.grade)||0));
    if(charId<CARD_MIN_ID||charId>CARD_MAX_ID)return;
    if(!targetState.cardIndex||typeof targetState.cardIndex!=="object")targetState.cardIndex={};
    const cardMutationList=[Number(card.mutation)||0,Number(card.mutation2)||0]
      .filter(i=>Number.isInteger(i)&&i>0&&i<MUTATIONS.length);
    const old=targetState.cardIndex[charId]||{tiers:[],mutations:[],bestGrade:0,firstSeen:seenAt,lastSeen:seenAt};
    const tiers=[...new Set([...(Array.isArray(old.tiers)?old.tiers:[]),tier])].sort((a,b)=>a-b);
    const mutations=[...new Set([...(Array.isArray(old.mutations)?old.mutations:[]),...cardMutationList])].sort((a,b)=>a-b);
    targetState.cardIndex[charId]={
      tiers,
      mutations,
      bestGrade:Math.max(Number(old.bestGrade)||0,grade),
      firstSeen:Number(old.firstSeen)||seenAt,
      lastSeen:Math.max(Number(old.lastSeen)||0,seenAt)
    };
  }

  function syncCardIndex(targetState=state){
    if(!targetState.cardIndex||typeof targetState.cardIndex!=="object")targetState.cardIndex={};
    (Array.isArray(targetState.cards)?targetState.cards:[]).forEach(c=>recordCardInIndex(c,Number(c.obtainedAt)||Date.now(),targetState));
  }

  function hydrateState(parsed){
    const s={...newState(),...(parsed||{})};
    s.money=clampMoney(s.money);
    s.cards=(Array.isArray(s.cards)?s.cards:[])
      .filter(c=>Number.isInteger(c.charId)&&c.charId>=CARD_MIN_ID&&c.charId<=CARD_MAX_ID)
      .map(c=>({
        ...c,
        gid:validCardGid(c.gid)?c.gid:makeCardGid(),
        mutation:Number.isInteger(Number(c.mutation))&&Number(c.mutation)>=0&&Number(c.mutation)<MUTATIONS.length?Number(c.mutation):0,
        mutation2:Number.isInteger(Number(c.mutation2))&&Number(c.mutation2)>0&&Number(c.mutation2)<MUTATIONS.length&&Number(c.mutation2)!==Number(c.mutation)?Number(c.mutation2):0,
        awakening:Math.max(0,Math.floor(Number(c.awakening)||0))
      }));
    s.cardIndex=normalizeCardIndex(s.cardIndex);
    const rawItems=s.items&&typeof s.items==="object"&&!Array.isArray(s.items)?s.items:{};
    s.items={
      level100Ticket:Math.max(0,Math.min(1000000,Math.floor(Number(rawItems.level100Ticket??rawItems.level40Ticket)||0)))
    };
    s.serverGiftClaims=s.serverGiftClaims&&typeof s.serverGiftClaims==="object"&&!Array.isArray(s.serverGiftClaims)
      ? s.serverGiftClaims
      : {};
    const rawRotating=s.rotatingShop&&typeof s.rotatingShop==="object"?s.rotatingShop:{};
    s.rotatingShop={
      rotationId:Number.isFinite(Number(rawRotating.rotationId))?Number(rawRotating.rotationId):null,
      bought:rawRotating.bought&&typeof rawRotating.bought==="object"&&!Array.isArray(rawRotating.bought)
        ? Object.fromEntries(Object.entries(rawRotating.bought).map(([k,v])=>[String(k),Math.max(0,Math.floor(Number(v)||0))]))
        : {}
    };
    const rawAsc=s.ascension&&typeof s.ascension==="object"?s.ascension:{};
    const rawPerks=rawAsc.perks&&typeof rawAsc.perks==="object"?rawAsc.perks:{};
    s.ascension={
      stars:Math.max(0,Math.floor(Number(rawAsc.stars)||0)),
      cores:Math.max(0,Math.floor(Number(rawAsc.cores)||0)),
      perks:{
        income:Math.max(0,Math.min(ASCENSION_PERK_MAX,Math.floor(Number(rawPerks.income)||0))),
        luck:Math.max(0,Math.min(ASCENSION_PERK_MAX,Math.floor(Number(rawPerks.luck)||0))),
        forge:Math.max(0,Math.min(ASCENSION_PERK_MAX,Math.floor(Number(rawPerks.forge)||0)))
      }
    };
    const rawTower=s.tower&&typeof s.tower==="object"?s.tower:{};
    s.tower={
      floor:Math.max(1,Math.floor(Number(rawTower.floor)||1)),
      best:Math.max(0,Math.floor(Number(rawTower.best)||0)),
      shards:Math.max(0,Math.floor(Number(rawTower.shards)||0))
    };
    const rawLounge=s.lounge&&typeof s.lounge==="object"?s.lounge:{};
    const rawMusic=rawLounge.music&&typeof rawLounge.music==="object"?rawLounge.music:{};
    s.lounge={
      initialized:!!rawLounge.initialized,
      selected:[...new Set((Array.isArray(rawLounge.selected)?rawLounge.selected:[]).map(Number).filter(Number.isFinite))].slice(0,5),
      sound:rawLounge.sound!==false,
      theme:rawLounge.theme==="day"?"day":"night",
      music:{
        current:typeof rawMusic.current==="string"?rawMusic.current.slice(0,600):"",
        history:[...new Set((Array.isArray(rawMusic.history)?rawMusic.history:[]).filter(x=>typeof x==="string"&&x).map(x=>x.slice(0,600)))].slice(0,8)
      }
    };
    s.baseLevel=Math.max(1,Math.min(ASCENSION_LEVEL_CAP,Math.floor(Number(s.baseLevel)||1)));
    syncCardIndex(s);
    s.autoTargets=(Array.isArray(s.autoTargets)?s.autoTargets:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<TIERS.length);
    s.storedPacks=(Array.isArray(s.storedPacks)?s.storedPacks:[]).filter(p=>p&&Number.isInteger(p.tier)&&p.tier>=0&&p.tier<TIERS.length);
    const keepPackAuto=packAutoSessionActive();
    s.autoRolling=keepPackAuto&&!!s.autoRolling;
    s.fullAuto=keepPackAuto&&!!s.fullAuto;
    if(s.autoRolling&&s.fullAuto)s.autoRolling=false;
    if(!s.autoRolling&&!s.fullAuto){
      s.targetFound=false;
      s.rollingUntil=0;
      if(keepPackAuto)setPackAutoSession(false);
    }else if(!Number.isFinite(Number(s.rollingUntil))||Number(s.rollingUntil)<=0){
      s.rollingUntil=Date.now()+ROLL_MS;
    }
    s.gradeAuto=null;
    const valid=new Set(s.cards.map(c=>c.uid));
    const old=Array.isArray(s.placed)?s.placed:[];
    s.placed=old.map(uid=>valid.has(uid)?uid:null);
    s.uidCounter=Math.max(Number(s.uidCounter)||1,...s.cards.map(c=>(Number(c.uid)||0)+1));
    s.packUidCounter=Math.max(Number(s.packUidCounter)||1,...s.storedPacks.map(p=>(Number(p.uid)||0)+1));
    return s;
  }

  function load(){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw) return newState();
      return hydrateState(JSON.parse(raw));
    }catch{
      return newState();
    }
  }

  function cloudPayload(){
    return {...state,autoRolling:false,fullAuto:false,targetFound:false,gradeAuto:null,rollingUntil:0};
  }

  function cloudAutoBusy(){
    return !!(state.autoRolling||state.fullAuto||state.gradeAuto||idPackAutoIndex!==null);
  }

  function armCloudSave(){
    clearTimeout(cloudTimer);
    if(!cloudDirty||!cloudReady||cloudLoading||!gameToken||!supabaseClient||cloudAutoBusy())return;
    cloudTimer=setTimeout(()=>flushCloudSave(),CLOUD_IDLE_SAVE_MS);
  }

  function scheduleCloudSave(){
    if(!gameToken)return;
    cloudDirty=true;
    cloudRevision++;
    armCloudSave();
    updateSyncUi("syncing");
  }

  function makeRestRpcClient(){
    return {
      async rpc(name,args={}){
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),12000);
        try{
          const response=await fetch(SUPABASE_URL+"/functions/v1/card-base-api",{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              "apikey":SUPABASE_PUBLISHABLE_KEY
            },
            body:JSON.stringify({p_action:name,p_args:args||{}}),
            signal:controller.signal,
            cache:"no-store",
            credentials:"omit",
            referrerPolicy:"no-referrer"
          });
          let data=null;
          try{data=await response.json()}catch{}
          if(!response.ok){
            return {data:null,error:{message:(data&&data.message)||("HTTP "+response.status)}};
          }
          return {data,error:null};
        }catch(err){
          return {data:null,error:{message:err&&err.name==="AbortError"?"Cloud timeout":String(err&&err.message||err)}};
        }finally{
          clearTimeout(timeout);
        }
      }
    };
  }

  async function rpc(name,args={}){
    if(!supabaseClient)return {ok:false,error:"cloud_unavailable",message:"Cloud ยังไม่พร้อม"};
    let lastError=null;
    for(let attempt=0;attempt<2;attempt++){
      const {data,error}=await supabaseClient.rpc(name,args);
      if(!error)return data&&typeof data==="object"?data:{ok:false,error:"invalid_response"};
      lastError=error;
      if(attempt===0)await new Promise(r=>setTimeout(r,350));
    }
    console.error("RPC "+name+" failed",lastError);
    return {ok:false,error:"rpc_error",message:lastError?.message||"Cloud error"};
  }

  function clearGameSession(reason=""){
    gameToken=null;gameAccount=null;onlineProfile=null;cloudReady=false;cloudLoading=false;cloudDirty=false;clearTimeout(cloudTimer);
    tradeCache={incoming:[],outgoing:[],recent:[]};tradeLockedGids=new Set();updateTradeAttention();
    mutationEventStatus=null;
    localStorage.removeItem(GAME_SESSION_KEY);
    renderAuth();renderOnlineShell();renderMutationEvent();updateSyncUi("local");
    if(reason){
      setAuthMessage(reason,"error");
      toast(reason);
    }
  }

  function invalidateGameSession(){
    clearGameSession("Session หมดอายุหรือบัญชีนี้ถูกเปิดจากอุปกรณ์อื่น · กรุณาเข้าสู่ระบบใหม่");
  }

  async function keepaliveCloudSave(snapshot){
    const args={p_token:gameToken,p_state:snapshot};
    const body=JSON.stringify(args);
    const byteSize=typeof TextEncoder==="function"?new TextEncoder().encode(body).length:body.length*2;
    if(byteSize>60000)return rpc("cb_save_state",args);
    try{
      const response=await fetch(SUPABASE_URL+"/functions/v1/card-base-api",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "apikey":SUPABASE_PUBLISHABLE_KEY
        },
        body:JSON.stringify({p_action:"cb_save_state",p_args:args}),
        cache:"no-store",
        credentials:"omit",
        referrerPolicy:"no-referrer",
        keepalive:true
      });
      let data=null;
      try{data=await response.json()}catch{}
      if(!response.ok)return {ok:false,error:"rpc_error",message:(data&&data.message)||("HTTP "+response.status)};
      return data&&typeof data==="object"?data:{ok:false,error:"invalid_response"};
    }catch(err){
      return {ok:false,error:"rpc_error",message:String(err&&err.message||err)};
    }
  }

  async function flushCloudSave(options={}){
    const force=!!options.force;
    const keepalive=!!options.keepalive;
    if(!cloudReady||cloudLoading||!gameToken||!supabaseClient)return {ok:false,error:"cloud_not_ready"};
    if(!force&&!cloudDirty)return {ok:true,skipped:true};
    clearTimeout(cloudTimer);
    const revision=cloudRevision;
    const snapshot=JSON.parse(JSON.stringify(cloudPayload()));
    const result=keepalive
      ? await keepaliveCloudSave(snapshot)
      : await rpc("cb_save_state",{p_token:gameToken,p_state:snapshot});
    if(!result.ok){
      if(result.error==="invalid_session")invalidateGameSession();
      else if(result.error==="trade_card_locked"){
        toast("การ์ดที่อยู่ใน Trade ถูกล็อก · ยกเลิก Trade ก่อนแก้ไข");
        await loadCloudState();
      }else updateSyncUi("error");
      return result;
    }
    if(cloudRevision===revision)cloudDirty=false;
    else armCloudSave();
    const tradeReceipts=Number(result.trade_receipts)||0;
    const serverGrants=Number(result.server_grants)||0;
    const serverGiftSync=Number(result.server_gift_sync)||0;
    const towerRolls=Number(result.tower_rolls)||0;
    const towerTicketDrops=Number(result.tower_tickets_dropped)||0;
    if((tradeReceipts>0||serverGrants>0||serverGiftSync>0||towerTicketDrops>0)&&result.state){
      state=hydrateState(result.state);
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      renderHeader();renderBase();renderPack();renderOdds();renderFilters();renderStoredPacks();renderIdPackShop();renderRotatingPackShop();renderCollection();renderCardIndex();renderRebirth();renderRankCatalog();renderOnlineShell();
      if(serverGrants>0||serverGiftSync>0)toast("🎁 ของขวัญเซิร์ฟเวอร์พร้อมแล้ว · Singularity Pack ×1 + ⚡ Lv.100 Ticket ×1",true);
      if(towerTicketDrops>0){
        toast("⚡ JACKPOT! Endless Tower ดรอป Lv.100 Ticket ×"+towerTicketDrops+" 💯",true);
      }
      if(tradeReceipts>0){
        toast("Trade สำเร็จ · คลังการ์ดอัปเดตแล้ว ✨",true);
        setTimeout(()=>refreshTrades(true),0);
      }
    }
    result.tower_rolls=towerRolls;
    result.tower_tickets_dropped=towerTicketDrops;
    updateSyncUi(cloudDirty?"syncing":"online");
    publishPublicBase();
    return result;
  }

  function saveLocalOnly(){
    localStorage.setItem(SAVE_KEY,JSON.stringify(state));
  }

  function save(){
    saveLocalOnly();
    scheduleCloudSave();
  }

  function flushCloudOnExit(){
    saveLocalOnly();
    if(!gameToken||!cloudReady||cloudLoading)return;
    const now=Date.now();
    if(now-lastExitCloudFlushAt<1500)return;
    lastExitCloudFlushAt=now;
    void flushCloudSave({force:true,keepalive:true});
  }

  function fmt(n){
    if(!Number.isFinite(n)) return "∞";
    const sign=n<0?"-":"",a=Math.abs(n);
    if(a<1000) return sign+Math.floor(a).toLocaleString("th-TH");
    const units=["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","Ud","Dd","Td","Qad","Qid","Sxd","Spd","Ocd","Nod","Vg","Uvg","Dvg","Tvg","Qavg","Qivg"];
    const group=Math.floor(Math.log10(a)/3);
    if(group<=units.length){
      const v=a/Math.pow(1000,group);
      return sign+v.toFixed(v>=100?0:v>=10?1:2)+units[group-1];
    }
    return sign+a.toExponential(2).replace("+","");
  }

  function padId(id){return "#"+String(id).padStart(4,"0")}
  function cardName(id){
    const name=String(CARD_NAMES[Number(id)]||"").trim();
    return name||("CARD "+padId(id));
  }
  function formatDuration(sec){const m=Math.floor(sec/60),s=Math.round(sec%60);return m?m+" นาที "+(s?s+" วิ":""):s+" วิ"}
  function imageFor(id){return "../assets/cards/"+id+".png"}
  function romanNumeral(value){
    let n=Math.max(0,Math.floor(Number(value)||0));
    if(!n)return "";
    const map=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
    let out="";
    for(const [v,s] of map){while(n>=v){out+=s;n-=v}}
    return out;
  }
  function ascensionFromTitle(title){
    const m=String(title||"").match(/\s([IVXLCDM]+)$/);
    if(!m)return 0;
    const values={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    let total=0,prev=0;
    for(let i=m[1].length-1;i>=0;i--){
      const v=values[m[1][i]]||0;
      if(v<prev)total-=v;else{total+=v;prev=v}
    }
    return Math.max(0,total);
  }
  function titleForLevel(level=state.baseLevel,ascension=state.ascension?.stars||0){
    const lv=Math.max(1,Math.min(ASCENSION_LEVEL_CAP,Math.floor(Number(level)||1)));
    const base=TITLES[lv-1]||TITLES[0];
    const roman=romanNumeral(ascension);
    return base+(roman?" "+roman:"");
  }
  function ascensionIncomeMultiplier(){
    const stars=state.ascension?.stars||0;
    return 1+(stars*0.20)+((state.ascension?.perks?.income||0)*0.10);
  }
  function ascensionLuckMultiplier(){
    const stars=state.ascension?.stars||0;
    return 1+(stars*0.02)+((state.ascension?.perks?.luck||0)*0.03);
  }
  function forgeCostMultiplier(){
    return Math.pow(0.94,state.ascension?.perks?.forge||0);
  }
  function baseIncomeMultiplier(level=state.baseLevel){return 1+(Math.max(1,Number(level)||1)-1)*0.25}
  function economyScale(level=state.baseLevel){
    return Math.pow(5,Math.max(0,Math.min(ASCENSION_LEVEL_CAP,Number(level)||1)-1));
  }
  function luckValue(level=state.baseLevel){
    const x=Math.max(0,level-1);
    return 1+(0.045*x)+(0.0035*Math.pow(x,1.28));
  }
  function standLimit(level=state.baseLevel){return STANDS[Math.min(39,Math.max(0,level-1))]||50}
  function charIncomeMultiplier(id){
    const safe=Math.max(1,Number(id)||1);
    return 1+((safe-1)*0.003);
  }
  function charBaseIncome(id){
    // Economy normalization: big Mutation jackpots, nearly unchanged early-game average pace.
    return 470*charIncomeMultiplier(id);
  }
  function charIncomeBonusText(id){
    return "+"+((charIncomeMultiplier(id)-1)*100).toFixed(1)+"%";
  }
  function wealthLevel(value){
    if(!Number.isFinite(value)||value<=0)return 0;
    return Math.min(9,Math.max(0,Math.floor(Math.log10(value)/3)));
  }
  function wealthClass(value){return "wealth-value wealth-"+wealthLevel(value)}
  function rankBand(level){return Math.min(5,Math.floor((Math.max(1,level)-1)/4))}
  function rankFxStyle(level,ascension=state.ascension?.stars||0){
    const actual=Math.max(1,Math.floor(Number(level)||1));
    const lv=Math.max(1,Math.min(40,actual)),fx=TITLE_FX[lv-1];
    const asc=Math.max(0,Math.floor(Number(ascension)||0));
    return "--rank:"+fx[0]+";--rank2:"+fx[1]+";--rank-glow:"+(10+lv*1.25+Math.min(24,asc*2))+"px;--rank-speed:"+Math.max(1.9,6.4-lv*.11)+"s";
  }
  function rankFxClass(level){
    const actual=Math.max(1,Math.floor(Number(level)||1));
    return "rank-fx rank-level-"+Math.max(1,Math.min(40,actual))+" rank-band-"+rankBand(actual)+(actual>40?" rank-endless":"");
  }
  function tierFxClass(tier){return "tier-fx tier-"+Math.max(0,Math.min(TIERS.length-1,Number(tier)||0))}
  function gradeFxClass(grade){return "grade-fx grade-"+Math.max(0,Math.min(GRADES.length-1,Number(grade)||0))}
  function mutationFxClass(mutation){
    const m=Math.max(0,Math.min(MUTATIONS.length-1,Number(mutation)||0));
    return m?" mutation-fx mutation-"+m:"";
  }
  function mutationStyle(mutation){
    const m=MUTATIONS[Math.max(0,Math.min(MUTATIONS.length-1,Number(mutation)||0))]||MUTATIONS[0];
    return "--mutation:"+m.color;
  }
  function cardMutationIds(card){
    const a=Math.max(0,Math.min(MUTATIONS.length-1,Number(card?.mutation)||0));
    const b=Math.max(0,Math.min(MUTATIONS.length-1,Number(card?.mutation2)||0));
    return [...new Set([a,b].filter(Boolean))].slice(0,2);
  }
  function cardMutationFxClass(card){
    const ids=cardMutationIds(card);
    if(!ids.length)return "";
    return " mutation-fx mutation-"+ids[0]+(ids[1]?" mutation2-"+ids[1]+" dual-mutation":"");
  }
  function cardMutationStyle(card){
    const ids=cardMutationIds(card);
    const a=MUTATIONS[ids[0]||0],b=MUTATIONS[ids[1]||ids[0]||0];
    return "--mutation:"+a.color+";--mutation2:"+b.color;
  }
  function mutationShortName(id){
    const map={
      9:"Prism",
      10:"Celestial",
      11:"Abyssal",
      12:"Chrono",
      13:"Glitch",
      14:"Helix",
      15:"Riftglass",
      16:"Inverse",
      17:"Quantum",
      18:"Echo",
      19:"Horizon",
      20:"Rune",
      21:"Amaterasu",
      22:"Chokun"
    };
    return map[id]||MUTATIONS[id]?.name||"Mutation";
  }

  function mutationBadge(card){
    const ids=cardMutationIds(card);
    if(!ids.length)return "";
    return '<span class="mutation-badges">'+ids.map((i,slot)=>{
      const m=MUTATIONS[i];
      return '<span class="mutation-badge mutation-'+i+' slot-'+(slot+1)+'" title="'+escapeHtml(m.name)+'" style="--mutation:'+m.color+'">'+m.icon+' '+escapeHtml(mutationShortName(i))+'</span>';
    }).join("")+'</span>';
  }
  function mutationNames(card){
    const ids=cardMutationIds(card);
    return ids.length?ids.map(i=>MUTATIONS[i].icon+" "+MUTATIONS[i].name).join(" + "):"Normal";
  }
  function mutationIncomeMultiplier(card){
    return cardMutationIds(card).reduce((multi,i)=>multi*MUTATIONS[i].income,1);
  }
  function mutationLuckRawBonus(card){
    return cardMutationIds(card).reduce((sum,i)=>sum+Math.max(0,MUTATIONS[i].luck-1),0);
  }

  function mutationOdds(){
    const sum=MUTATIONS.reduce((s,m)=>s+m.weight,0);
    return MUTATIONS.map(m=>m.weight/sum);
  }
  function randomMutation(){
    let r=Math.random()*MUTATIONS.reduce((s,m)=>s+m.weight,0);
    for(let i=0;i<MUTATIONS.length;i++){r-=MUTATIONS[i].weight;if(r<=0)return i}
    return 0;
  }

  function placedMutationRawBonus(){
    normalizeSlots();
    return state.placed.reduce((sum,uid)=>{
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      return sum+(c?mutationLuckRawBonus(c):0);
    },0);
  }
  function mutationLuckMultiplier(){
    const raw=placedMutationRawBonus();
    const soft=raw/(1+(raw/1.25));
    return 1+soft;
  }
  function effectiveLuckValue(level=state.baseLevel){
    return luckValue(level)*mutationLuckMultiplier()*ascensionLuckMultiplier();
  }

  function normalizeSlots(){
    const count=standLimit();
    const next=new Array(count).fill(null);
    const seen=new Set();
    for(let i=0;i<Math.min(state.placed.length,count);i++){
      const uid=state.placed[i];
      if(uid&&state.cards.some(c=>c.uid===uid)&&!seen.has(uid)){next[i]=uid;seen.add(uid)}
    }
    state.placed=next;
  }

  function awakeningStars(card){return Math.max(0,Math.floor(Number(card?.awakening)||0))}
  function awakeningMultiplier(card){return 1+(awakeningStars(card)*0.35)}
  function awakeningRequiredLevel(card){return 100*(awakeningStars(card)+1)}
  function awakeningBadge(card){
    const stars=awakeningStars(card);
    return stars?'<span class="awakening-badge awaken-'+stars+'" aria-label="Awaken '+stars+'">★'+stars+'</span>':"";
  }
  function cardCoreIncome(card){
    const tier=TIERS[card.tier],grade=GRADES[card.grade];
    const levelMulti=Math.pow(1.04,Math.max(0,card.level-1));
    return charBaseIncome(card.charId)*tier.multi*grade.multi*levelMulti*awakeningMultiplier(card);
  }
  function cardIntrinsicIncome(card){
    return cardCoreIncome(card)*mutationIncomeMultiplier(card);
  }

  function cardIncome(card){
    return cardIntrinsicIncome(card)*baseIncomeMultiplier()*economyScale()*ascensionIncomeMultiplier();
  }

  function totalIncome(){
    normalizeSlots();
    return state.placed.reduce((sum,uid)=>{
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      return sum+(c?cardIncome(c):0);
    },0);
  }

  function upgradeCost(card){
    const income=cardIntrinsicIncome(card);
    const level=Math.max(1,Number(card.level)||1);
    // Card Level ต้องเป็น long-term sink: เริ่มแพงขึ้น ~6x และโตเร็วกว่ารายได้ของการ์ด
    const seconds=40*Math.pow(1.05,level-1);
    return roundUpNice(Math.min(1e300,income*seconds*baseIncomeMultiplier()*economyScale()*forgeCostMultiplier()));
  }

  function rerollCost(card){
    return (GRADE_REROLL_COSTS[card.tier]||GRADE_REROLL_COSTS[0])*economyScale()*forgeCostMultiplier();
  }

  function sellValue(card){
    const income=cardIntrinsicIncome(card);
    return roundUpNice(income*(4+Math.min(20,card.level*0.14))*economyScale());
  }

  function roundUpNice(value){
    if(!Number.isFinite(value)||value<=0)return 0;
    const power=Math.max(0,Math.floor(Math.log10(value))-2);
    const step=Math.pow(10,power);
    return Math.ceil(value/step)*step;
  }
  function maxTierForLevel(level=state.baseLevel){
    const lv=Math.max(1,Number(level)||1);
    const unlockAt=[1,1,1,3,6,10,15,21,28,36,40];
    let count=0;
    for(const need of unlockAt)if(lv>=need)count++;
    return Math.max(3,Math.min(TIERS.length,count));
  }
  function tierQualityProgress(level=state.baseLevel){
    // Rebirth quality curve: almost no suppression in early game,
    // then low tiers fade out gradually through mid/late game.
    const lv=Math.max(1,Number(level)||1);
    return Math.max(0,Math.min(1,(lv-8)/18));
  }

  function lowTierWeightMultiplier(tier,level=state.baseLevel){
    const p=tierQualityProgress(level);
    if(tier===0)return 1-(0.88*p); // Common: strongest suppression
    if(tier===1)return 1-(0.68*p); // Uncommon
    if(tier===2)return 1-(0.38*p); // Rare
    if(tier===3)return 1-(0.12*p); // Epic: only a small fade
    return 1;
  }

  function tierOdds(level=state.baseLevel){
    const maxTier=maxTierForLevel(level);
    const luck=effectiveLuckValue(level);

    // Slightly stronger Luck conversion + Rebirth-based low-tier suppression.
    // This improves pack quality without making top-end tiers common.
    const ratio=Math.min(0.40,0.235+0.08*Math.max(0,luck-1));
    const weights=TIERS.map((_,i)=>
      i<maxTier
        ? Math.pow(ratio,i)*lowTierWeightMultiplier(i,level)
        : 0
    );
    const sum=weights.reduce((a,b)=>a+b,0);
    return weights.map(w=>sum?w/sum:0);
  }
  function randomTier(){
    const odds=tierOdds();
    let r=Math.random();
    for(let i=0;i<odds.length;i++){r-=odds[i];if(r<=0)return i}
    for(let i=odds.length-1;i>=0;i--) if(odds[i]>0) return i;
    return 0;
  }
  function gradeOdds(){
    const sum=GRADE_WEIGHTS.reduce((a,b)=>a+b,0);
    return GRADE_WEIGHTS.map(w=>w/sum);
  }
  function randomGrade(){
    let r=Math.random()*GRADE_WEIGHTS.reduce((a,b)=>a+b,0);
    for(let i=0;i<GRADE_WEIGHTS.length;i++){r-=GRADE_WEIGHTS[i];if(r<=0)return i}
    return 0;
  }
  function expectedTierMultiplier(level){
    const odds=tierOdds(level);
    return odds.reduce((sum,p,i)=>sum+p*TIERS[i].multi,0);
  }

  function idPackRanges(){
    const ranges=[];
    let index=0;
    for(let start=CARD_MIN_ID;start<=CARD_MAX_ID;start+=10,index++){
      const end=Math.min(CARD_MAX_ID,start+9);
      const custom=ID_PACK_CUSTOM[start]||{};
      ranges.push({
        index,start,end,
        name:String(custom.name||("ID Pack "+String(index+1).padStart(2,"0"))),
        image:String(custom.image||""),
        priceSeconds:Number.isFinite(Number(custom.priceSeconds))&&Number(custom.priceSeconds)>0
          ? Number(custom.priceSeconds)
          : null
      });
    }
    return ranges;
  }

  function modeledBaseIncomeForShop(level=state.baseLevel){
    const x=Math.max(0,level-1);
    const avgCharacterIncome=545; // frozen economy model; keeps shop pricing independent from current stand manipulation
    const assumedCardLevel=1+Math.round(x*4.2);
    const expectedCardIncome=
      avgCharacterIncome*
      rebirthExpectedTierMultiplier(level)*
      Math.pow(1.04,assumedCardLevel-1)*
      baseIncomeMultiplier(level)*
      economyScale(level);
    return expectedCardIncome*standLimit(level);
  }

  function idPackCost(rangeOrIndex,level=state.baseLevel){
    const range=typeof rangeOrIndex==="object"&&rangeOrIndex
      ? rangeOrIndex
      : idPackRanges().find(r=>r.index===Number(rangeOrIndex));
    const index=range?range.index:Math.max(0,Number(rangeOrIndex)||0);
    const seconds=range&&range.priceSeconds
      ? range.priceSeconds
      : 12+(index*10);
    return roundUpNice(modeledBaseIncomeForShop(level)*seconds);
  }

  function renderIdPackShop(){
    const wrap=$("#idPackShop");if(!wrap)return;
    const ranges=idPackRanges();
    const pageCount=Math.max(1,Math.ceil(ranges.length/ID_PACK_PAGE_SIZE));
    idPackPage=Math.max(0,Math.min(idPackPage,pageCount-1));
    const pageStart=idPackPage*ID_PACK_PAGE_SIZE;
    const visible=ranges.slice(pageStart,pageStart+ID_PACK_PAGE_SIZE);

    const cards=visible.map(r=>{
      const cost=idPackCost(r);
      const minBonus=charIncomeBonusText(r.start),maxBonus=charIncomeBonusText(r.end);
      const cover=r.image
        ? '<div class="id-pack-cover has-image"><img src="'+escapeHtml(r.image)+'" alt="'+escapeHtml(r.name)+'"></div>'
        : '<div class="id-pack-cover fallback"><span>PACK</span><b>'+String(r.index+1).padStart(2,"0")+'</b></div>';
      return '<article class="id-pack-card" style="--pack-index:'+r.index+'">'+
        cover+
        '<div class="id-pack-content">'+
          '<div class="id-pack-top"><span>ID PACK</span><strong>'+padId(r.start)+'–'+padId(r.end)+'</strong></div>'+
          '<div class="id-pack-name">'+escapeHtml(r.name)+'</div>'+
          '<div class="id-pack-range"><b>'+r.start+'–'+r.end+'</b><small>Character Pool</small></div>'+
          '<div class="id-pack-meta"><span>ID Income '+minBonus+' → '+maxBonus+'</span><span>Tier ใช้ Luck ปัจจุบัน</span></div>'+
          '<div class="id-pack-actions">'+
            '<button type="button" data-buy-id-pack="'+r.index+'">สุ่ม '+fmt(cost)+'</button>'+
            '<button type="button" class="id-pack-auto-btn '+(idPackAutoIndex===r.index?'on':'')+'" data-auto-id-pack="'+r.index+'">'+
              (idPackAutoIndex===r.index?'หยุด Auto · '+idPackAutoCount:'Auto')+
            '</button>'+
          '</div>'+
        '</div>'+
      '</article>';
    }).join("");

    const first=ranges.length?pageStart+1:0;
    const last=Math.min(ranges.length,pageStart+visible.length);
    const pager=pageCount>1
      ? '<nav class="id-pack-pagination" aria-label="หน้าร้าน ID Pack">'+
          '<button type="button" data-id-pack-page="'+(idPackPage-1)+'" '+(idPackPage===0?'disabled':'')+'>‹ ก่อนหน้า</button>'+
          '<div class="id-pack-page-info"><strong>หน้า '+(idPackPage+1)+' / '+pageCount+'</strong><span>แพ็ก '+first+'–'+last+' จาก '+ranges.length+'</span></div>'+
          '<button type="button" data-id-pack-page="'+(idPackPage+1)+'" '+(idPackPage>=pageCount-1?'disabled':'')+'>ถัดไป ›</button>'+
        '</nav>'
      : '';

    wrap.innerHTML=cards+pager;
    wrap.querySelectorAll(".id-pack-cover img").forEach(img=>{
      img.addEventListener("error",()=>{
        const cover=img.closest(".id-pack-cover");
        if(cover){
          cover.className="id-pack-cover fallback";
          cover.innerHTML="<span>NO IMAGE</span><b>PACK</b>";
        }
      },{once:true});
    });
  }

  function buyIdPack(rangeIndex,{auto=false}={}){
    const ranges=idPackRanges(),range=ranges.find(r=>r.index===rangeIndex);
    if(!range)return null;
    const cost=idPackCost(range);
    if(state.money<cost){
      if(!auto)toast("เงินไม่พอ · "+range.name+" ใช้ "+fmt(cost));
      return null;
    }

    state.money-=cost;
    const tier=randomTier();
    const card=createCardFromTier(tier,range.start,range.end);

    if(auto){
      idPackAutoCount++;
      const special=tier>=4||Number(card.mutation||0)>0;
      toast(
        "Auto "+range.name+" #"+idPackAutoCount+" · "+padId(card.charId)+" "+TIERS[tier].name+
        (card.mutation?" · "+MUTATIONS[card.mutation].icon+" "+MUTATIONS[card.mutation].name:""),
        special
      );
      renderHeader();
      renderIdPackShop();
      if($("#panel-collection")?.classList.contains("active"))renderCollection();
      if($("#panel-index")?.classList.contains("active"))renderCardIndex();
      renderRebirth();
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      if(idPackAutoCount%5===0)scheduleCloudSave();
    }else{
      toast("เปิด "+range.name+" · ได้ "+padId(card.charId)+" "+TIERS[tier].name+" ✨",true);
      showReveal(card);
      renderAll();
    }
    return card;
  }

  function stopIdPackAuto(message=""){
    clearTimeout(idPackAutoTimer);
    idPackAutoTimer=0;
    const wasActive=idPackAutoIndex!==null;
    idPackAutoIndex=null;
    if(wasActive){
      save();
      if(message)toast(message);
    }
    renderIdPackShop();
  }

  function processIdPackAuto(){
    clearTimeout(idPackAutoTimer);
    idPackAutoTimer=0;
    if(idPackAutoIndex===null)return;

    const index=idPackAutoIndex;
    const range=idPackRanges().find(r=>r.index===index);
    if(!range){
      stopIdPackAuto("หยุด Auto · ไม่พบแพ็กนี้แล้ว");
      return;
    }

    if(state.money<idPackCost(range)){
      stopIdPackAuto("Auto "+range.name+" หยุดแล้ว · เงินไม่พอ 💸");
      return;
    }

    const card=buyIdPack(index,{auto:true});
    if(!card){
      stopIdPackAuto("Auto "+range.name+" หยุดแล้ว");
      return;
    }

    idPackAutoTimer=setTimeout(processIdPackAuto,ID_PACK_AUTO_MS);
  }

  function toggleIdPackAuto(rangeIndex){
    if(idPackAutoIndex===rangeIndex){
      stopIdPackAuto("หยุด Auto ID Pack แล้ว");
      return;
    }

    clearTimeout(idPackAutoTimer);
    idPackAutoTimer=0;
    idPackAutoIndex=rangeIndex;
    idPackAutoCount=0;
    closeReveal();
    const range=idPackRanges().find(r=>r.index===rangeIndex);
    if(!range){
      stopIdPackAuto();
      return;
    }
    if(state.money<idPackCost(range)){
      idPackAutoIndex=null;
      toast("เงินไม่พอ · "+range.name+" ใช้ "+fmt(idPackCost(range)));
      renderIdPackShop();
      return;
    }

    toast("เปิด Auto · "+range.name+" 🔁");
    renderIdPackShop();
    processIdPackAuto();
  }

  function rotatingShopRotationId(now=Date.now()){
    return Math.floor(now/ROTATING_SHOP_RESTOCK_MS);
  }

  function rotatingShopRemaining(now=Date.now()){
    const elapsed=now%ROTATING_SHOP_RESTOCK_MS;
    return Math.max(0,ROTATING_SHOP_RESTOCK_MS-elapsed);
  }

  function seededRandom(seed){
    let x=(Number(seed)||1)|0;
    return ()=>{
      x=(x+0x6D2B79F5)|0;
      let t=x;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }

  function weightedPickObject(table,rng=Math.random){
    const entries=Object.entries(table||{}).filter(([,w])=>Number(w)>0);
    if(!entries.length)return 0;
    const total=entries.reduce((s,[,w])=>s+Number(w),0);
    let roll=rng()*total;
    for(const [key,w] of entries){
      roll-=Number(w);
      if(roll<=0)return Number(key);
    }
    return Number(entries[entries.length-1][0]);
  }

  function pickWeightedArchetype(pool,rng){
    const total=pool.reduce((s,a)=>s+a.weight,0);
    let roll=rng()*total;
    for(const a of pool){
      roll-=a.weight;
      if(roll<=0)return a;
    }
    return pool[pool.length-1];
  }

  function ensureRotatingShopState(){
    const id=rotatingShopRotationId();
    if(!state.rotatingShop||typeof state.rotatingShop!=="object")state.rotatingShop={rotationId:id,bought:{}};
    if(Number(state.rotatingShop.rotationId)!==id){
      state.rotatingShop={rotationId:id,bought:{}};
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      scheduleCloudSave();
      return true;
    }
    if(!state.rotatingShop.bought||typeof state.rotatingShop.bought!=="object")state.rotatingShop.bought={};
    return false;
  }

  function rotatingShopOffers(rotationId=rotatingShopRotationId()){
    const rng=seededRandom(rotationId^0x51F15EED);
    const themes=idPackRanges();
    const themePool=[...themes];
    const archPool=[...ROTATING_PACK_ARCHETYPES];
    const offers=[];

    // Always keep one entry-level premium offer; the other four rotate randomly.
    const entry=archPool.find(a=>a.key==="rare-bloom")||archPool[0];
    if(entry)archPool.splice(archPool.indexOf(entry),1);

    for(let slot=0;slot<ROTATING_SHOP_SLOTS;slot++){
      if(!themePool.length)themePool.push(...themes);
      const themeIndex=Math.floor(rng()*themePool.length);
      const theme=themePool.splice(themeIndex,1)[0]||themes[slot%themes.length];

      let archetype;
      if(slot===0&&entry){
        archetype=entry;
      }else{
        archetype=pickWeightedArchetype(archPool,rng);
        const idx=archPool.indexOf(archetype);
        if(idx>=0)archPool.splice(idx,1);
      }

      const stock=archetype.stockMin+Math.floor(rng()*(archetype.stockMax-archetype.stockMin+1));
      offers.push({
        id:rotationId+"-"+slot,
        slot,rotationId,
        themeIndex:theme.index,start:theme.start,end:theme.end,
        themeName:theme.name,image:theme.image,
        archetypeKey:archetype.key,name:archetype.name,label:archetype.label,
        minLevel:archetype.minLevel,
        featuredTier:archetype.featuredTier,
        stock,priceSeconds:archetype.priceSeconds,
        outRate:archetype.outRate,
        rates:archetype.rates,outPool:archetype.outPool
      });
    }
    return offers;
  }

  function rotatingPackCost(offer){
    return roundUpNice(modeledBaseIncomeForShop()*offer.priceSeconds);
  }

  function rotatingPackBought(offer){
    return Math.max(0,Math.floor(Number(state.rotatingShop?.bought?.[offer.id])||0));
  }

  function rotatingPackStockLeft(offer){
    return Math.max(0,offer.stock-rotatingPackBought(offer));
  }

  function formatShopTimer(ms){
    const total=Math.max(0,Math.ceil(ms/1000));
    const m=Math.floor(total/60),s=total%60;
    return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  }

  function rotatingNormalRates(offer){
    const unlocked=maxTierForLevel();
    const filtered=Object.fromEntries(
      Object.entries(offer.rates||{}).filter(([tier,w])=>Number(tier)<unlocked&&Number(w)>0)
    );
    if(Object.keys(filtered).length)return filtered;
    return {[offer.featuredTier]:1};
  }

  function rateRowsHtml(offer){
    const normalRates=rotatingNormalRates(offer);
    const total=Object.values(normalRates).reduce((a,b)=>a+Number(b),0);
    const rows=Object.entries(normalRates)
      .sort((a,b)=>Number(a[0])-Number(b[0]))
      .map(([tier,w])=>{
        const t=TIERS[Number(tier)];
        const pct=(1-offer.outRate)*(Number(w)/total)*100;
        return '<div class="rot-rate"><span style="--rate-color:'+t.color+'">'+t.name+'</span><b>'+pct.toFixed(pct<10?1:0)+'%</b></div>';
      }).join("");
    const outEntries=Object.entries(offer.outPool||{}).filter(([tier,w])=>TIERS[Number(tier)]&&Number(w)>0);
    const outTotal=outEntries.reduce((sum,[,w])=>sum+Number(w),0);
    const jackpotNames=outEntries.map(([tier,w])=>{
      const t=TIERS[Number(tier)];
      const absolute=outTotal?offer.outRate*(Number(w)/outTotal)*100:0;
      const digits=absolute<.01?4:absolute<.1?3:2;
      return t.name+" "+absolute.toFixed(digits)+"%";
    }).join(" / ");
    return rows+
      '<div class="rot-rate out-rate"><span>OUT OF RATE</span><b>'+(offer.outRate*100).toFixed(offer.outRate*100<2?1:0)+'%</b></div>'+
      '<div class="rot-out-pool">JACKPOT → '+escapeHtml(jackpotNames)+'</div>';
  }

  function renderRotatingPackShop(){
    const wrap=$("#rotatingPackGrid");
    if(!wrap)return;
    ensureRotatingShopState();
    const offers=rotatingShopOffers();
    wrap.innerHTML=offers.map(offer=>{
      const featured=TIERS[offer.featuredTier];
      const left=rotatingPackStockLeft(offer);
      const cost=rotatingPackCost(offer);
      const locked=state.baseLevel<offer.minLevel;
      const cover=offer.image
        ? '<div class="rot-pack-cover"><img src="'+escapeHtml(offer.image)+'" alt="'+escapeHtml(offer.themeName)+'"></div>'
        : '<div class="rot-pack-cover rot-pack-fallback"><span>'+escapeHtml(offer.themeName)+'</span></div>';
      return '<article class="rot-pack tier-'+offer.featuredTier+(locked?' locked':'')+'" style="--pack-tier:'+featured.color+'">'+
        '<div class="rot-pack-ribbon">'+escapeHtml(offer.label)+'</div>'+
        cover+
        '<div class="rot-pack-body">'+
          '<div class="rot-pack-kicker">'+escapeHtml(offer.themeName)+' · '+offer.start+'–'+offer.end+'</div>'+
          '<div class="rot-pack-title">'+escapeHtml(offer.name)+'</div>'+
          '<div class="rot-pack-feature"><span>FEATURED</span><strong style="color:'+featured.color+'">'+featured.name+'</strong></div>'+
          '<div class="rot-pack-rates">'+rateRowsHtml(offer)+'</div>'+
          '<div class="rot-pack-footer">'+
            '<div class="rot-stock"><span>STOCK</span><strong>'+left+'/'+offer.stock+'</strong></div>'+
            '<button type="button" data-buy-rot-pack="'+offer.id+'" '+(left<=0||locked?'disabled':'')+'>'+
              (locked?'ปลดที่ Base Lv.'+offer.minLevel:left<=0?'SOLD OUT':'ซื้อ & เปิด · '+fmt(cost))+
            '</button>'+
          '</div>'+
        '</div>'+
      '</article>';
    }).join("");
    wrap.querySelectorAll("img").forEach(img=>img.addEventListener("error",()=>{
      const cover=img.closest(".rot-pack-cover");
      if(cover){cover.classList.add("rot-pack-fallback");cover.innerHTML="<span>PREMIUM PACK</span>"}
    },{once:true}));
    renderRotatingShopClock();
  }

  function renderRotatingShopClock(){
    const timer=$("#rotatingRestockTimer"),cycle=$("#rotatingShopCycle");
    if(!timer)return;
    const changed=ensureRotatingShopState();
    if(changed){
      renderRotatingPackShop();
      return;
    }
    const id=rotatingShopRotationId();
    timer.textContent=formatShopTimer(rotatingShopRemaining());
    if(cycle)cycle.textContent="Rotation #"+String(id).slice(-6);
  }

  function buyRotatingPack(offerId){
    ensureRotatingShopState();
    const offer=rotatingShopOffers().find(o=>o.id===String(offerId));
    if(!offer){
      toast("ร้านรีสต็อกแล้ว · ลองเลือกแพ็กใหม่");
      renderRotatingPackShop();
      return;
    }
    if(state.baseLevel<offer.minLevel){
      toast(offer.name+" ปลดที่ Base Lv."+offer.minLevel);
      return;
    }
    const left=rotatingPackStockLeft(offer);
    if(left<=0){
      toast("แพ็กนี้ SOLD OUT แล้ว");
      return;
    }
    const cost=rotatingPackCost(offer);
    if(state.money<cost){
      toast("เงินไม่พอ · "+offer.name+" ใช้ "+fmt(cost));
      return;
    }

    state.money-=cost;
    const outOfRate=Math.random()<offer.outRate;
    const tier=outOfRate
      ? weightedPickObject(offer.outPool)
      : weightedPickObject(rotatingNormalRates(offer));
    const card=createCardFromTier(tier,offer.start,offer.end);
    state.rotatingShop.bought[offer.id]=rotatingPackBought(offer)+1;
    // Keep the visible STOCK counter/button in sync immediately after purchase.
    renderRotatingPackShop();

    if(outOfRate){
      toast("OUT OF RATE!! "+TIERS[tier].name+" · "+padId(card.charId)+" 🌌",true);
    }else{
      toast("เปิด "+offer.name+" · "+TIERS[tier].name+" "+padId(card.charId)+" ✨",tier>=offer.featuredTier);
    }
    showReveal(card);
    renderAll();
  }

  function rebirthExpectedTierMultiplier(level){
    // Freeze ราคา Rebirth ตาม balance ก่อนปรับ Luck/Tier รอบนี้
    const lv=Math.max(1,Number(level)||1);
    const legacyMax=Math.min(10,Math.max(3,lv+2));
    const legacyLuck=1+(lv-1)*0.145;
    const legacyRatio=Math.min(0.62,0.24+0.124*Math.max(0,legacyLuck-1));
    const weights=TIERS.map((_,i)=>i<legacyMax?Math.pow(legacyRatio,i):0);
    const sum=weights.reduce((a,b)=>a+b,0);
    return weights.reduce((acc,w,i)=>acc+(sum?w/sum:0)*TIERS[i].multi,0);
  }

  function rebirthTargetSeconds(level=state.baseLevel){
    const lv=Math.max(1,Math.min(ASCENSION_LEVEL_CAP,Math.floor(Number(level)||1)));
    const x=Math.max(0,lv-1);
    return Math.round(240*Math.pow(1.16,x)+35*x);
  }

  function rebirthCost(level=state.baseLevel){
    const x=Math.max(0,Math.min(ASCENSION_LEVEL_CAP-1,(Number(level)||1)-1));
    const avgCharacterIncome=545;
    const assumedCardLevel=1+Math.round(x*4.2);
    const optimizationFactor=1+(0.10*x)+(0.018*x*x);
    const expectedCardIncome=
      avgCharacterIncome*
      rebirthExpectedTierMultiplier(level)*
      Math.pow(1.04,assumedCardLevel-1)*
      baseIncomeMultiplier(level);
    const expectedBaseIncome=expectedCardIncome*standLimit(level);
    const raw=expectedBaseIncome*rebirthTargetSeconds(level)*optimizationFactor*economyScale(level);
    return roundUpNice(Math.min(1e300,Number.isFinite(raw)?raw:1e300));
  }

  function updateSyncUi(mode="local"){
    const dot=$("#syncDot"),label=$("#accountLabel"),sync=$("#syncLabel");
    if(!dot||!label||!sync)return;
    dot.className="sync-dot";
    if(!gameAccount||!gameToken){
      label.textContent="เล่นแบบ Local";
      sync.textContent="ล็อกอินเพื่อใช้ Cloud Save";
      return;
    }
    label.textContent="@"+gameAccount.username;
    if(mode==="syncing"){dot.classList.add("syncing");sync.textContent="กำลังซิงก์…"}
    else if(mode==="error"){dot.classList.add("error");sync.textContent="Cloud มีปัญหา · เก็บ Local ไว้ก่อน"}
    else{dot.classList.add("online");sync.textContent="Cloud Save พร้อมใช้งาน"}
  }

  function setAuthMessage(message,type=""){
    const el=$("#authMessage");if(!el)return;
    el.textContent=message||"";
    el.className="auth-message"+(type?" "+type:"");
  }

  function showRecoveryCode(code){
    const box=$("#recoveryCodeBox"),value=$("#recoveryCodeValue");
    if(!box||!value)return;
    if(!code){box.hidden=true;value.textContent="";return}
    value.textContent=code;box.hidden=false;
  }

  function renderAuth(){
    const signedIn=!!(gameAccount&&gameToken);
    $("#authSignedOut").hidden=signedIn;
    $("#authSignedIn").hidden=!signedIn;
    if(signedIn)$("#authUsernameLabel").textContent="@"+gameAccount.username;
    updateSyncUi(signedIn?(cloudReady?"online":"syncing"):"local");
  }

  function particlesEnabled(){
    return localStorage.getItem(PARTICLES_PREF_KEY)!=="0";
  }

  function tradeNotificationsEnabled(){
    return localStorage.getItem(TRADE_NOTIFY_PREF_KEY)!=="0";
  }

  function tradeNotificationPermission(){
    if(!("Notification" in window))return "unsupported";
    return Notification.permission||"default";
  }

  async function ensureTradeNotificationRegistration(){
    if(!("serviceWorker" in navigator))return null;
    if(tradeNotificationRegistration)return tradeNotificationRegistration;
    try{
      await navigator.serviceWorker.register("./sw.js?v=20261006-trade-notify-v1");
      tradeNotificationRegistration=await navigator.serviceWorker.ready;
      return tradeNotificationRegistration;
    }catch{
      return null;
    }
  }

  function tradeNotificationStatusText(){
    if(!tradeNotificationsEnabled())return "OFF";
    const permission=tradeNotificationPermission();
    if(permission==="unsupported")return "UNAVAILABLE";
    if(permission==="granted")return "ON";
    if(permission==="denied")return "BLOCKED";
    return "TAP TO ALLOW";
  }

  function renderSettings(){
    const enabled=particlesEnabled();
    const toggle=$("#particlesToggle"),status=$("#particlesStatus");
    if(toggle)toggle.checked=enabled;
    if(status){
      status.textContent=enabled?"ON":"OFF";
      status.className=enabled?"on":"off";
    }
    document.body.classList.toggle("particles-disabled",!enabled);

    const tradeEnabled=tradeNotificationsEnabled();
    const tradeToggle=$("#tradeNotifyToggle"),tradeStatus=$("#tradeNotifyStatus");
    if(tradeToggle)tradeToggle.checked=tradeEnabled;
    if(tradeStatus){
      const text=tradeNotificationStatusText();
      tradeStatus.textContent=text;
      tradeStatus.className=text==="ON"?"on":text==="OFF"?"off":text==="BLOCKED"?"blocked":"pending";
    }
  }

  function setParticlesEnabled(enabled){
    localStorage.setItem(PARTICLES_PREF_KEY,enabled?"1":"0");
    renderSettings();
    window.dispatchEvent(new CustomEvent("cardbase:particles",{detail:{enabled:!!enabled}}));
    toast(enabled?"เปิด Particles แล้ว ✨":"ปิด Particles แล้ว · เบาเครื่องขึ้น ⚡");
  }

  async function setTradeNotificationsEnabled(enabled){
    localStorage.setItem(TRADE_NOTIFY_PREF_KEY,enabled?"1":"0");
    if(!enabled){
      renderSettings();
      toast("ปิดแจ้งเตือน Trade นอกจอแล้ว 🔕");
      return;
    }
    if(!("Notification" in window)){
      renderSettings();
      toast("เบราว์เซอร์นี้ยังไม่รองรับ System Notification");
      return;
    }
    let permission=Notification.permission;
    if(permission==="default"){
      try{permission=await Notification.requestPermission()}catch{}
    }
    if(permission==="granted"){
      await ensureTradeNotificationRegistration();
      toast("เปิดแจ้งเตือน Trade นอกจอแล้ว 🔔",true);
    }else if(permission==="denied"){
      toast("การแจ้งเตือนถูกบล็อกในเบราว์เซอร์ · ต้องอนุญาตจาก Site Settings");
    }
    renderSettings();
  }

  async function maybeRequestTradeNotificationPermission(){
    if(!tradeNotificationsEnabled()||!("Notification" in window)||Notification.permission!=="default")return;
    let permission="default";
    try{permission=await Notification.requestPermission()}catch{}
    if(permission==="granted"){
      await ensureTradeNotificationRegistration();
      toast("เปิดแจ้งเตือนข้อเสนอ Trade แล้ว 🔔",true);
    }
    renderSettings();
  }

  function openSettings(){
    renderSettings();
    $("#settingsModal").classList.add("show");
    $("#settingsModal").setAttribute("aria-hidden","false");
  }

  function closeSettings(){
    $("#settingsModal").classList.remove("show");
    $("#settingsModal").setAttribute("aria-hidden","true");
  }

  function openAuth(){
    renderAuth();
    $("#authModal").classList.add("show");
    $("#authModal").setAttribute("aria-hidden","false");
  }

  function closeAuth(){
    $("#authModal").classList.remove("show");
    $("#authModal").setAttribute("aria-hidden","true");
  }

  function setAuthBusy(busy){
    authRequestBusy=busy;
    $("#loginBtn").disabled=busy;
    $("#signupBtn").disabled=busy;
    $("#recoverBtn").disabled=busy;
  }

  async function fetchMe(){
    if(!gameToken)return null;
    const result=await rpc("cb_me",{p_token:gameToken});
    if(!result.ok)return null;
    gameAccount=result;
    onlineProfile=result;
    socialProfiles.set(result.account_id,result);
    return result;
  }

  async function loadCloudState(){
    if(!gameToken||!supabaseClient)return;
    cloudLoading=true;cloudReady=false;updateSyncUi("syncing");
    const result=await rpc("cb_load_save",{p_token:gameToken});
    if(!result.ok){
      cloudLoading=false;
      if(result.error==="invalid_session")invalidateGameSession();
      else updateSyncUi("error");
      return;
    }

    if(result.exists&&result.state){
      state=hydrateState(result.state);
      const now=Date.now();
      const offlineSeconds=Math.max(0,(now-(state.lastTick||now))/1000);
      normalizeSlots();
      if(offlineSeconds>2&&state.placed.some(Boolean))state.money=clampMoney(state.money+totalIncome()*offlineSeconds);
      state.lastTick=now;
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
    }else{
      state.lastTick=Date.now();
    }

    cloudLoading=false;cloudReady=true;
    if(!result.exists)await flushCloudSave();
    renderAll();
    if(Number(result.server_grants)>0){
      toast("🎁 ของขวัญเซิร์ฟเวอร์มาแล้ว! Singularity Pack ×1 + ⚡ Lv.100 Ticket ×1",true);
    }
    updateSyncUi("online");
  }

  async function activateGameSession(token,username,recoveryCode=null){
    rotateMutationEventSession();
    gameToken=token;
    try{sessionStorage.setItem(GAME_SESSION_KEY,token);localStorage.removeItem(GAME_SESSION_KEY)}catch{}
    gameAccount={username};
    renderAuth();
    const me=await fetchMe();
    if(!me){
      clearGameSession();
      setAuthMessage("Session ใช้งานไม่ได้ กรุณาลองเข้าสู่ระบบใหม่","error");
      return false;
    }
    await loadCloudState();
    await heartbeatOnline();
    if(recoveryCode)showRecoveryCode(recoveryCode);
    renderAuth();renderOnlineShell();
    return true;
  }

  async function initCloud(){
    // Direct RPC client only. Keeping the game self-hosted removes third-party
    // executable JavaScript from the page and narrows the CSP attack surface.
    supabaseClient=makeRestRpcClient();
    if(gameToken){
      const me=await fetchMe();
      if(me){
        await loadCloudState();
        await heartbeatOnline();
      }else{
        invalidateGameSession();
      }
    }else{
      renderAuth();renderOnlineShell();
    }
  }

  function normalizeUsername(value){
    return String(value||"").trim().toLowerCase();
  }

  function validateUsername(username){
    return /^[a-z0-9_]{3,20}$/.test(username);
  }

  async function loginAccount(){
    if(authRequestBusy)return;
    const username=normalizeUsername($("#authUsername").value);
    const password=$("#authPassword").value;
    showRecoveryCode(null);
    if(!validateUsername(username)){setAuthMessage("Username ใช้ได้เฉพาะ a-z, 0-9, _ และยาว 3–20 ตัว","error");return}
    if(!password){setAuthMessage("กรอกรหัสผ่านก่อนนะ","error");return}
    setAuthBusy(true);setAuthMessage("กำลังเข้าสู่ระบบ…");
    try{
      const result=await rpc("cb_login",{p_username:username,p_password:password});
      if(!result.ok){setAuthMessage(result.message||"Username หรือรหัสผ่านไม่ถูกต้อง","error");return}
      const ok=await activateGameSession(result.token,result.username);
      if(ok){setAuthMessage("เข้าสู่ระบบสำเร็จ ✓","ok");toast("ยินดีต้อนรับ @"+result.username+" ✨",true)}
    }finally{setAuthBusy(false)}
  }

  async function signupAccount(){
    if(authRequestBusy)return;
    const username=normalizeUsername($("#authUsername").value);
    const password=$("#authPassword").value;
    const confirm=$("#authPasswordConfirm").value;
    showRecoveryCode(null);
    if(!validateUsername(username)){setAuthMessage("Username ใช้ได้เฉพาะ a-z, 0-9, _ และยาว 3–20 ตัว","error");return}
    if(password.length<10||password.length>72){setAuthMessage("รหัสผ่านต้องยาว 10–72 ตัวอักษร","error");return}
    if(password!==confirm){setAuthMessage("รหัสผ่านกับช่องยืนยันไม่ตรงกัน","error");return}
    setAuthBusy(true);setAuthMessage("กำลังสร้างบัญชี…");
    try{
      const result=await rpc("cb_register",{p_username:username,p_password:password});
      if(!result.ok){setAuthMessage(result.message||"สร้างบัญชีไม่สำเร็จ","error");return}
      const ok=await activateGameSession(result.token,result.username,result.recovery_code);
      if(ok){
        setAuthMessage("สร้างบัญชีสำเร็จ ✓ เก็บ Recovery Code ด้านล่างไว้ด้วยนะ","ok");
        toast("สร้างบัญชี @"+result.username+" สำเร็จ 🎉",true);
      }
    }finally{setAuthBusy(false)}
  }

  async function recoverAccount(){
    if(authRequestBusy)return;
    const username=normalizeUsername($("#authUsername").value);
    const code=$("#authRecoveryCode").value.trim().toUpperCase();
    const newPassword=$("#authNewPassword").value;
    showRecoveryCode(null);
    if(!validateUsername(username)){setAuthMessage("กรอก Username ของบัญชีที่ต้องการกู้ก่อน","error");return}
    if(!code){setAuthMessage("กรอก Recovery Code ก่อน","error");return}
    if(newPassword.length<10||newPassword.length>72){setAuthMessage("รหัสผ่านใหม่ต้องยาว 10–72 ตัวอักษร","error");return}
    setAuthBusy(true);setAuthMessage("กำลังกู้บัญชี…");
    try{
      const result=await rpc("cb_recover",{p_username:username,p_recovery_code:code,p_new_password:newPassword});
      if(!result.ok){setAuthMessage(result.message||"กู้บัญชีไม่สำเร็จ","error");return}
      const ok=await activateGameSession(result.token,result.username,result.recovery_code);
      if(ok)setAuthMessage("เปลี่ยนรหัสผ่านสำเร็จ ✓ Recovery Code ถูกเปลี่ยนใหม่แล้ว กรุณาเก็บโค้ดใหม่ไว้","ok");
    }finally{setAuthBusy(false)}
  }

  async function logoutAccount(){
    if(!gameToken)return;
    await flushCloudSave({force:true});
    await rpc("cb_logout",{p_token:gameToken});
    clearGameSession();
    state=newState();
    localStorage.setItem(SAVE_KEY,JSON.stringify(state));
    renderAll();closeAuth();toast("ออกจากระบบแล้ว · กลับสู่ Local ใหม่");
  }

  function escapeHtml(value){
    return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  function publicStandSnapshot(){
    normalizeSlots();
    return state.placed.map((uid,slot)=>{
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      if(!c)return null;
      return {slot,charId:c.charId,tier:c.tier,grade:c.grade,mutation:Number(c.mutation)||0,mutation2:Number(c.mutation2)||0,level:c.level,awakening:awakeningStars(c),income:Math.round(cardIncome(c))};
    }).filter(Boolean);
  }

  async function publishPublicBase(){
    if(!gameToken||!supabaseClient)return;
    const result=await rpc("cb_publish_presence",{
      p_token:gameToken,
      p_base_level:state.baseLevel,
      p_title:titleForLevel(),
      p_stands:publicStandSnapshot()
    });
    if(!result.ok&&result.error==="invalid_session")invalidateGameSession();
  }

  async function ensureOnlineProfile(){
    if(!gameToken||!supabaseClient)return null;
    const me=await fetchMe();
    if(me)renderOnlineShell();
    return me;
  }

  function mutationEventSchedule(nowMs=Date.now()+mutationEventClockOffset){
    const sec=Math.floor(nowMs/1000);
    // 15-minute cycle: wait 10 minutes, then Mutation Storm is active for 5 minutes.
    const cycleStart=Math.floor(sec/900)*900;
    const pos=sec-cycleStart;
    const active=pos>=600;
    return {
      active,
      startMs:(cycleStart+600)*1000,
      endMs:(cycleStart+900)*1000,
      nextStartMs:(active?cycleStart+1500:cycleStart+600)*1000
    };
  }

  function eventCountdown(ms){
    const total=Math.max(0,Math.ceil(ms/1000));
    const m=Math.floor(total/60),s=total%60;
    return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  }

  function mutationEventEligibleCount(){
    normalizeSlots();
    return state.placed.reduce((count,uid)=>{
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      return count+(c&&cardMutationIds(c).length<2?1:0);
    },0);
  }

  function renderMutationEvent(){
    const bar=$("#mutationEventBar");if(!bar)return;
    const title=$("#mutationEventTitle"),stateEl=$("#mutationEventState");
    const countdown=$("#mutationEventCountdown"),eligible=$("#mutationEventEligible");
    const schedule=mutationEventSchedule();
    const online=!!(gameToken&&gameAccount);
    const eligibleCount=mutationEventEligibleCount();

    eligible.textContent="มีช่อง Mutation ว่างบนฐาน "+eligibleCount+" ใบ · Grade สูงช่วยคัดผลดีขึ้น";

    if(schedule.active){
      bar.className="mutation-event-bar active";
      title.textContent="⚡ MUTATION STORM";
      stateEl.textContent=online?"EVENT ACTIVE · ออนไลน์อยู่":"EVENT ACTIVE · ล็อกอินเพื่อรับสิทธิ์";
      countdown.textContent="เหลือ "+eventCountdown(schedule.endMs-(Date.now()+mutationEventClockOffset));
    }else{
      bar.className="mutation-event-bar "+(online?"waiting":"offline");
      title.textContent="MUTATION EVENT";
      stateEl.textContent=online?"ONLINE · รอ Event ถัดไป":"ต้องออนไลน์เพื่อร่วม Event";
      countdown.textContent="เริ่มใน "+eventCountdown(schedule.nextStartMs-(Date.now()+mutationEventClockOffset));
    }
  }

  function mergeMutationEventState(remoteState){
    const remoteCards=Array.isArray(remoteState?.cards)?remoteState.cards:[];
    if(!remoteCards.length)return 0;

    const byGid=new Map();
    const byUid=new Map();
    state.cards.forEach(card=>{
      if(validCardGid(card.gid))byGid.set(card.gid,card);
      if(Number.isFinite(Number(card.uid)))byUid.set(Number(card.uid),card);
    });

    let changed=0;
    remoteCards.forEach(remoteCard=>{
      if(!remoteCard||typeof remoteCard!=="object")return;
      let local=null;
      if(validCardGid(remoteCard.gid))local=byGid.get(remoteCard.gid)||null;
      if(!local&&Number.isFinite(Number(remoteCard.uid)))local=byUid.get(Number(remoteCard.uid))||null;
      if(!local)return;

      const mutation=Number.isInteger(Number(remoteCard.mutation))&&Number(remoteCard.mutation)>=0&&Number(remoteCard.mutation)<MUTATIONS.length
        ? Number(remoteCard.mutation)
        : 0;
      const mutation2=Number.isInteger(Number(remoteCard.mutation2))&&Number(remoteCard.mutation2)>0&&Number(remoteCard.mutation2)<MUTATIONS.length&&Number(remoteCard.mutation2)!==mutation
        ? Number(remoteCard.mutation2)
        : 0;

      if(Number(local.mutation||0)!==mutation||Number(local.mutation2||0)!==mutation2){
        local.mutation=mutation;
        local.mutation2=mutation2;
        recordCardInIndex(local);
        changed++;
      }
    });

    if(changed)syncCardIndex();
    return changed;
  }

  async function tickMutationEvent(){
    if(mutationEventBusy||!gameToken||!supabaseClient)return;
    mutationEventBusy=true;
    try{
      const result=await rpc("cb_mutation_event_tick",{
        p_token:gameToken,
        p_client_session:mutationEventClientSession
      });
      if(!result.ok){
        if(result.error==="invalid_session")invalidateGameSession();
        return;
      }

      if(Number.isFinite(Number(result.server_now_ms))){
        mutationEventClockOffset=Number(result.server_now_ms)-Date.now();
      }
      mutationEventStatus=result;

      if(Number(result.hit_count)>0&&result.state){
        // Mutation Event must never replace the whole live state: doing so kills
        // Auto Roll / Full Auto / Auto Grade and can overwrite rolls performed
        // while the event RPC is in flight. Merge only the mutation fields.
        mergeMutationEventState(result.state);
        localStorage.setItem(SAVE_KEY,JSON.stringify(state));
        const hits=Array.isArray(result.hits)?result.hits:[];
        const names=hits.slice(0,3).map(hit=>{
          const m=MUTATIONS[Math.max(0,Math.min(MUTATIONS.length-1,Number(hit.mutation)||0))];
          return padId(Number(hit.charId)||0)+(Number(hit.slot)===2?" [SLOT 2] ":" ")+m.icon+" "+m.name;
        });
        toast("⚡ Mutation Event! "+result.hit_count+" ใบกลายพันธุ์"+(names.length?" · "+names.join(", "):""),true);
        renderAll();
        await publishPublicBase();
      }else{
        renderMutationEvent();
      }
    }finally{
      mutationEventBusy=false;
    }
  }

  async function heartbeatOnline(){
    if(!gameToken||!supabaseClient)return;
    await publishPublicBase();
    await tickMutationEvent();
    await refreshTrades(true);
  }

  function renderOnlineShell(){
    const gate=$("#onlineGate"),content=$("#onlineContent");
    if(!gate||!content)return;
    const signedIn=!!(gameToken&&gameAccount);
    gate.hidden=signedIn;
    content.hidden=!signedIn;
    if(!signedIn)return;
    $("#onlineBaseLevel").textContent="Lv."+state.baseLevel;
    const onlineTitle=$("#onlineTitle"),onlineName=$("#onlineDisplayName");
    onlineTitle.textContent=titleForLevel();
    onlineTitle.className=rankFxClass(state.baseLevel);
    onlineTitle.style.cssText=rankFxStyle(state.baseLevel);
    $("#onlineServerRank").textContent=onlineCache.myRank?"#"+onlineCache.myRank:"#—";
    if(onlineProfile){
      onlineName.value=onlineProfile.display_name||onlineProfile.username||"";
      onlineName.className="rank-name-input "+rankFxClass(state.baseLevel);
      onlineName.style.cssText=rankFxStyle(state.baseLevel);
      $("#onlinePlayerCode").textContent="#"+(onlineProfile.player_code||"—");
    }
  }

  function socialRow(profile,options={}){
    if(!profile)return '<div class="social-empty">ไม่พบข้อมูลผู้เล่น</div>';
    const accountId=profile.account_id;
    socialProfiles.set(accountId,profile);
    let actions='<button data-social-action="visit" data-user="'+accountId+'">ดูฐาน</button>';
    if(options.request){
      actions+='<button class="accept" data-social-action="accept" data-friend="'+options.request.friendship_id+'">รับเพื่อน</button>'+
               '<button class="remove" data-social-action="remove" data-friend="'+options.request.friendship_id+'">ปฏิเสธ</button>';
    }else if(options.friend){
      actions+='<button class="trade" data-social-action="trade" data-user="'+accountId+'">Trade</button>'+
               '<button class="remove" data-social-action="remove" data-friend="'+options.friend.friendship_id+'">ลบเพื่อน</button>';
    }else if(profile.friendship_status){
      actions+=profile.friendship_status==="accepted"
        ?'<button class="trade" data-social-action="trade" data-user="'+accountId+'">Trade</button><button disabled>เพื่อนแล้ว</button>'
        :'<button disabled>มีคำขออยู่</button>';
    }else{
      actions+='<button data-social-action="add" data-user="'+accountId+'">+ เพื่อน</button>';
    }
    const baseText=profile.base_level?"Base Lv."+profile.base_level:"ยังไม่เผยแพร่ฐาน";
    const lv=Number(profile.base_level)||1;
    const asc=Math.max(0,Math.floor(Number(profile.ascension)||ascensionFromTitle(profile.title)));
    const rankText=profile.server_rank?'<span class="player-rank-badge">#'+profile.server_rank+'</span>':'';
    const titleText=profile.title?'<span class="rank-title-badge '+rankFxClass(lv)+'" style="'+rankFxStyle(lv,asc)+'">'+escapeHtml(profile.title)+'</span>':'';
    return '<div class="player-row rank-row rank-stage-'+rankBand(lv)+'"><div class="player-main"><strong class="rank-name '+rankFxClass(lv)+'" style="'+rankFxStyle(lv,asc)+'">'+escapeHtml(profile.display_name)+rankText+'</strong>'+
      '<small>#'+escapeHtml(profile.player_code)+' · '+baseText+'</small>'+titleText+'</div>'+
      '<div class="player-actions">'+actions+'</div></div>';
  }

  function renderOnlineLists(){
    if(!gameAccount)return;
    const onlineEl=$("#onlinePlayersList"),requestsEl=$("#friendRequestsList"),friendsEl=$("#friendsList");
    if(!onlineEl||!requestsEl||!friendsEl)return;
    onlineEl.innerHTML=onlineCache.online.length?onlineCache.online.map(p=>socialRow(p)).join(""):'<div class="social-empty">ยังไม่มีผู้เล่นอื่นออนไลน์ในตอนนี้</div>';
    $("#requestCount").textContent=onlineCache.requests.length+" รายการ";
    requestsEl.innerHTML=onlineCache.requests.length?onlineCache.requests.map(r=>socialRow(r,{request:r})).join(""):'<div class="social-empty">ไม่มีคำขอใหม่</div>';
    $("#friendCount").textContent=onlineCache.friends.length+" คน";
    friendsEl.innerHTML=onlineCache.friends.length?onlineCache.friends.map(fr=>socialRow(fr,{friend:fr})).join(""):'<div class="social-empty">ยังไม่มีเพื่อน — ลองค้นหาผู้เล่นด้านบน</div>';
  }

  function leaderboardMiniShowcaseCard(card,rankNo){
    const tier=Math.max(0,Math.min(TIERS.length-1,Number(card.tier)||0));
    const grade=Math.max(0,Math.min(GRADES.length-1,Number(card.grade)||0));
    const visual={
      ...card,
      mutation:Math.max(0,Math.min(MUTATIONS.length-1,Number(card.mutation)||0)),
      mutation2:Math.max(0,Math.min(MUTATIONS.length-1,Number(card.mutation2)||0))
    };
    const t=TIERS[tier],g=GRADES[grade],muts=cardMutationIds(visual);
    const income=Math.max(0,Number(card.income)||0);
    const mutIcons=muts.map(id=>{
      const m=MUTATIONS[id];
      return '<i title="'+escapeHtml(m.name)+'" style="--show-mut:'+m.color+'">'+m.icon+'</i>';
    }).join("");
    return '<div class="leaderboard-card tier-'+tier+' grade-'+grade+'" style="--show-tier:'+t.color+';--show-grade:'+g.color+'" title="'+escapeHtml(padId(Number(card.charId)||0)+' · '+t.name+' · '+fmt(income)+'/s')+'">'+
      '<img src="'+imageFor(Number(card.charId)||CARD_MIN_ID)+'" alt="'+padId(Number(card.charId)||0)+'">'+
      '<span class="leaderboard-card-grade">'+escapeHtml(g.name)+'</span>'+
      (mutIcons?'<span class="leaderboard-card-mutations">'+mutIcons+'</span>':'')+
      '<span class="leaderboard-card-rank">#'+rankNo+'</span>'+
      '<div class="leaderboard-card-meta"><b>'+padId(Number(card.charId)||0)+'</b><small>'+fmt(income)+'/s</small></div>'+
    '</div>';
  }

  function leaderboardFeaturedShowcaseCard(card){
    if(!card)return "";
    const tier=Math.max(0,Math.min(TIERS.length-1,Number(card.tier)||0));
    const grade=Math.max(0,Math.min(GRADES.length-1,Number(card.grade)||0));
    const visual={
      ...card,
      mutation:Math.max(0,Math.min(MUTATIONS.length-1,Number(card.mutation)||0)),
      mutation2:Math.max(0,Math.min(MUTATIONS.length-1,Number(card.mutation2)||0))
    };
    const t=TIERS[tier],g=GRADES[grade],income=Math.max(0,Number(card.income)||0);
    const title=padId(Number(card.charId)||0)+" · "+t.name+" · Grade "+g.name+
      (cardMutationIds(visual).length?" · "+mutationNames(visual):"")+" · "+fmt(income)+"/s";
    return '<div class="leaderboard-featured-card tier-shell '+tierFxClass(tier)+' grade-shell-'+grade+cardMutationFxClass(visual)+'" '+
      'style="'+tierStyle(tier)+';'+cardMutationStyle(visual)+';--grade:'+g.color+';--show-tier:'+t.color+';--show-grade:'+g.color+'" '+
      'title="'+escapeHtml(title)+'">'+
      '<img src="'+imageFor(Number(card.charId)||CARD_MIN_ID)+'" alt="'+padId(Number(card.charId)||0)+'">'+
      '<div class="tier-ring"></div>'+
      '<div class="card-grade '+gradeFxClass(grade)+'" style="--grade:'+g.color+'">'+escapeHtml(g.name)+'</div>'+
      mutationBadge(visual)+
      '<span class="leaderboard-featured-crown">👑 BEST</span>'+
      '<div class="leaderboard-featured-meta tier-copy tier-'+tier+'" style="--tier:'+t.color+'">'+
        '<div class="leaderboard-featured-top"><b class="tier-card-id">'+padId(Number(card.charId)||0)+'</b><span class="tier-card-name">'+escapeHtml(t.name)+'</span></div>'+
        '<strong class="leaderboard-featured-income tier-card-income">'+fmt(income)+'/s</strong>'+
      '</div>'+
    '</div>';
  }

  function leaderboardCardShowcase(profile){
    const cards=(Array.isArray(profile?.top_cards)?profile.top_cards:[])
      .slice()
      .sort((a,b)=>(Number(b?.income)||0)-(Number(a?.income)||0))
      .slice(0,5);
    if(!cards.length){
      return '<div class="leaderboard-showcase empty"><span>ยังไม่มีการ์ดบนฐาน</span></div>';
    }
    const best=cards[0],others=cards.slice(1);
    return '<div class="leaderboard-showcase featured-layout" aria-label="Top 5 income cards">'+
      leaderboardFeaturedShowcaseCard(best)+
      '<div class="leaderboard-side-cards">'+others.map((card,index)=>leaderboardMiniShowcaseCard(card,index+2)).join("")+'</div>'+
    '</div>';
  }

  function leaderboardRow(profile){
    const accountId=profile.account_id;
    const isMe=!!gameAccount&&accountId===gameAccount.account_id;
    socialProfiles.set(accountId,profile);
    const rank=Number(profile.server_rank)||0;
    const medal=rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":"#"+rank;
    const asc=Math.max(0,Math.floor(Number(profile.ascension)||ascensionFromTitle(profile.title)));
    const rowClass="leaderboard-row"+(rank<=3?" top-"+rank:"")+(isMe?" me":"")+(asc?" ascension-rank ascension-rank-"+Math.min(10,asc):"");
    let actions='<button data-social-action="visit" data-user="'+accountId+'">ดูฐาน</button>';
    if(isMe){
      actions='<button disabled>คุณ</button>';
    }else if(profile.friendship_status){
      actions+=profile.friendship_status==="accepted"
        ?'<button data-social-action="trade" data-user="'+accountId+'">Trade</button><button disabled>เพื่อนแล้ว</button>'
        :'<button disabled>มีคำขออยู่</button>';
    }else{
      actions+='<button data-social-action="add" data-user="'+accountId+'">+ เพื่อน</button>';
    }
    const lv=Number(profile.base_level)||1;
    const income=Number(profile.base_income)||0;
    return '<div class="'+rowClass+' rank-row rank-stage-'+rankBand(lv)+'">'+
      '<div class="leaderboard-rank">'+medal+'</div>'+
      '<div class="leaderboard-player"><strong class="rank-name '+rankFxClass(lv)+'" style="'+rankFxStyle(lv,asc)+'">'+escapeHtml(profile.display_name)+'</strong>'+
        '<small><span>#'+escapeHtml(profile.player_code)+'</span><span>Base Lv.'+profile.base_level+'</span>'+(asc?'<span class="ascension-leader-chip">ASC '+romanNumeral(asc)+'</span>':'')+(profile.online?'<span>● Online</span>':'')+'</small>'+
        '<span class="rank-title-badge '+rankFxClass(lv)+'" style="'+rankFxStyle(lv,asc)+'">'+escapeHtml(profile.title||"Rookie Collector")+'</span>'+
      '</div>'+
      leaderboardCardShowcase(profile)+
      '<div class="leaderboard-stats"><b class="'+wealthClass(income)+'">'+fmt(income)+'/s</b><span>รายได้ฐาน</span></div>'+
      '<div class="leaderboard-actions">'+actions+'</div>'+
    '</div>';
  }

  function renderLeaderboard(){
    const wrap=$("#serverLeaderboard");
    if(!wrap)return;
    $("#leaderboardTotal").textContent=String(onlineCache.totalPlayers||0);
    $("#leaderboardMyRank").textContent=onlineCache.myRank?"#"+onlineCache.myRank:"#—";
    $("#onlineServerRank").textContent=onlineCache.myRank?"#"+onlineCache.myRank:"#—";
    wrap.innerHTML=onlineCache.leaders.length
      ? onlineCache.leaders.map(leaderboardRow).join("")
      : '<div class="social-empty">ยังไม่มีข้อมูลอันดับ</div>';
    wrap.querySelectorAll(".leaderboard-card img,.leaderboard-featured-card img").forEach(img=>img.addEventListener("error",e=>{
      e.currentTarget.style.opacity=".12";
    },{once:true}));
  }

  async function refreshOnline(){
    renderOnlineShell();
    if(!gameToken||!supabaseClient)return;
    await flushCloudSave();
    await publishPublicBase();
    const [socialResult,leaderResult,tradeResult]=await Promise.all([
      rpc("cb_social_snapshot",{p_token:gameToken}),
      rpc("cb_leaderboard",{p_token:gameToken,p_limit:50}),
      rpc("cb_trade_snapshot",{p_token:gameToken})
    ]);
    if(!socialResult.ok){
      if(socialResult.error==="invalid_session")invalidateGameSession();
      return;
    }
    if(!leaderResult.ok&&leaderResult.error==="invalid_session"){
      clearGameSession();
      return;
    }
    onlineCache={
      online:socialResult.online||[],
      requests:socialResult.requests||[],
      friends:socialResult.friends||[],
      leaders:leaderResult.ok?(leaderResult.leaders||[]):[],
      myRank:leaderResult.ok?(leaderResult.my_rank||null):null,
      totalPlayers:leaderResult.ok?(leaderResult.total_players||0):0
    };
    [...onlineCache.online,...onlineCache.requests,...onlineCache.friends,...onlineCache.leaders]
      .forEach(p=>socialProfiles.set(p.account_id,p));
    renderOnlineLists();
    renderLeaderboard();
    if(tradeResult.ok)applyTradeSnapshot(tradeResult);
    renderOnlineShell();
  }

  async function saveOnlineName(){
    if(!gameToken||!supabaseClient)return;
    const name=$("#onlineDisplayName").value.trim();
    if(name.length<2||name.length>20){toast("ชื่อผู้เล่นต้องยาว 2–20 ตัวอักษร");return}
    const result=await rpc("cb_update_profile",{p_token:gameToken,p_display_name:name});
    if(!result.ok){toast(result.message||"บันทึกชื่อไม่สำเร็จ");return}
    gameAccount={...gameAccount,...result};onlineProfile=result;
    socialProfiles.set(result.account_id,result);
    toast("เปลี่ยนชื่อเป็น "+name+" แล้ว");renderOnlineShell();await refreshOnline();
  }

  async function searchPlayers(){
    if(!gameToken||!supabaseClient)return;
    const q=$("#playerSearchInput").value.trim(),out=$("#playerSearchResults");
    if(!q){out.innerHTML="";return}
    const result=await rpc("cb_search_players",{p_token:gameToken,p_query:q});
    if(!result.ok){out.innerHTML='<div class="social-empty">ค้นหาไม่สำเร็จ</div>';return}
    const list=result.players||[];
    list.forEach(p=>socialProfiles.set(p.account_id,p));
    out.innerHTML=list.length?list.map(p=>socialRow(p)).join(""):'<div class="social-empty">ไม่พบผู้เล่น</div>';
  }

  async function sendFriendRequest(userId){
    if(!gameToken||!supabaseClient)return;
    const result=await rpc("cb_send_friend",{p_token:gameToken,p_target:userId});
    if(!result.ok){toast(result.message||"ส่งคำขอไม่สำเร็จ");return}
    toast("ส่งคำขอเป็นเพื่อนแล้ว");await refreshOnline();
  }

  async function acceptFriend(friendshipId){
    const result=await rpc("cb_accept_friend",{p_token:gameToken,p_friendship:friendshipId});
    if(!result.ok){toast("รับเพื่อนไม่สำเร็จ");return}
    toast("เป็นเพื่อนกันแล้ว 🎉");await refreshOnline();
  }

  async function removeFriend(friendshipId){
    const result=await rpc("cb_remove_friend",{p_token:gameToken,p_friendship:friendshipId});
    if(!result.ok){toast("ดำเนินการไม่สำเร็จ");return}
    toast("อัปเดตรายชื่อเพื่อนแล้ว");await refreshOnline();
  }

  function tradeCardPayload(card){
    return {
      gid:card.gid,
      charId:Number(card.charId),
      tier:Number(card.tier),
      grade:Number(card.grade),
      mutation:Number(card.mutation)||0,
      mutation2:Number(card.mutation2)||0,
      level:Number(card.level),
      awakening:awakeningStars(card)
    };
  }

  function cardIsTradeLocked(card){
    return !!card&&tradeLockedGids.has(card.gid);
  }

  function tradeCardEligible(card){
    return !!card&&!card.locked&&!state.placed.includes(card.uid)&&!cardIsTradeLocked(card)&&!(state.gradeAuto&&state.gradeAuto.uid===card.uid);
  }

  function tradeCardVisual(card,compact=false){
    if(!card)return '<div class="social-empty">ไม่มีข้อมูลการ์ด</div>';
    const tier=Math.max(0,Math.min(TIERS.length-1,Number(card.tier)||0));
    const grade=Math.max(0,Math.min(GRADES.length-1,Number(card.grade)||0));
    const mutation=Math.max(0,Math.min(MUTATIONS.length-1,Number(card.mutation)||0));
    const mutation2=Math.max(0,Math.min(MUTATIONS.length-1,Number(card.mutation2)||0));
    const visualCard={...card,mutation,mutation2};
    const t=TIERS[tier],g=GRADES[grade];
    return '<div class="trade-card-visual tier-shell tier-'+tier+' grade-shell-'+grade+(compact?' compact':'')+'" style="--tier:'+t.color+'">'+
      '<div class="trade-card-art '+tierFxClass(tier)+cardMutationFxClass(visualCard)+' grade-shell-'+grade+'" style="'+cardMutationStyle(visualCard)+'">'+
        '<img src="'+imageFor(card.charId)+'" alt="'+padId(card.charId)+'">'+
        '<div class="tier-ring"></div>'+
        '<span class="card-grade '+gradeFxClass(grade)+'" style="--grade:'+g.color+'">'+g.name+'</span>'+mutationBadge(visualCard)+awakeningBadge(visualCard)+
      '</div>'+
      '<div class="trade-card-meta tier-copy tier-'+tier+'" style="--tier:'+t.color+'">'+
        '<strong><span class="tier-card-id">'+padId(card.charId)+'</span><span class="tier-dot"> · </span><span class="tier-card-name">'+t.name+'</span></strong>'+
        '<span>Lv.'+Math.max(1,Number(card.level)||1)+' · Grade '+g.name+(cardMutationIds(visualCard).length?' · '+mutationNames(visualCard):'')+(awakeningStars(visualCard)?' · ★'+awakeningStars(visualCard):'')+'</span>'+
      '</div>'+
    '</div>';
  }

  function tradeErrorMessage(error){
    const map={
      friends_only:"Trade ได้เฉพาะเพื่อนเท่านั้น",
      invalid_card:"ข้อมูลการ์ดไม่ถูกต้อง",
      card_not_available:"การ์ดนี้ไม่พร้อม Trade แล้ว",
      card_already_offered:"การ์ดนี้อยู่ในข้อเสนอ Trade อื่นแล้ว",
      trade_unavailable:"ข้อเสนอนี้ไม่พร้อมใช้งานแล้ว",
      offered_card_unavailable:"การ์ดของผู้เสนอถูกเปลี่ยนไปแล้ว · ข้อเสนอถูกยกเลิก",
      invalid_session:"Session หมดอายุ กรุณาเข้าสู่ระบบใหม่"
    };
    return map[error]||"ทำ Trade ไม่สำเร็จ";
  }

  function tradeNotifiedStorageKey(){
    const account=gameAccount?.account_id||gameAccount?.username||"guest";
    return TRADE_NOTIFIED_KEY_PREFIX+String(account);
  }

  function loadNotifiedTradeIds(){
    try{
      const parsed=JSON.parse(localStorage.getItem(tradeNotifiedStorageKey())||"[]");
      return new Set(Array.isArray(parsed)?parsed.map(String):[]);
    }catch{
      return new Set();
    }
  }

  function rememberNotifiedTradeIds(ids){
    if(!ids.length)return;
    const seen=loadNotifiedTradeIds();
    ids.forEach(id=>seen.add(String(id)));
    try{localStorage.setItem(tradeNotifiedStorageKey(),JSON.stringify([...seen].slice(-120)))}catch{}
  }

  function updateTradeAttention(){
    const count=tradeCache.incoming.length;
    const badge=$("#tradeNavBadge");
    if(badge){
      badge.hidden=!count;
      badge.textContent=count>99?"99+":String(count);
    }
    const tab=document.querySelector('.tab[data-tab="online"]');
    if(tab)tab.classList.toggle("has-trade-alert",count>0);
    document.title=count?"("+count+") Trade · "+baseDocumentTitle:baseDocumentTitle;
  }

  function tradeNotificationBody(tr){
    const offered=tr?.offered_card||{};
    const who=tr?.display_name||"ผู้เล่น";
    const id=Number(offered.charId)||0;
    const name=id?cardName(id):"การ์ด";
    const tier=TIERS[Math.max(0,Math.min(TIERS.length-1,Number(offered.tier)||0))]?.name||"";
    return who+" เสนอ "+name+(id?" "+padId(id):"")+(tier?" · "+tier:"")+" ให้คุณ";
  }

  async function showTradeSystemNotification(tr){
    if(!tradeNotificationsEnabled()||tradeNotificationPermission()!=="granted")return;
    const options={
      body:tradeNotificationBody(tr),
      tag:"cardbase-trade-"+String(tr.id||Date.now()),
      renotify:true,
      data:{type:"trade",tradeId:String(tr.id||"")}
    };
    const registration=await ensureTradeNotificationRegistration();
    if(registration&&typeof registration.showNotification==="function"){
      try{await registration.showNotification("🔔 Card Base · ข้อเสนอ Trade ใหม่",options);return}catch{}
    }
    try{
      const notification=new Notification("🔔 Card Base · ข้อเสนอ Trade ใหม่",options);
      notification.onclick=()=>{window.focus();openTradeCenter();notification.close()};
    }catch{}
  }

  function openTradeCenter(){
    const tab=document.querySelector('.tab[data-tab="online"]');
    if(tab&&!tab.classList.contains("active"))tab.click();
    setTimeout(()=>{
      const center=document.querySelector(".trade-center");
      if(center)center.scrollIntoView({behavior:"smooth",block:"start"});
    },120);
  }

  function notifyNewIncomingTrades(trades){
    if(!trades.length)return;
    const count=trades.length;
    const first=trades[0];
    toast(
      count===1
        ?"🔔 "+tradeNotificationBody(first)
        :"🔔 มีข้อเสนอ Trade ใหม่ "+count+" รายการ",
      true
    );
    if(document.visibilityState==="hidden"&&navigator.vibrate){
      try{navigator.vibrate([140,70,140])}catch{}
    }
    trades.slice(0,3).forEach(tr=>{void showTradeSystemNotification(tr)});
  }

  function applyTradeSnapshot(result){
    if(!result||!result.ok)return;
    const incoming=Array.isArray(result.incoming)?result.incoming:[];
    const alreadyNotified=loadNotifiedTradeIds();
    const newIncoming=incoming.filter(tr=>tr?.id&&!alreadyNotified.has(String(tr.id)));

    tradeCache={
      incoming,
      outgoing:Array.isArray(result.outgoing)?result.outgoing:[],
      recent:Array.isArray(result.recent)?result.recent:[]
    };
    tradeLockedGids=new Set(tradeCache.outgoing.map(x=>x.offered_gid).filter(Boolean));
    renderTrades();
    renderCollection();
    updateTradeAttention();

    if(newIncoming.length){
      rememberNotifiedTradeIds(newIncoming.map(tr=>tr.id));
      notifyNewIncomingTrades(newIncoming);
    }
  }

  async function refreshTrades(silent=false){
    if(!gameToken||!supabaseClient)return;
    const result=await rpc("cb_trade_snapshot",{p_token:gameToken});
    if(!result.ok){
      if(!silent)toast(tradeErrorMessage(result.error));
      return;
    }
    applyTradeSnapshot(result);
  }

  function tradeRowCard(card){
    return tradeCardVisual(card,true);
  }

  function renderTrades(){
    const incoming=$("#tradeIncomingList"),outgoing=$("#tradeOutgoingList"),recent=$("#tradeRecentList");
    if(!incoming||!outgoing||!recent)return;

    $("#tradeIncomingCount").textContent=String(tradeCache.incoming.length);
    $("#tradeOutgoingCount").textContent=String(tradeCache.outgoing.length);

    incoming.innerHTML=tradeCache.incoming.length?tradeCache.incoming.map(tr=>
      '<div class="trade-row">'+
        '<div class="trade-person"><strong>'+escapeHtml(tr.display_name||"Player")+'</strong><small>#'+escapeHtml(tr.player_code||"—")+' เสนอให้คุณ</small></div>'+
        tradeRowCard(tr.offered_card)+
        '<div class="trade-row-actions">'+
          '<button class="primary" data-trade-action="accept-open" data-trade="'+tr.id+'">เลือกการ์ดแลก</button>'+
          '<button class="secondary" data-trade-action="decline" data-trade="'+tr.id+'">ปฏิเสธ</button>'+
        '</div>'+
      '</div>'
    ).join(""):'<div class="social-empty">ยังไม่มีข้อเสนอใหม่</div>';

    outgoing.innerHTML=tradeCache.outgoing.length?tradeCache.outgoing.map(tr=>
      '<div class="trade-row">'+
        '<div class="trade-person"><strong>ถึง '+escapeHtml(tr.display_name||"Player")+'</strong><small>กำลังรออีกฝ่ายตอบรับ</small></div>'+
        tradeRowCard(tr.offered_card)+
        '<div class="trade-row-actions"><button class="secondary" data-trade-action="cancel" data-trade="'+tr.id+'">ยกเลิกข้อเสนอ</button></div>'+
      '</div>'
    ).join(""):'<div class="social-empty">ยังไม่มีข้อเสนอที่ส่งอยู่</div>';

    recent.innerHTML=tradeCache.recent.length?tradeCache.recent.map(tr=>{
      const status=tr.status==="accepted"?"แลกสำเร็จ ✓":tr.status==="declined"?"ถูกปฏิเสธ":tr.status==="cancelled"?"ยกเลิกแล้ว":tr.status;
      return '<div class="trade-history-row '+escapeHtml(tr.status||"")+'">'+
        '<div><strong>'+escapeHtml(tr.display_name||"Player")+'</strong><small>'+status+'</small></div>'+
        (tr.status==="accepted"
          ?'<div class="trade-history-cards"><span>ส่ง</span>'+tradeRowCard(tr.sent_card)+'<b>↔</b><span>รับ</span>'+tradeRowCard(tr.received_card)+'</div>'
          :'')+
      '</div>';
    }).join(""):'<div class="social-empty">ยังไม่มีประวัติ Trade</div>';

    [incoming,outgoing,recent].forEach(w=>w.querySelectorAll("img").forEach(img=>img.addEventListener("error",e=>e.currentTarget.style.display="none")));
  }

  function openTradeOffer(userId){
    const profile=socialProfiles.get(userId);
    tradeModalState={mode:"offer",targetId:userId,tradeId:null,selectedGid:null};
    $("#tradeModalTitle").textContent="เสนอแลกการ์ด";
    $("#tradeModalSubtitle").textContent="ส่งข้อเสนอให้ "+(profile?profile.display_name:"เพื่อน");
    $("#tradeOfferedPreview").hidden=true;
    $("#tradePickerTitle").textContent="เลือกการ์ดที่จะเสนอ";
    renderTradePicker();
    $("#tradeModal").classList.add("show");
    $("#tradeModal").setAttribute("aria-hidden","false");
  }

  function openTradeAccept(tradeId){
    const tr=tradeCache.incoming.find(x=>x.id===tradeId);
    if(!tr){toast("ไม่พบข้อเสนอ Trade นี้");return}
    tradeModalState={mode:"accept",targetId:tr.other_account_id,tradeId,selectedGid:null};
    $("#tradeModalTitle").textContent="ตอบรับ Trade";
    $("#tradeModalSubtitle").textContent=(tr.display_name||"Player")+" เสนอการ์ดนี้ให้คุณ";
    const offered=$("#tradeOfferedPreview");
    offered.hidden=false;
    offered.innerHTML='<div><span class="eyebrow">YOU RECEIVE</span>'+tradeCardVisual(tr.offered_card)+'</div>';
    $("#tradePickerTitle").textContent="เลือกการ์ดที่คุณจะส่งกลับ";
    renderTradePicker();
    $("#tradeModal").classList.add("show");
    $("#tradeModal").setAttribute("aria-hidden","false");
  }

  function closeTrade(){
    $("#tradeModal").classList.remove("show");
    $("#tradeModal").setAttribute("aria-hidden","true");
    tradeModalState={mode:null,targetId:null,tradeId:null,selectedGid:null};
  }

  function renderTradePicker(){
    const wrap=$("#tradeCardPicker"),confirm=$("#tradeConfirmBtn"),label=$("#tradeSelectedLabel");
    if(!wrap||!confirm||!label)return;
    const cards=state.cards.filter(tradeCardEligible).sort((a,b)=>b.tier-a.tier||b.grade-a.grade||b.level-a.level);
    wrap.innerHTML=cards.length?cards.map(c=>
      '<button type="button" class="trade-pick '+(tradeModalState.selectedGid===c.gid?'selected':'')+'" data-trade-card="'+escapeHtml(c.gid)+'">'+tradeCardVisual(c)+'</button>'
    ).join(""):'<div class="social-empty">ไม่มีการ์ดที่พร้อม Trade · ถอดจากฐานและปลดล็อกก่อน</div>';
    const selected=state.cards.find(c=>c.gid===tradeModalState.selectedGid&&tradeCardEligible(c));
    label.textContent=selected?padId(selected.charId)+" · "+TIERS[selected.tier].name:"ยังไม่เลือก";
    confirm.disabled=!selected||tradeBusy;
    confirm.textContent=tradeBusy?"กำลังดำเนินการ…":tradeModalState.mode==="accept"?"ยืนยันแลกการ์ด":"ส่งข้อเสนอ Trade";
    wrap.querySelectorAll("img").forEach(img=>img.addEventListener("error",e=>e.currentTarget.style.display="none"));
  }

  async function confirmTrade(){
    if(tradeBusy)return;
    const card=state.cards.find(c=>c.gid===tradeModalState.selectedGid);
    if(!tradeCardEligible(card)){toast("เลือกการ์ดที่พร้อม Trade ก่อน");renderTradePicker();return}
    tradeBusy=true;renderTradePicker();
    try{
      const saved=await flushCloudSave();
      if(!saved||!saved.ok)return;
      let result;
      if(tradeModalState.mode==="offer"){
        result=await rpc("cb_trade_create",{
          p_token:gameToken,
          p_target:tradeModalState.targetId,
          p_card:tradeCardPayload(card)
        });
      }else if(tradeModalState.mode==="accept"){
        result=await rpc("cb_trade_accept",{
          p_token:gameToken,
          p_trade:tradeModalState.tradeId,
          p_card:tradeCardPayload(card)
        });
      }else return;

      if(!result.ok){toast(tradeErrorMessage(result.error));return}

      if(tradeModalState.mode==="accept"&&result.state){
        state=hydrateState(result.state);
        localStorage.setItem(SAVE_KEY,JSON.stringify(state));
        toast("Trade สำเร็จ! แลกการ์ดเรียบร้อย ✨",true);
        renderAll();
      }else{
        toast("ส่งข้อเสนอ Trade แล้ว 🔒");
      }
      closeTrade();
      await refreshTrades(true);
      await publishPublicBase();
    }finally{
      tradeBusy=false;
      if($("#tradeModal").classList.contains("show"))renderTradePicker();
    }
  }

  async function declineTrade(tradeId){
    const result=await rpc("cb_trade_decline",{p_token:gameToken,p_trade:tradeId});
    if(!result.ok){toast(tradeErrorMessage(result.error));return}
    toast("ปฏิเสธข้อเสนอแล้ว");await refreshTrades(true);
  }

  async function cancelTrade(tradeId){
    const result=await rpc("cb_trade_cancel",{p_token:gameToken,p_trade:tradeId});
    if(!result.ok){toast(tradeErrorMessage(result.error));return}
    toast("ยกเลิกข้อเสนอแล้ว · การ์ดปลดล็อก");await refreshTrades(true);
  }

  function renderVisitorIdentity(name,level,title=null,ascension=null){
    const lv=Math.max(1,Math.min(ASCENSION_LEVEL_CAP,Math.floor(Number(level)||1)));
    const asc=Math.max(0,Number.isFinite(Number(ascension))?Math.floor(Number(ascension)):ascensionFromTitle(title));
    const safeName=escapeHtml(name||"Player");
    const modal=$("#socialBaseModal");
    if(modal){
      for(let i=1;i<=10;i++)modal.classList.toggle("visitor-ascension-unlock-"+i,asc>=i);
      modal.dataset.ascension=String(asc);
    }
    const nameEl=$("#socialBaseName"),metaEl=$("#socialBaseMeta");
    nameEl.innerHTML=
      '<span class="visit-player-name '+rankFxClass(lv)+'" style="'+rankFxStyle(lv,asc)+'">'+safeName+'</span>'+
      '<span class="visit-base-suffix">’s Base</span>';
    if(title){
      metaEl.innerHTML=
        '<span class="visit-base-level">Base Lv.'+lv+'</span>'+
        '<span class="rank-title-badge visit-rank-badge '+rankFxClass(lv)+'" style="'+rankFxStyle(lv,asc)+'">'+escapeHtml(title)+'</span>'+
        (asc?'<span class="visitor-ascension-chip">ASCENSION '+romanNumeral(asc)+'</span>':'');
    }else{
      metaEl.textContent="กำลังโหลด…";
    }
  }

  function renderVisitorBaseFloor(){
    if(!visitorBaseView)return;
    const total=visitorBaseView.max;
    const bySlot=visitorBaseView.bySlot;
    const wrap=$("#socialBaseStands");
    const nav=$("#visitorFloorNav");
    const title=$("#visitorFloorTitle");
    const hint=$("#visitorFloorHint");
    if(!wrap||!nav)return;

    const maxOpenFloor=Math.max(0,Math.min(BASE_FLOOR_COUNT-1,Math.ceil(total/BASE_FLOOR_SIZE)-1));
    activeVisitorFloor=Math.max(0,Math.min(activeVisitorFloor,maxOpenFloor));

    nav.innerHTML="";
    for(let floor=0;floor<BASE_FLOOR_COUNT;floor++){
      const start=floor*BASE_FLOOR_SIZE;
      const unlocked=Math.max(0,Math.min(BASE_FLOOR_SIZE,total-start));
      let occupied=0;
      for(let i=start;i<start+unlocked;i++)if(bySlot.has(i))occupied++;

      const btn=document.createElement("button");
      btn.type="button";
      btn.className="base-floor-btn visitor-floor-btn"+(floor===activeVisitorFloor?" active":"")+(unlocked?"":" locked");
      btn.disabled=!unlocked;
      btn.setAttribute("aria-pressed",floor===activeVisitorFloor?"true":"false");
      btn.innerHTML=
        '<span class="base-floor-no">F'+(floor+1)+'</span>'+
        '<span class="base-floor-meta"><b>Floor '+(floor+1)+'</b><small>'+(start+1)+'–'+(start+BASE_FLOOR_SIZE)+' · '+(unlocked?occupied+'/'+unlocked+' ใบ':'LOCKED')+'</small></span>'+
        '<span class="base-floor-arrow">'+(floor===activeVisitorFloor?'◆':'›')+'</span>';
      if(unlocked)btn.addEventListener("click",()=>{
        if(activeVisitorFloor===floor)return;
        activeVisitorFloor=floor;
        renderVisitorBaseFloor();
      });
      nav.appendChild(btn);
    }

    const start=activeVisitorFloor*BASE_FLOOR_SIZE;
    const unlocked=Math.max(0,Math.min(BASE_FLOOR_SIZE,total-start));
    if(title)title.textContent="Floor "+(activeVisitorFloor+1)+" · Slots "+(start+1)+"–"+(start+BASE_FLOOR_SIZE);
    if(hint)hint.textContent=unlocked<BASE_FLOOR_SIZE
      ?"ปลดแล้ว "+unlocked+"/10 ช่องบนชั้นนี้ · เอฟเฟกต์ทำงานเฉพาะชั้นที่กำลังชม"
      :"10 ช่องบนชั้นนี้ · เอฟเฟกต์ Showcase ทำงานเฉพาะชั้นที่กำลังชม";

    let html="";
    for(let i=start;i<start+BASE_FLOOR_SIZE;i++){
      if(i>=total){
        html+='<div class="visitor-stand empty locked-floor-slot"><div class="empty-stand floor-locked"><b>◆</b><span>Slot '+(i+1)+'</span><small>LOCKED</small></div></div>';
        continue;
      }
      const c=bySlot.get(i);
      if(!c){
        html+='<div class="visitor-stand empty"><div class="visitor-empty-slot"><b>＋</b><span>Slot '+(i+1)+'</span><small>EMPTY</small></div></div>';
        continue;
      }
      const t=TIERS[c.tier]||TIERS[0],g=GRADES[c.grade]||GRADES[0];
      html+='<div class="visitor-stand visitor-showcase-stand tier-shell tier-'+c.tier+' grade-shell-'+c.grade+'" style="--tier:'+t.color+';'+cardMutationStyle(c)+'"><div class="visitor-card visitor-showcase-card '+tierFxClass(c.tier)+cardMutationFxClass(c)+'" data-awakening="'+awakeningStars(c)+'">'+
        '<img src="'+imageFor(c.charId)+'" alt="'+padId(c.charId)+'"><div class="tier-ring"></div>'+
        '<div class="stand-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div>'+mutationBadge(c)+awakeningBadge(c)+
        '<div class="visitor-meta tier-copy tier-'+c.tier+'" style="--tier:'+t.color+'"><b>'+
          '<span class="tier-card-id">'+padId(c.charId)+'</span><span class="tier-dot"> · </span><span class="tier-card-name">'+t.name+'</span></b>'+
          '<span class="tier-card-sub">Lv.'+c.level+(cardMutationIds(c).length?' · '+mutationNames(c):'')+' · <strong class="tier-card-income">'+fmt(c.income||0)+'/s</strong></span>'+
        '</div>'+
        '</div></div>';
    }
    wrap.innerHTML=html;
    wrap.querySelectorAll("img").forEach(img=>img.addEventListener("error",e=>e.currentTarget.style.display="none"));
  }

  async function visitPlayerBase(userId){
    if(!gameToken||!supabaseClient)return;
    const profile=socialProfiles.get(userId);
    renderVisitorIdentity(
      profile?profile.display_name:"Player",
      profile&&profile.base_level?profile.base_level:1,
      profile&&profile.title?profile.title:null
    );

    activeVisitorFloor=0;
    visitorBaseView=null;
    $("#socialBaseStands").innerHTML='<div class="social-empty">กำลังโหลดฐาน…</div>';
    $("#visitorFloorNav").innerHTML="";
    $("#visitorFloorTitle").textContent="Floor 1 · Slots 1–10";
    $("#visitorFloorHint").textContent="กำลังโหลดฐานของผู้เล่น…";
    $("#socialBaseModal").classList.add("show");
    $("#socialBaseModal").setAttribute("aria-hidden","false");

    const data=await rpc("cb_visit_base",{p_token:gameToken,p_target:userId});
    if(!data.ok||!data.base_level){
      $("#socialBaseMeta").textContent="ผู้เล่นคนนี้ยังไม่ได้เผยแพร่ฐาน";
      $("#socialBaseStands").innerHTML='<div class="social-empty">ยังไม่มีข้อมูลฐาน</div>';
      $("#visitorFloorHint").textContent="ไม่มีข้อมูลฐานให้แสดง";
      return;
    }

    renderVisitorIdentity(data.display_name||"Player",data.base_level,data.title||"Collector",data.ascension);
    const max=STANDS[Math.min(39,Math.max(0,data.base_level-1))]||30;
    const bySlot=new Map((Array.isArray(data.stands)?data.stands:[]).map(x=>[Number(x.slot),x]));
    visitorBaseView={max,bySlot};
    renderVisitorBaseFloor();
  }

  function closeSocialBase(){
    $("#socialBaseModal").classList.remove("show");
    $("#socialBaseModal").setAttribute("aria-hidden","true");
    visitorBaseView=null;
    activeVisitorFloor=0;
  }

  function toast(msg,found=false){
    const el=$("#toast");
    el.textContent=msg;
    el.classList.toggle("found",found);
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t=setTimeout(()=>{el.classList.remove("show","found")},2300);
  }

  function tierStyle(index){return "--tier:"+TIERS[index].color}

  function renderHeader(){
    const incomeValue=totalIncome();
    const moneyEl=$("#money"),incomeEl=$("#income"),titleEl=$("#baseTitle");
    moneyEl.textContent=fmt(state.money);
    moneyEl.className=wealthClass(state.money);
    incomeEl.textContent=fmt(incomeValue)+"/s";
    incomeEl.className=wealthClass(incomeValue);
    $("#baseLevel").textContent="Lv."+state.baseLevel;
    $("#luck").textContent="×"+effectiveLuckValue().toFixed(2);
    titleEl.textContent=titleForLevel();
    titleEl.className=rankFxClass(state.baseLevel)+" base-rank-title";
    titleEl.style.cssText=rankFxStyle(state.baseLevel);
    document.body.dataset.rankStage=String(rankBand(state.baseLevel));
    const asc=state.ascension?.stars||0;
    document.body.dataset.ascension=String(asc);
    for(let i=1;i<=10;i++)document.body.classList.toggle("ascension-unlock-"+i,asc>=i);
    document.body.style.cssText=rankFxStyle(state.baseLevel);
    $("#standCount").textContent=standLimit()+" แท่น";
    $("#incomeMulti").textContent="Income ×"+baseIncomeMultiplier().toFixed(2)+" · Core ×"+ascensionIncomeMultiplier().toFixed(2)+" · Wealth ×"+fmt(economyScale());
  }

  function renderBaseFloorNav(total=standLimit()){
    const nav=$("#baseFloorNav"),title=$("#baseFloorTitle"),hint=$("#baseFloorHint");
    if(!nav)return;
    const maxOpenFloor=Math.max(0,Math.min(BASE_FLOOR_COUNT-1,Math.ceil(total/BASE_FLOOR_SIZE)-1));
    activeBaseFloor=Math.max(0,Math.min(activeBaseFloor,maxOpenFloor));
    nav.innerHTML="";
    for(let floor=0;floor<BASE_FLOOR_COUNT;floor++){
      const start=floor*BASE_FLOOR_SIZE;
      const unlocked=Math.max(0,Math.min(BASE_FLOOR_SIZE,total-start));
      const occupied=state.placed.slice(start,start+unlocked).filter(Boolean).length;
      const btn=document.createElement("button");
      btn.type="button";
      btn.className="base-floor-btn"+(floor===activeBaseFloor?" active":"")+(unlocked?"":" locked");
      btn.disabled=!unlocked;
      btn.setAttribute("aria-pressed",floor===activeBaseFloor?"true":"false");
      btn.innerHTML=
        '<span class="base-floor-no">F'+(floor+1)+'</span>'+
        '<span class="base-floor-meta"><b>Floor '+(floor+1)+'</b><small>'+(start+1)+'–'+(start+BASE_FLOOR_SIZE)+' · '+(unlocked?occupied+'/'+unlocked+' วางแล้ว':'LOCKED')+'</small></span>'+
        '<span class="base-floor-arrow">'+(floor===activeBaseFloor?'◆':'›')+'</span>';
      if(unlocked)btn.addEventListener("click",()=>{
        if(activeBaseFloor===floor)return;
        activeBaseFloor=floor;
        renderBase();
      });
      nav.appendChild(btn);
    }
    const start=activeBaseFloor*BASE_FLOOR_SIZE;
    const unlocked=Math.max(0,Math.min(BASE_FLOOR_SIZE,total-start));
    if(title)title.textContent="Floor "+(activeBaseFloor+1)+" · Slots "+(start+1)+"–"+(start+BASE_FLOOR_SIZE);
    if(hint)hint.textContent=unlocked<BASE_FLOOR_SIZE
      ?"ปลดแล้ว "+unlocked+"/10 ช่องบนชั้นนี้ · ช่องที่เหลือจะเปิดตาม Base Level"
      :"แสดงเฉพาะชั้นนี้ 10 ใบ · เอฟเฟกต์ของชั้นอื่นจะไม่ถูกเรนเดอร์";
  }

  function renderBase(){
    normalizeSlots();
    const total=standLimit();
    const maxOpenFloor=Math.max(0,Math.min(BASE_FLOOR_COUNT-1,Math.ceil(total/BASE_FLOOR_SIZE)-1));
    activeBaseFloor=Math.max(0,Math.min(activeBaseFloor,maxOpenFloor));
    renderBaseFloorNav(total);

    const wrap=$("#stands"); wrap.innerHTML="";
    const floorStart=activeBaseFloor*BASE_FLOOR_SIZE;
    const floorEnd=floorStart+BASE_FLOOR_SIZE;

    for(let i=floorStart;i<floorEnd;i++){
      const unlocked=i<total;
      const uid=unlocked?state.placed[i]:null;
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      const slot=document.createElement("button");
      slot.type="button";
      slot.className="stand"+(!unlocked?" locked-floor-slot":c?" tier-shell tier-"+c.tier+" grade-shell-"+c.grade:" empty");
      slot.dataset.slot=i;
      if(c)slot.dataset.cardUid=c.uid;

      if(!unlocked){
        slot.disabled=true;
        slot.innerHTML='<div class="empty-stand floor-locked"><b>◆</b><span>Slot '+(i+1)+'</span><small>ปลดล็อกด้วย Base Level</small></div>';
      }else if(!c){
        slot.innerHTML='<div class="empty-stand"><b>＋</b><span>เลือกการ์ดจากคลัง</span></div>';
      }else{
        const t=TIERS[c.tier],g=GRADES[c.grade];
        slot.innerHTML=
          '<div class="mini-card '+tierFxClass(c.tier)+cardMutationFxClass(c)+' grade-shell-'+c.grade+'" data-awakening="'+awakeningStars(c)+'" style="'+tierStyle(c.tier)+';'+cardMutationStyle(c)+'">'+
            '<img src="'+imageFor(c.charId)+'" alt="Card '+padId(c.charId)+'">'+
            '<div class="tier-ring"></div>'+
            '<div class="card-grade base-card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div>'+mutationBadge(c)+awakeningBadge(c)+
            '<div class="mini-meta tier-copy tier-'+c.tier+'" style="--tier:'+t.color+'">'+
              '<div class="mini-meta-main"><span class="card-character-name" title="'+escapeHtml(cardName(c.charId))+'">'+escapeHtml(cardName(c.charId))+'</span><span class="tier-card-name">'+t.name+'</span></div>'+
              '<div class="mini-meta-sub"><span class="mini-id-level"><span class="tier-card-id">'+padId(c.charId)+'</span><span class="tier-dot"> · </span>Lv.<b data-stand-stat="level">'+c.level+'</b></span><strong data-stand-stat="income" class="tier-card-income">'+fmt(cardIncome(c))+'/s</strong></div>'+
            '</div>'+
          '</div>';
        const img=slot.querySelector("img"); if(img) img.addEventListener("error",e=>e.currentTarget.style.display="none");
      }
      if(unlocked)slot.addEventListener("click",()=>openStand(i));
      wrap.appendChild(slot);
    }
  }

  function chanceText(prob){
    const p=Math.max(0,Number(prob)||0)*100;
    if(p<0.001)return p.toFixed(5)+"%";
    if(p<0.01)return p.toFixed(4)+"%";
    if(p<0.1)return p.toFixed(3)+"%";
    if(p<1)return p.toFixed(2)+"%";
    return p.toFixed(1)+"%";
  }

  function renderOdds(){
    const odds=tierOdds();
    const qualityPct=Math.round(tierQualityProgress()*100);
    $("#luckTitle").textContent="Luck ×"+effectiveLuckValue().toFixed(2)+" · Mutation ×"+mutationLuckMultiplier().toFixed(2)+" · Pack Quality "+qualityPct+"% · ปลด Tier "+maxTierForLevel()+"/"+TIERS.length;
    $("#odds").innerHTML=TIERS.map((t,i)=>
      '<div class="odd" style="--tier:'+t.color+';opacity:'+(odds[i]>0?1:.28)+'"><span>'+t.name+'</span><b>'+chanceText(odds[i])+'</b></div>'
    ).join("");

    const gOdds=gradeOdds(),gradeWrap=$("#gradeOdds");
    if(gradeWrap)gradeWrap.innerHTML=GRADES.map((g,i)=>
      '<div class="odd grade-odd" style="--tier:'+g.color+'"><span>'+g.name+' <small>×'+g.multi.toFixed(2)+'</small></span><b>'+chanceText(gOdds[i])+'</b></div>'
    ).join("");

    const mOdds=mutationOdds(),mutationWrap=$("#mutationOdds");
    if(mutationWrap)mutationWrap.innerHTML=MUTATION_DISPLAY_ORDER.map(i=>{
      const m=MUTATIONS[i];
      const eventRate=i?chanceText(MUTATION_EVENT_WEIGHTS[i]/100):"—";
      return '<div class="odd mutation-odd '+(i===0?'normal':'')+'" style="--tier:'+m.color+'"><span>'+m.icon+' '+m.name+
        ' <small>Income ×'+m.income.toFixed(2)+' · Luck ×'+m.luck.toFixed(2)+' · Event '+eventRate+'</small></span><b>'+chanceText(mOdds[i])+'</b></div>';
    }).join("");
    const mutationSummary=$("#mutationLuckSummary");
    if(mutationSummary)mutationSummary.textContent="Luck จากการ์ดบนฐาน ×"+mutationLuckMultiplier().toFixed(2)+" · Soft cap";
  }

  function renderFilters(){
    const max=maxTierForLevel();
    state.autoTargets=state.autoTargets.filter(i=>i<max);
    $("#tierFilters").innerHTML=TIERS.map((t,i)=>{
      const locked=i>=max,checked=state.autoTargets.includes(i);
      return '<label class="tier-check '+(locked?'locked':'')+'" style="--tier:'+t.color+'">'+
        '<input type="checkbox" data-tier="'+i+'" '+(checked?'checked ':'')+(locked?'disabled ':'')+'>'+
        '<span>'+t.name+(locked?' · Locked':'')+'</span></label>';
    }).join("");
    $("#autoBtn").classList.toggle("on",state.autoRolling);
    $("#autoBtn").textContent=state.autoRolling?"หยุด Auto":"Auto · หยุดเมื่อเจอ";
    $("#fullAutoBtn").classList.toggle("on",state.fullAuto);
    $("#fullAutoBtn").textContent=state.fullAuto?"หยุด Full Auto":"Full Auto";
    const active=state.autoRolling||state.fullAuto;
    $("#autoStatus").className="auto-status"+(active?" on":"");
    $("#autoStatus").textContent=state.fullAuto
      ?"Full Auto · เก็บซองเป้าหมายแล้วสุ่มต่อ: "+state.autoTargets.map(i=>TIERS[i].name).join(", ")
      :state.autoRolling
        ?"Auto · หยุดเมื่อเจอ: "+state.autoTargets.map(i=>TIERS[i].name).join(", ")
        :"Auto Roll ปิดอยู่";
  }

  function renderPack(){
    const p=state.currentPack,card=$("#packCard");
    if(!p){
      card.className="pack-card empty";
      card.style.removeProperty("--pack");
      $("#packTier").textContent="NO PACK";
      $("#packHint").textContent=state.fullAuto?"Full Auto กำลังสุ่มและเก็บซองเป้าหมาย…":state.autoRolling?"Auto Roll กำลังทำงาน…":"กดสุ่มซองก่อน";
      return;
    }
    const t=TIERS[p.tier];
    card.className="pack-card sparkle "+tierFxClass(p.tier)+(state.targetFound?" found":"");
    card.style.setProperty("--pack",t.color);
    $("#packTier").textContent=t.name.toUpperCase();
    $("#packHint").textContent="คลิกเพื่อเปิด · การ์ดด้านในเป็น "+t.name+" แน่นอน";
  }

  function renderStoredPacks(){
    const count=state.storedPacks.length;
    $("#storedPackCount").textContent=count+" ซอง";
    const wrap=$("#storedPacks");
    if(!count){
      wrap.innerHTML='<div class="social-empty">ยังไม่มีซองที่เก็บไว้</div>';
      return;
    }
    const groups=new Map();
    state.storedPacks.forEach(p=>groups.set(p.tier,(groups.get(p.tier)||0)+1));
    wrap.innerHTML=[...groups.entries()].sort((a,b)=>b[0]-a[0]).map(([tier,n])=>{
      const t=TIERS[tier];
      return '<div class="stored-pack-row tier-shell tier-'+tier+'" style="--tier:'+t.color+'">'+
        '<div class="stored-pack-main"><strong>'+t.name+'</strong><span>'+n+' ซอง</span></div>'+
        '<button data-open-stored-tier="'+tier+'">เปิด 1 ซอง</button></div>';
    }).join("");
  }

  function storePack(tier,obtainedAt=Date.now()){
    state.storedPacks.push({uid:state.packUidCounter++,tier,obtainedAt});
  }

  function openStoredPack(tier){
    const idx=state.storedPacks.findIndex(p=>p.tier===tier);
    if(idx<0)return;
    const [pack]=state.storedPacks.splice(idx,1);
    if(pack?.giftKey){
      if(!state.serverGiftClaims||typeof state.serverGiftClaims!=="object")state.serverGiftClaims={};
      const old=state.serverGiftClaims[pack.giftKey]||{};
      state.serverGiftClaims[pack.giftKey]={...old,packUsed:true};
    }
    const card=createCardFromTier(pack.tier);
    showReveal(card);
    renderAll();
  }

  function createCardFromTier(tier,minId=CARD_MIN_ID,maxId=CARD_MAX_ID){
    const low=Math.max(CARD_MIN_ID,Math.min(CARD_MAX_ID,Math.floor(Number(minId)||CARD_MIN_ID)));
    const high=Math.max(low,Math.min(CARD_MAX_ID,Math.floor(Number(maxId)||CARD_MAX_ID)));
    const charId=low+Math.floor(Math.random()*(high-low+1));
    const card={uid:state.uidCounter++,gid:makeCardGid(),charId,tier,grade:0,mutation:randomMutation(),mutation2:0,level:1,awakening:0,locked:false,obtainedAt:Date.now()};
    state.cards.push(card);
    recordCardInIndex(card,card.obtainedAt);
    return card;
  }

  function renderItemBag(){
    const count=Math.max(0,Math.floor(Number(state.items?.level100Ticket)||0));
    const countEl=$("#level100TicketCount"),status=$("#level100TicketStatus");
    if(countEl)countEl.textContent="×"+count;
    if(status){
      status.textContent=count?"พร้อมใช้ "+count+" ใบ":"ไม่มีไอเท็ม";
      status.classList.toggle("active",count>0);
    }
  }

  function markOneServerGiftTicketUsed(){
    if(!state.serverGiftClaims||typeof state.serverGiftClaims!=="object")state.serverGiftClaims={};
    const key=Object.keys(state.serverGiftClaims).find(k=>state.serverGiftClaims[k]?.ticketUsed!==true);
    if(!key)return;
    const old=state.serverGiftClaims[key]||{};
    state.serverGiftClaims[key]={...old,ticketUsed:true};
  }

  function useLevel100Ticket(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    if(cardIsTradeLocked(c)){toast("การ์ดนี้ถูกล็อกไว้ใน Trade");return}
    const tickets=Math.max(0,Math.floor(Number(state.items?.level100Ticket)||0));
    if(!tickets){toast("ไม่มี Lv.100 Ticket");return}
    if(Number(c.level)>=100){toast("การ์ดใบนี้ Lv.100 ขึ้นไปแล้ว");return}
    const ok=window.confirm(
      "ใช้ ⚡ Lv.100 Ticket กับ "+padId(c.charId)+" ?"+
      "\nLv."+c.level+" → Lv.100 ทันที"+
      "\n\nGrade / Mutation / Awakening จะไม่เปลี่ยน และ Ticket จะถูกใช้ 1 ใบ"
    );
    if(!ok)return;
    state.items.level100Ticket=tickets-1;
    markOneServerGiftTicketUsed();
    c.level=100;
    toast("⚡ "+padId(c.charId)+" ขึ้นเป็น Lv.100 แล้ว!",true);
    renderItemBag();
    commitCardMicroUpdate(c.uid);
    renderCollection();
    if(activeStand!==null&&state.placed[activeStand]===c.uid)renderStandModal();
  }

  function renderCollection(){
    renderItemBag();
    const q=$("#searchId").value.trim(),mode=$("#sortCards").value;
    let arr=[...state.cards];
    if(q){
      const needle=q.toLowerCase();
      arr=arr.filter(c=>String(c.charId).includes(q)||padId(c.charId).toLowerCase().includes(needle)||cardName(c.charId).toLowerCase().includes(needle));
    }
    arr.sort((a,b)=>{
      if(mode==="tier")return b.tier-a.tier||b.level-a.level;
      if(mode==="level")return b.level-a.level||b.tier-a.tier;
      if(mode==="new")return b.uid-a.uid;
      return cardIncome(b)-cardIncome(a);
    });
    const wrap=$("#collection"); wrap.innerHTML="";
    $("#emptyCollection").style.display=arr.length?"none":"block";
    arr.forEach(c=>{
      const t=TIERS[c.tier],g=GRADES[c.grade],placed=state.placed.includes(c.uid),tradeLocked=cardIsTradeLocked(c);
      const el=document.createElement("article"); el.className="card-item tier-shell tier-"+c.tier+" grade-shell-"+c.grade+(tradeLocked?" trade-locked":""); el.dataset.cardUid=c.uid;
      el.innerHTML=
        '<div class="card-art '+tierFxClass(c.tier)+cardMutationFxClass(c)+' grade-shell-'+c.grade+'" data-awakening="'+awakeningStars(c)+'" style="'+tierStyle(c.tier)+';'+cardMutationStyle(c)+'">'+
          '<img src="'+imageFor(c.charId)+'" alt="'+escapeHtml(cardName(c.charId))+' '+padId(c.charId)+'"><div class="tier-ring"></div>'+
          '<div class="card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div>'+mutationBadge(c)+awakeningBadge(c)+
          '<div class="card-face-meta tier-copy tier-'+c.tier+'" style="--tier:'+t.color+'">'+
            '<div class="card-face-meta-row card-face-meta-top"><span class="card-character-name" title="'+escapeHtml(cardName(c.charId))+'">'+escapeHtml(cardName(c.charId))+'</span><span class="tier-card-name">'+t.name+'</span></div>'+
            '<div class="card-face-meta-row card-face-meta-bottom"><span class="card-id-level"><span class="tier-card-id">'+padId(c.charId)+'</span><span class="tier-dot"> · </span>Lv.<b data-card-face-stat="level">'+c.level+'</b></span><strong data-card-face-stat="income" class="tier-card-income">'+fmt(cardIncome(c))+'/s</strong></div>'+
          '</div>'+
        '</div>'+
        '<div class="card-body"><div class="card-stats">'+
          '<div><span>Level</span><b data-card-stat="level">'+c.level+'</b></div><div><span>รายได้</span><b data-card-stat="income" class="tier-card-income tier-copy tier-'+c.tier+'" style="--tier:'+t.color+'">'+fmt(cardIncome(c))+'/s</b></div>'+
          '<div><span>ID Income Bonus</span><b>'+charIncomeBonusText(c.charId)+'</b></div>'+
          '<div><span>อัป Lv.</span><b data-card-stat="upgrade">'+fmt(upgradeCost(c))+'</b></div><div><span>สุ่ม Grade</span><b data-card-stat="grade-cost">'+fmt(rerollCost(c))+'</b></div>'+
          '<div><span>Mutation</span><b class="mutation-stat">'+escapeHtml(mutationNames(c))+' · '+cardMutationIds(c).length+'/2</b></div><div><span>Mutation Multi</span><b>Income ×'+mutationIncomeMultiplier(c).toFixed(2)+' · Luck +'+mutationLuckRawBonus(c).toFixed(2)+'</b></div>'+
          '<div><span>Grade → Mutation</span><b data-card-stat="mutation-grade">'+mutationGradeBenefitText(c)+'</b></div>'+
          '<div><span>Awaken</span><b>★'+awakeningStars(c)+' · ×'+awakeningMultiplier(c).toFixed(2)+' · Next Lv.'+awakeningRequiredLevel(c)+'</b></div>'+
        '</div>'+(tradeLocked?'<div class="trade-lock-banner">🔒 TRADE LOCK · รออีกฝ่ายตอบรับ</div>':'')+'<div class="card-actions">'+
          '<button data-a="place" '+(tradeLocked?"disabled":"")+'>'+(placed?"เอาออกจากฐาน":"วางในแท่นว่าง")+'</button><button data-a="level" '+(tradeLocked?"disabled":"")+'>อัป Level</button>'+
          '<button class="level100-ticket-btn" data-a="level100-ticket" '+(tradeLocked||c.level>=100||!(state.items?.level100Ticket>0)?"disabled":"")+'>⚡ Lv.100 Ticket'+(state.items?.level100Ticket>0?" ×"+state.items.level100Ticket:"")+'</button>'+
          '<button data-a="grade" '+(tradeLocked?"disabled":"")+'>สุ่ม Grade</button><button class="'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"grade-running":"")+'" data-a="grade-auto" '+(tradeLocked?"disabled":"")+'>'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"Auto Grade…":"Auto Grade")+'</button>'+          '<button class="mutation-inherit-btn" data-a="mutation-lab" '+(tradeLocked||cardMutationIds(c).length>=2?"disabled":"")+'>🧬 '+(cardMutationIds(c).length>=2?"Mutation เต็ม":"สืบทอด")+'</button>'+          '<button class="mutation-cleanse-btn" data-a="mutation-cleanse" '+(tradeLocked||!cardMutationIds(c).length?"disabled":"")+'>🧹 ล้าง Mutation</button>'+
          '<button class="awaken-action" data-a="awaken" '+(tradeLocked||!canAwaken(c)?"disabled":"")+'>✦ Awaken ★'+(awakeningStars(c)+1)+'</button>'+

          '<button class="'+(c.locked?"locked":"")+'" data-a="lock" '+(tradeLocked?"disabled":"")+'>'+(c.locked?"🔒 ปลดล็อก":"🔓 ล็อก")+'</button>'+
          '<button class="sell" data-a="sell" '+((placed||c.locked||tradeLocked)?"disabled":"")+'>ขาย '+fmt(sellValue(c))+'</button>'+
        '</div></div>';
      const img=el.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
      el.addEventListener("click",ev=>{
        const btn=ev.target.closest("button[data-a]");if(!btn)return;
        const a=btn.dataset.a;
        if(a==="place")togglePlace(c.uid);
        if(a==="level")levelUp(c.uid);
        if(a==="level100-ticket")useLevel100Ticket(c.uid);
        if(a==="grade")rerollGrade(c.uid);
        if(a==="grade-auto")openGradeAuto(c.uid);
        if(a==="mutation-lab")openMutationLab(c.uid);
        if(a==="mutation-cleanse")openMutationCleanse(c.uid);
        if(a==="awaken")awakenCard(c.uid);
        if(a==="lock")toggleLock(c.uid);
        if(a==="sell")sellCard(c.uid);
      });
      wrap.appendChild(el);
    });
  }

  function renderCardIndex(){
    const wrap=$("#cardIndexGrid");if(!wrap)return;
    syncCardIndex();
    const query=($("#indexSearch")?.value||"").trim();
    const filter=$("#indexFilter")?.value||"all";
    const ownedByChar=new Map();
    state.cards.forEach(c=>{
      if(!ownedByChar.has(c.charId))ownedByChar.set(c.charId,[]);
      ownedByChar.get(c.charId).push(c);
    });

    const discoveredIds=Object.keys(state.cardIndex).map(Number).filter(id=>id>=CARD_MIN_ID&&id<=CARD_MAX_ID);
    const charFound=discoveredIds.length;
    const variantFound=discoveredIds.reduce((sum,id)=>sum+(state.cardIndex[id]?.tiers?.length||0),0);
    const mutationFound=discoveredIds.reduce((sum,id)=>sum+(state.cardIndex[id]?.mutations?.length||0),0);
    const totalChars=CARD_MAX_ID-CARD_MIN_ID+1,totalVariants=totalChars*TIERS.length,totalMutationVariants=totalChars*(MUTATIONS.length-1);
    $("#indexCharacterCount").textContent=charFound+"/"+totalChars;
    $("#indexVariantCount").textContent=variantFound+"/"+totalVariants;
    const mutationCount=$("#indexMutationCount");if(mutationCount)mutationCount.textContent=mutationFound+"/"+totalMutationVariants;
    $("#indexCompletion").textContent=(charFound/totalChars*100).toFixed(charFound===totalChars?0:1)+"%";
    $("#indexVariantCompletion").textContent=(variantFound/totalVariants*100).toFixed(1)+"%";
    const mutationCompletion=$("#indexMutationCompletion");if(mutationCompletion)mutationCompletion.textContent=(mutationFound/totalMutationVariants*100).toFixed(1)+"%";
    $("#indexProgressFill").style.width=(charFound/totalChars*100)+"%";
    $("#indexVariantFill").style.width=(variantFound/totalVariants*100)+"%";
    const mutationFill=$("#indexMutationFill");if(mutationFill)mutationFill.style.width=(mutationFound/totalMutationVariants*100)+"%";

    let ids=Array.from({length:totalChars},(_,i)=>CARD_MIN_ID+i);
    if(query){
      const needle=query.toLowerCase();
      ids=ids.filter(id=>String(id).includes(query)||padId(id).toLowerCase().includes(needle)||cardName(id).toLowerCase().includes(needle));
    }
    if(filter==="found")ids=ids.filter(id=>!!state.cardIndex[id]);
    if(filter==="missing")ids=ids.filter(id=>!state.cardIndex[id]);
    if(filter==="complete")ids=ids.filter(id=>(state.cardIndex[id]?.tiers?.length||0)===TIERS.length);
    if(filter==="mutated")ids=ids.filter(id=>(state.cardIndex[id]?.mutations?.length||0)>0);
    if(filter==="owned")ids=ids.filter(id=>(ownedByChar.get(id)||[]).length>0);

    wrap.innerHTML=ids.map(id=>{
      const entry=state.cardIndex[id],owned=ownedByChar.get(id)||[];
      if(!entry){
        return '<article class="index-card locked">'+
          '<div class="index-lock-art"><span>?</span></div>'+
          '<div class="index-card-body"><strong class="index-character-name" title="'+escapeHtml(cardName(id))+'">'+escapeHtml(cardName(id))+'</strong><div class="index-id-only">'+padId(id)+'</div><small>ยังไม่ค้นพบ</small>'+
          '<div class="index-tier-strip">'+TIERS.map((t,i)=>'<i title="'+t.name+'" style="--tier:'+t.color+'"></i>').join("")+'</div>'+
          '<div class="index-mutation-strip">'+MUTATIONS.slice(1).map(m=>'<i title="'+m.name+'" style="--mutation:'+m.color+'"></i>').join("")+'</div></div>'+
        '</article>';
      }
      const tiers=Array.isArray(entry.tiers)?entry.tiers:[];
      const mutations=Array.isArray(entry.mutations)?entry.mutations:[];
      const highestTier=tiers.length?Math.max(...tiers):0;
      const bestGrade=GRADES[Math.max(0,Math.min(GRADES.length-1,entry.bestGrade||0))];
      const t=TIERS[highestTier];
      return '<article class="index-card found tier-shell tier-'+highestTier+'" style="--tier:'+t.color+'">'+
        '<div class="index-art">'+
          '<img src="'+imageFor(id)+'" alt="'+padId(id)+'">'+
          '<div class="tier-ring"></div>'+
          '<span class="index-best-grade '+gradeFxClass(entry.bestGrade||0)+'" style="--grade:'+bestGrade.color+'">'+bestGrade.name+'</span>'+
          '<span class="index-owned">'+owned.length+' ใบ</span>'+
        '</div>'+
        '<div class="index-card-body">'+
          '<div class="index-character-name" title="'+escapeHtml(cardName(id))+'">'+escapeHtml(cardName(id))+'</div>'+
          '<div class="index-id-row"><strong>'+padId(id)+'</strong><span class="tier-label tier-'+highestTier+'" style="color:'+t.color+'">'+t.name+'</span></div>'+
          '<small>Variants '+tiers.length+'/'+TIERS.length+' · Mutations '+mutations.length+'/'+(MUTATIONS.length-1)+' · Best Grade '+bestGrade.name+'</small>'+
          '<div class="index-tier-strip">'+TIERS.map((tier,i)=>'<i class="'+(tiers.includes(i)?'on':'')+'" title="'+tier.name+'" style="--tier:'+tier.color+'"></i>').join("")+'</div>'+
          '<div class="index-mutation-strip">'+MUTATIONS.slice(1).map((m,i)=>'<i class="'+(mutations.includes(i+1)?'on':'')+'" title="'+m.name+'" style="--mutation:'+m.color+'"></i>').join("")+'</div>'+
        '</div>'+
      '</article>';
    }).join("")||'<div class="empty-state index-empty">ไม่มีรายการตามตัวกรองนี้</div>';

    wrap.querySelectorAll("img").forEach(img=>img.addEventListener("error",e=>e.currentTarget.style.display="none"));
  }

  function renderRebirth(){
    const capped=state.baseLevel>=ASCENSION_LEVEL_CAP;
    if(capped){
      $("#rebirthHeadline").textContent="Lv.40 · ASCENSION READY";
      $("#rebirthHeadline").className=rankFxClass(40);
      $("#rebirthHeadline").style.cssText=rankFxStyle(40);
      $("#rebirthMoney").textContent="—";
      $("#rebirthMoney").className="";
      $("#rebirthRule").textContent="ถึง Base Lv.40 แล้ว · จุติเพื่อเริ่มรอบใหม่";
      $("#rebirthTierGain").textContent="รับ Ascension "+romanNumeral((state.ascension?.stars||0)+1)+" · Core +1 · Permanent Buff";
      const pace=$("#rebirthPace");if(pace)pace.textContent="READY";
      $("#rebirthBtn").disabled=true;
      $("#rebirthBtn").textContent="ไปที่ ASCENSION ด้านล่าง";
      $("#nextTitle").textContent=titleForLevel(1,(state.ascension?.stars||0)+1);
      $("#nextTitle").className=rankFxClass(1);
      $("#nextTitle").style.cssText=rankFxStyle(1);
      $("#nextStands").textContent=standLimit(1);
      $("#nextIncome").textContent="Ascend ×"+(1+((state.ascension?.stars||0)+1)*0.20).toFixed(2);
      $("#nextLuck").textContent="Ascend ×"+(1+((state.ascension?.stars||0)+1)*0.02).toFixed(2);
      $("#nextTier").textContent=TIERS[maxTierForLevel(1)-1].name;
      renderEndgame();
      return;
    }

    const next=state.baseLevel+1,cost=rebirthCost();
    const currentMax=maxTierForLevel(state.baseLevel);
    const nextMax=maxTierForLevel(next);
    const newlyUnlocked=nextMax>currentMax;
    const currentOdds=tierOdds(state.baseLevel);
    const nextOdds=tierOdds(next);
    const focusTier=nextMax-1;

    $("#rebirthBtn").textContent="Rebirth / อัปฐาน";
    $("#rebirthHeadline").textContent="Lv."+state.baseLevel+" → Lv."+next;
    $("#rebirthHeadline").className=rankFxClass(next);
    $("#rebirthHeadline").style.cssText=rankFxStyle(next);
    $("#rebirthMoney").textContent=fmt(cost);
    $("#rebirthMoney").className=wealthClass(cost);
    $("#rebirthRule").textContent="ใช้เงินอย่างเดียว · ถึง Lv.40 จะเปิด Ascension";
    const currentLow=currentOdds.slice(0,3).reduce((a,b)=>a+b,0)*100;
    const nextLow=nextOdds.slice(0,3).reduce((a,b)=>a+b,0)*100;
    $("#rebirthTierGain").textContent=newlyUnlocked
      ?"ปลด "+TIERS[focusTier].name+" · "+(nextOdds[focusTier]*100).toFixed(nextOdds[focusTier]*100<0.1?3:2)+"% · Low Tier "+currentLow.toFixed(1)+"% → "+nextLow.toFixed(1)+"%"
      :"Low Tier "+currentLow.toFixed(1)+"% → "+nextLow.toFixed(1)+"% · "+TIERS[focusTier].name+" "+(currentOdds[focusTier]*100).toFixed(3)+"% → "+(nextOdds[focusTier]*100).toFixed(3)+"%";
    const pace=$("#rebirthPace");if(pace)pace.textContent="~"+formatDuration(rebirthTargetSeconds());
    $("#rebirthBtn").disabled=state.money<cost;
    $("#nextTitle").textContent=titleForLevel(next);
    $("#nextTitle").className=rankFxClass(next);
    $("#nextTitle").style.cssText=rankFxStyle(next);
    $("#nextStands").textContent=standLimit(next);
    $("#nextIncome").textContent="×"+baseIncomeMultiplier(next).toFixed(2);
    $("#nextLuck").textContent="×"+effectiveLuckValue(next).toFixed(2);
    $("#nextTier").textContent=TIERS[nextMax-1].name;
    renderEndgame();
  }
  function nextAscensionLevel(){return ASCENSION_LEVEL_CAP}
  function ascensionProgress(){
    return Math.max(0,Math.min(1,state.baseLevel/ASCENSION_LEVEL_CAP));
  }
  function claimAscension(){
    if(state.baseLevel<ASCENSION_LEVEL_CAP){toast("ต้องถึง Base Lv."+ASCENSION_LEVEL_CAP+" ก่อน");return}
    const next=(state.ascension?.stars||0)+1;
    const reward=ASCENSION_REWARDS[Math.min(9,next-1)];
    const ok=window.confirm(
      "ASCEND "+romanNumeral(next)+" ?\n"+
      "Base Lv.40 → Lv.1 และเงินจะรีเซ็ต\n"+
      "การ์ด / Grade / Mutation / Awakening / Collection อยู่ครบ\n"+
      "ได้รับ Core +1 · Income +20% · Luck +2% ถาวร"+
      (next<=10?"\nSpecial: "+reward.name:"")
    );
    if(!ok)return;

    if(idPackAutoIndex!==null)stopIdPackAuto("Auto ID Pack หยุดเพราะ Ascension");
    clearTimeout(gradeTimer);
    state.gradeAuto=null;
    state.autoRolling=false;
    state.fullAuto=false;
    state.targetFound=false;
    state.currentPack=null;
    state.rollingUntil=0;
    setPackAutoSession(false);

    state.ascension.stars=next;
    state.ascension.cores++;
    state.money=0;
    state.baseLevel=1;
    state.lastTick=Date.now();
    activeBaseFloor=0;
    normalizeSlots();

    toast("ASCENSION "+romanNumeral(next)+" สำเร็จ! · "+(next<=10?reward.name+" · ":"")+"Core +1 ✦",true);
    renderAll();
  }
  function buyAscensionPerk(key){
    const perks=state.ascension?.perks;if(!perks||!(key in perks))return;
    if(perks[key]>=ASCENSION_PERK_MAX){toast("สายนี้เต็มแล้ว");return}
    if(state.ascension.cores<1){toast("Ascension Core ไม่พอ");return}
    state.ascension.cores--;
    perks[key]++;
    toast("Core Tree อัป "+key+" เป็น "+perks[key]+"/"+ASCENSION_PERK_MAX+" ✨",true);
    renderAll();
  }

  function towerCards(){
    normalizeSlots();
    return state.placed.map(uid=>uid?state.cards.find(c=>c.uid===uid):null).filter(Boolean);
  }
  function towerPower(){
    return Math.floor(towerCards().reduce((sum,c)=>{
      return sum+
        ((Number(c.tier)+1)*15)+
        ((Number(c.grade)+1)*4)+
        Math.floor((Number(c.level)||1)/10)+
        (cardMutationIds(c).length*18)+
        (awakeningStars(c)*60);
    },0));
  }
  function towerRequirement(floor=state.tower.floor){
    const f=Math.max(1,Number(floor)||1);
    return Math.floor(150+(f*42)+(Math.pow(f,1.38)*10));
  }
  function towerCondition(floor=state.tower.floor){
    const cards=towerCards(),f=Math.max(1,Number(floor)||1),rules=[];
    const mythic=cards.filter(c=>c.tier>=5).length;
    const dual=cards.filter(c=>cardMutationIds(c).length>=2).length;
    const ex=cards.filter(c=>c.grade>=10).length;
    const awaken=cards.reduce((n,c)=>n+awakeningStars(c),0);
    const totalLv=cards.reduce((n,c)=>n+(Number(c.level)||1),0);

    if(f%5===2){
      const need=Math.min(10,1+Math.floor(f/8));
      rules.push({ok:mythic>=need,text:"Mythic+ "+mythic+"/"+need});
    }else if(f%5===3){
      const need=Math.min(8,1+Math.floor(f/10));
      rules.push({ok:dual>=need,text:"Dual Mutation "+dual+"/"+need});
    }else if(f%5===4){
      const need=300+(f*25);
      rules.push({ok:totalLv>=need,text:"Total Card Lv. "+totalLv+"/"+need});
    }else if(f%5===0){
      const need=Math.min(8,1+Math.floor(f/12));
      rules.push({ok:ex>=need,text:"EX+ "+ex+"/"+need});
    }
    if(f%10===0){
      const need=Math.max(1,Math.floor(f/10));
      rules.push({ok:awaken>=need,text:"Awaken Stars "+awaken+"/"+need});
    }
    return {
      ok:rules.every(r=>r.ok),
      text:rules.length?rules.map(r=>(r.ok?"✓ ":"• ")+r.text).join(" · "):"Power Check ล้วน"
    };
  }
  async function challengeTower(){
    if(towerChallengeBusy)return;
    if((state.ascension?.stars||0)<1){toast("ปลด Endless Tower หลัง Ascension ครั้งแรก");return}
    const floor=state.tower.floor,need=towerRequirement(floor),power=towerPower(),cond=towerCondition(floor);
    if(power<need||!cond.ok){toast("ยังไม่ผ่าน Floor "+floor+" · ปั้นฐานให้แข็งแกร่งขึ้นก่อน");return}

    state.tower.best=Math.max(state.tower.best,floor);
    state.tower.shards++;
    state.tower.floor++;

    if(!gameToken||!cloudReady){
      const dropped=Math.random()<TOWER_LV100_TICKET_DROP_CHANCE;
      if(dropped){
        state.items.level100Ticket=(Number(state.items?.level100Ticket)||0)+1;
        toast("⚡ JACKPOT! Floor "+floor+" ดรอป Lv.100 Ticket ×1 💯",true);
      }else{
        toast("ผ่าน Endless Tower Floor "+floor+" · Shard +1 🏢",true);
      }
      renderAll();
      return;
    }

    towerChallengeBusy=true;
    renderEndgame();
    save();
    try{
      const result=await flushCloudSave({force:true});
      if(!result.ok){
        toast("ผ่าน Floor "+floor+" แล้ว · Shard +1 · Rare Drop จะเช็กตอน Cloud Sync รอบถัดไป");
      }else if(!(Number(result.tower_tickets_dropped)>0)){
        toast("ผ่าน Endless Tower Floor "+floor+" · Shard +1 🏢",true);
      }
    }finally{
      towerChallengeBusy=false;
      renderAll();
    }
  }
  function forgeTowerCore(){
    if(state.tower.shards<10){toast("ต้องใช้ Tower Shards 10 ชิ้น");return}
    state.tower.shards-=10;
    state.ascension.cores++;
    toast("หลอม Ascension Core สำเร็จ ✦",true);
    renderAll();
  }

  function canAwaken(card){
    const req=awakeningRequiredLevel(card);
    return !!card&&
      Number(card.level)>=req&&
      Number(card.grade)>=AWAKEN_GRADE_INDEX&&
      cardMutationIds(card).length>=2&&
      (state.ascension?.cores||0)>=1;
  }
  function awakenCard(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    const req=awakeningRequiredLevel(c);
    if(Number(c.level)<req){toast("Awaken ★"+(awakeningStars(c)+1)+" ต้อง Card Lv."+req);return}
    if(Number(c.grade)<AWAKEN_GRADE_INDEX){toast("ต้องเป็น Grade "+GRADES[AWAKEN_GRADE_INDEX].name+" ก่อน");return}
    if(cardMutationIds(c).length<2){toast("ต้องมี Dual Mutation ก่อน");return}
    if((state.ascension?.cores||0)<1){toast("ต้องใช้ Ascension Core 1 ชิ้น");return}
    const next=awakeningStars(c)+1;
    if(!window.confirm("Awaken "+padId(c.charId)+" เป็น ★"+next+"?\nใช้ Ascension Core 1 ชิ้น\nCard Income +35%"))return;
    state.ascension.cores--;
    c.awakening=next;
    toast("AWAKEN ★"+next+" · "+padId(c.charId)+" ✦",true);
    renderAll();
    if(activeStand!==null)renderStandModal();
  }

  function renderEndgame(){
    const stars=state.ascension?.stars||0,cores=state.ascension?.cores||0,ready=state.baseLevel>=ASCENSION_LEVEL_CAP;
    const headline=$("#ascensionHeadline");if(!headline)return;
    const roman=romanNumeral(stars);
    headline.textContent="Ascension "+(roman||"0");
    $("#ascensionCores").textContent=cores;
    $("#ascensionBaseLevel").textContent="Lv."+state.baseLevel+"/40";
    $("#ascensionNext").textContent=ready?"ASCENSION READY":"Lv.40";
    $("#ascensionStars").textContent=roman||"0";
    $("#ascensionCoreCount").textContent=cores;
    $("#ascensionProgressFill").style.width=(ascensionProgress()*100).toFixed(1)+"%";
    const ascend=$("#ascendBtn");
    ascend.disabled=!ready;
    ascend.textContent=ready
      ?"ASCEND "+romanNumeral(stars+1)+" · กลับ Lv.1 + Core"
      :"ไปให้ถึง Lv.40 ก่อน · "+state.baseLevel+"/40";

    const rewardTrack=$("#ascensionRewardTrack");
    if(rewardTrack){
      rewardTrack.innerHTML=ASCENSION_REWARDS.map((reward,i)=>{
        const step=i+1,claimed=stars>=step,current=stars+1===step;
        return '<div class="ascension-reward '+(claimed?"claimed":current?"next":"locked")+'">'+
          '<span class="ascension-reward-no">'+romanNumeral(step)+'</span>'+
          '<span><b>'+escapeHtml(reward.name)+'</b><small>'+escapeHtml(reward.desc)+'</small></span>'+
          '<strong>'+(claimed?"✓":current?"NEXT":"🔒")+'</strong>'+
        '</div>';
      }).join("");
    }
    const permanent=$("#ascensionPermanentBonus");
    if(permanent)permanent.textContent=
      "Permanent: Income +"+(stars*20)+"% · Luck +"+(stars*2)+"% · รอบถัดไปเร็วขึ้น";

    const perks=state.ascension.perks;
    $("#perkIncomeRank").textContent=perks.income+"/"+ASCENSION_PERK_MAX;
    $("#perkLuckRank").textContent=perks.luck+"/"+ASCENSION_PERK_MAX;
    $("#perkForgeRank").textContent=perks.forge+"/"+ASCENSION_PERK_MAX;
    $$("[data-asc-perk]").forEach(btn=>{
      const key=btn.dataset.ascPerk;
      btn.disabled=cores<1||perks[key]>=ASCENSION_PERK_MAX;
    });

    const floor=state.tower.floor,power=towerPower(),req=towerRequirement(floor),cond=towerCondition(floor);
    $("#endlessTowerFloor").textContent=floor;
    $("#towerPower").textContent=power.toLocaleString("th-TH");
    $("#towerRequirement").textContent=req.toLocaleString("th-TH");
    $("#towerBest").textContent=state.tower.best;
    $("#towerShards").textContent=state.tower.shards;
    $("#endlessTowerCondition").textContent=(stars<1?"LOCKED · ต้อง Ascension I":"Floor "+floor+" · "+cond.text);
    const challenge=$("#towerChallengeBtn");
    challenge.disabled=towerChallengeBusy||stars<1||power<req||!cond.ok;
    challenge.textContent=towerChallengeBusy?"กำลังสุ่ม Rare Drop…":stars<1?"ปลดล็อกหลัง Ascension I":"ท้าทาย Floor "+floor;
    $("#towerCoreBtn").disabled=state.tower.shards<10;
  }
  function renderRankCatalog(){
    const wrap=$("#rankCatalog");if(!wrap)return;
    const asc=state.ascension?.stars||0;
    wrap.innerHTML=TITLES.map((title,i)=>{
      const lv=i+1,current=lv===state.baseLevel,reached=lv<=state.baseLevel;
      const topTier=TIERS[maxTierForLevel(lv)-1];
      return '<div class="rank-catalog-item '+(current?'current ':'')+(reached?'reached':'locked')+'" style="'+rankFxStyle(lv,asc)+'">'+
        '<span class="rank-level-chip">Lv.'+lv+'</span>'+
        '<strong class="'+rankFxClass(lv)+'" style="'+rankFxStyle(lv,asc)+'">'+escapeHtml(title)+'</strong>'+
        '<small>Luck ×'+luckValue(lv).toFixed(2)+' · '+topTier.name+'</small>'+
      '</div>';
    }).join("");
  }

  function loungeEnsureState(){
    if(!state.lounge||typeof state.lounge!=="object")state.lounge={initialized:false,selected:[],sound:true,theme:"night",music:{current:"",history:[]}};
    if(!state.lounge.music||typeof state.lounge.music!=="object")state.lounge.music={current:"",history:[]};
    const valid=new Set(state.cards.map(card=>Number(card.uid)));
    state.lounge.selected=[...new Set((Array.isArray(state.lounge.selected)?state.lounge.selected:[]).map(Number).filter(uid=>valid.has(uid)))].slice(0,5);
    state.lounge.music.history=[...new Set((Array.isArray(state.lounge.music.history)?state.lounge.music.history:[]).filter(x=>typeof x==="string"&&x))].slice(0,8);
    if(!state.lounge.initialized){
      state.lounge.selected=[...state.cards]
        .sort((a,b)=>cardIncome(b)-cardIncome(a)||b.tier-a.tier||b.level-a.level)
        .slice(0,Math.min(3,state.cards.length))
        .map(card=>card.uid);
      state.lounge.initialized=true;
    }
  }

  function loungeSelectedCards(){
    loungeEnsureState();
    return state.lounge.selected.map(uid=>state.cards.find(card=>card.uid===uid)).filter(Boolean);
  }

  function loungeMoodFor(uid){
    if(!loungeMood.has(uid))loungeMood.set(uid,{label:"ชิล ๆ",bubble:"",kind:"idle"});
    return loungeMood.get(uid);
  }

  function loungeAudio(){
    if(!state.lounge?.sound)return null;
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return null;
    if(!loungeAudioContext)loungeAudioContext=new Ctx();
    if(loungeAudioContext.state==="suspended")loungeAudioContext.resume().catch(()=>{});
    return loungeAudioContext;
  }

  function playChibiSfx(kind="poyo",soft=false){
    const ctx=loungeAudio();
    if(!ctx)return;
    const patterns={
      poyo:[560,760,650],
      nya:[720,920,820],
      muu:[430,380],
      heart:[700,910,1080],
      munch:[240,330,250],
      sleepy:[420,350,300],
      party:[520,700,900,1120],
      boop:[820,620]
    };
    const notes=patterns[kind]||patterns.poyo;
    const now=ctx.currentTime+.01;
    const volume=soft?.035:.075;
    notes.forEach((freq,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type=i%2?"sine":"triangle";
      osc.frequency.setValueAtTime(freq,now+i*.075);
      if(kind==="munch")osc.frequency.exponentialRampToValueAtTime(Math.max(90,freq*.72),now+i*.075+.07);
      gain.gain.setValueAtTime(.0001,now+i*.075);
      gain.gain.exponentialRampToValueAtTime(volume,now+i*.075+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,now+i*.075+.095);
      osc.connect(gain);gain.connect(ctx.destination);
      osc.start(now+i*.075);osc.stop(now+i*.075+.11);
    });
  }

  const LOUNGE_REACTIONS={
    pat:[["nya","nya~ 💗","ฟินมาก"],["heart","kyu! ♡","ดีใจ"],["poyo","poyo!","อารมณ์ดี"]],
    snack:[["munch","nom nom 🍪","หิวพอดี"],["poyo","อ้าม~","อิ่มแล้ว"],["heart","ของอร่อย! ✨","แฮปปี้"]],
    nap:[["sleepy","zzz…","ง่วงแล้ว"],["muu","muu… 💤","เคลิ้ม"],["sleepy","…zzZ","หลับปุ๋ย"]],
    click:[["boop","เอ๊ะ!?","ตกใจนิดนึง"],["nya","nya!","โดนจิ้ม"],["muu","muu~","งอแง"],["poyo","poyo!","ทักทาย"]]
  };

  function loungeReact(uid,action="click",soft=false){
    const buddy=document.querySelector('.chibi-buddy[data-lounge-uid="'+uid+'"]');
    if(!buddy)return;
    const list=LOUNGE_REACTIONS[action]||LOUNGE_REACTIONS.click;
    const [sound,bubble,label]=list[Math.floor(Math.random()*list.length)];
    loungeMood.set(Number(uid),{label,bubble,kind:action});
    buddy.classList.remove("reacting","sleeping","party");
    void buddy.offsetWidth;
    buddy.classList.add(action==="nap"?"sleeping":"reacting","talking");
    const bubbleEl=buddy.querySelector(".chibi-bubble"),moodEl=buddy.querySelector(".chibi-mood");
    if(bubbleEl)bubbleEl.textContent=bubble;
    if(moodEl)moodEl.textContent=label;
    playChibiSfx(sound,soft);
    clearTimeout(loungeTalkTimers.get(Number(uid)));
    loungeTalkTimers.set(Number(uid),setTimeout(()=>{
      buddy.classList.remove("talking","reacting");
      if(action!=="nap")buddy.classList.remove("sleeping");
    },action==="nap"?4200:1800));
  }

  function loungeParty(){
    const cards=loungeSelectedCards();
    if(!cards.length){toast("พาจิบิเข้าห้องก่อนนน 😆");return}
    playChibiSfx("party");
    cards.forEach((card,i)=>{
      const buddy=document.querySelector('.chibi-buddy[data-lounge-uid="'+card.uid+'"]');
      if(!buddy)return;
      buddy.classList.remove("sleeping","reacting");
      buddy.classList.add("party","talking");
      const bubble=buddy.querySelector(".chibi-bubble");
      if(bubble)bubble.textContent=["♪ poyo!","✨ yay!","♫ nya~","☆ hey!","♪ woo!"][i%5];
      setTimeout(()=>buddy.classList.remove("party","talking"),4200);
    });
  }

  const loungeLayoutQuery=matchMedia("(max-width: 700px)");

  function loungeIsMobileView(){
    return loungeLayoutQuery.matches;
  }

  function loungeLayoutChanged(){
    loungeWalkState.clear();
    if($("#panel-lounge")?.classList.contains("active"))renderLounge();
  }
  if(typeof loungeLayoutQuery.addEventListener==="function"){
    loungeLayoutQuery.addEventListener("change",loungeLayoutChanged);
  }else if(typeof loungeLayoutQuery.addListener==="function"){
    loungeLayoutQuery.addListener(loungeLayoutChanged);
  }

  function loungeWalkBounds(){
    return loungeIsMobileView()
      ? {minX:15,maxX:85,minY:8,maxY:54,minStep:10,baseMs:1900,perPctMs:28}
      : {minX:11,maxX:89,minY:2,maxY:18,minStep:13,baseMs:2500,perPctMs:34};
  }

  function loungeInitialWalkPos(uid,index,total){
    const key=Number(uid);
    const mode=loungeIsMobileView()?"mobile":"desktop";
    const existing=loungeWalkState.get(key);
    if(existing&&existing.mode===mode)return existing;
    const slots=Math.max(1,total);
    const b=loungeWalkBounds();
    const x=slots===1?50:b.minX+((b.maxX-b.minX)*(index/Math.max(1,slots-1)));
    const y=loungeIsMobileView()
      ? 10+(index%3)*13
      : 4+(index%3)*5;
    const pos={x:Math.max(b.minX,Math.min(b.maxX,x)),y:Math.max(b.minY,Math.min(b.maxY,y)),mode};
    loungeWalkState.set(key,pos);
    return pos;
  }

  function loungeWalkBuddy(uid){
    const key=Number(uid);
    clearTimeout(loungeWalkTimers.get(key));
    loungeWalkTimers.delete(key);
    const panel=$("#panel-lounge");
    const buddy=document.querySelector('.chibi-buddy[data-lounge-uid="'+key+'"]');
    if(!panel?.classList.contains("active")||!buddy)return;

    const b=loungeWalkBounds();
    const current=loungeWalkState.get(key)||{x:50,y:b.minY};
    let nextX=current.x;
    for(let tries=0;tries<8&&Math.abs(nextX-current.x)<b.minStep;tries++){
      nextX=b.minX+Math.random()*(b.maxX-b.minX);
    }
    const nextY=b.minY+Math.random()*(b.maxY-b.minY);
    const distance=Math.abs(nextX-current.x);
    const duration=Math.round(b.baseMs+distance*b.perPctMs+Math.random()*850);

    buddy.style.setProperty("--walk-ms",duration+"ms");
    buddy.classList.add("walking");
    requestAnimationFrame(()=>{
      buddy.style.left=nextX.toFixed(2)+"%";
      buddy.style.bottom=nextY.toFixed(1)+"px";
    });
    loungeWalkState.set(key,{x:nextX,y:nextY,mode:loungeIsMobileView()?"mobile":"desktop"});

    loungeWalkTimers.set(key,setTimeout(()=>{
      const live=document.querySelector('.chibi-buddy[data-lounge-uid="'+key+'"]');
      if(live)live.classList.remove("walking");
      const rest=900+Math.random()*2400;
      loungeWalkTimers.set(key,setTimeout(()=>loungeWalkBuddy(key),rest));
    },duration+80));
  }

  function loungeStartWalking(cards){
    const list=Array.isArray(cards)?cards:loungeSelectedCards();
    const live=new Set(list.map(card=>Number(card.uid)));
    for(const [uid,timer] of loungeWalkTimers){
      if(!live.has(uid)){
        clearTimeout(timer);
        loungeWalkTimers.delete(uid);
        loungeWalkState.delete(uid);
      }
    }
    if(!$("#panel-lounge")?.classList.contains("active"))return;
    list.forEach((card,index)=>{
      const key=Number(card.uid);
      loungeInitialWalkPos(key,index,list.length);
      clearTimeout(loungeWalkTimers.get(key));
      loungeWalkTimers.set(key,setTimeout(()=>loungeWalkBuddy(key),450+index*360+Math.random()*650));
    });
    if(!loungeAmbientTimer)loungeAmbientEvent();
  }

  function renderLounge(){
    const room=$("#loungeRoom"),wrap=$("#loungeBuddies"),empty=$("#loungeEmpty"),picker=$("#loungeCardPicker");
    if(!room||!wrap||!picker)return;
    loungeEnsureState();
    room.classList.toggle("theme-day",state.lounge.theme==="day");
    room.classList.toggle("theme-night",state.lounge.theme!=="day");
    room.dataset.layout=loungeIsMobileView()?"mobile":"desktop";
    const soundBtn=$("#loungeSoundBtn"),themeBtn=$("#loungeThemeBtn");
    if(soundBtn)soundBtn.textContent=state.lounge.sound?"🔊 เสียงจิบิ ON":"🔇 เสียงจิบิ OFF";
    if(themeBtn)themeBtn.textContent=state.lounge.theme==="day"?"☀️ Day Room":"🌙 Night Room";

    const selected=loungeSelectedCards();
    if(empty)empty.hidden=selected.length>0;
    wrap.innerHTML=selected.map((card,index)=>{
      const tier=TIERS[card.tier]||TIERS[0];
      const mood=loungeMoodFor(card.uid);
      const walk=loungeInitialWalkPos(card.uid,index,selected.length);
      return '<button class="chibi-buddy full-art" type="button" data-lounge-uid="'+card.uid+'" style="--tier:'+tier.color+';--buddy-delay:'+(-index*.31)+'s;--walk-ms:320ms;left:'+walk.x.toFixed(2)+'%;bottom:'+walk.y.toFixed(1)+'px">'+
        '<span class="chibi-bubble">'+escapeHtml(mood.bubble||"poyo~")+'</span>'+
        '<img class="chibi-full-art" src="'+imageFor(card.charId)+'" alt="'+padId(card.charId)+'">'+
        '<strong class="chibi-name">'+padId(card.charId)+' · '+escapeHtml(tier.name)+'</strong>'+
        '<small class="chibi-mood">'+escapeHtml(mood.label)+'</small>'+
      '</button>';
    }).join("");

    $("#loungeSelectedCount").textContent=selected.length+"/5";
    const selectedSet=new Set(state.lounge.selected);
    const choices=[...state.cards].sort((a,b)=>selectedSet.has(b.uid)-selectedSet.has(a.uid)||cardIncome(b)-cardIncome(a)).slice(0,80);
    picker.innerHTML=choices.length?choices.map(card=>{
      const tier=TIERS[card.tier]||TIERS[0],selectedCard=selectedSet.has(card.uid);
      return '<button type="button" class="lounge-pick-card '+(selectedCard?'selected':'')+'" data-lounge-pick="'+card.uid+'" style="--tier:'+tier.color+'">'+
        '<img src="'+imageFor(card.charId)+'" alt="'+padId(card.charId)+'">'+
        '<strong>'+(selectedCard?'✓ ':'')+padId(card.charId)+'</strong>'+
        '<small>'+escapeHtml(tier.name)+' · '+fmt(cardIncome(card))+'/s</small>'+
      '</button>';
    }).join(""):'<div class="social-empty">ยังไม่มีการ์ดในคลัง · ไปสุ่มใบแรกก่อน ✨</div>';
    renderLoungeMusic();
    loungeStartWalking(selected);
  }

  function parseYouTubeSource(raw){
    const input=String(raw||"").trim();
    if(!input)return null;
    if(/^[A-Za-z0-9_-]{11}$/.test(input)){
      return {embed:"https://www.youtube-nocookie.com/embed/"+input+"?autoplay=1&rel=0",label:"Video · "+input};
    }
    let url;
    try{url=new URL(input)}catch{
      try{url=new URL("https://"+input)}catch{return null}
    }
    const host=url.hostname.replace(/^www\./,"").toLowerCase();
    if(!["youtube.com","m.youtube.com","music.youtube.com","youtu.be","youtube-nocookie.com"].some(x=>host===x||host.endsWith("."+x)))return null;
    const list=url.searchParams.get("list");
    let id=url.searchParams.get("v")||"";
    if(host==="youtu.be")id=url.pathname.split("/").filter(Boolean)[0]||"";
    const parts=url.pathname.split("/").filter(Boolean);
    const shortsIndex=parts.indexOf("shorts"),embedIndex=parts.indexOf("embed");
    if(!id&&shortsIndex>=0)id=parts[shortsIndex+1]||"";
    if(!id&&embedIndex>=0&&parts[embedIndex+1]!=="videoseries")id=parts[embedIndex+1]||"";
    id=id.replace(/[^A-Za-z0-9_-]/g,"").slice(0,20);
    const safeList=String(list||"").replace(/[^A-Za-z0-9_-]/g,"").slice(0,80);
    if(id){
      return {
        embed:"https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0"+(safeList?"&list="+safeList:""),
        label:"YouTube · "+id,
        canonical:"https://www.youtube.com/watch?v="+id+(safeList?"&list="+safeList:"")
      };
    }
    if(safeList){
      return {
        embed:"https://www.youtube-nocookie.com/embed/videoseries?list="+safeList+"&autoplay=1&rel=0",
        label:"YouTube Playlist · "+safeList.slice(0,18),
        canonical:"https://www.youtube.com/playlist?list="+safeList
      };
    }
    return null;
  }

  function renderLoungeMusic(){
    const iframe=$("#youtubePlayer"),empty=$("#youtubePlayerEmpty"),now=$("#youtubeNowPlaying"),history=$("#youtubeHistory");
    if(!iframe||!history)return;
    const current=state.lounge?.music?.current||"";
    const parsed=parseYouTubeSource(current);
    if(parsed){
      if(iframe.dataset.source!==parsed.embed){
        iframe.src=parsed.embed;
        iframe.dataset.source=parsed.embed;
      }
      iframe.hidden=false;
      if(empty)empty.hidden=true;
      if(now)now.textContent=parsed.label;
    }else{
      iframe.hidden=true;
      iframe.removeAttribute("src");
      iframe.dataset.source="";
      if(empty)empty.hidden=false;
      if(now)now.textContent="—";
    }
    const items=state.lounge?.music?.history||[];
    history.innerHTML=items.length?items.map((url,index)=>{
      const item=parseYouTubeSource(url);
      return '<div class="youtube-history-item"><button type="button" data-youtube-history="'+index+'">'+escapeHtml(item?.label||url)+'</button><small>เล่นอีกครั้ง</small></div>';
    }).join(""):'<div class="social-empty">ยังไม่มีประวัติเพลง</div>';
  }

  function loungeLoadYouTube(raw){
    loungeEnsureState();
    const parsed=parseYouTubeSource(raw);
    if(!parsed){toast("ลิงก์ YouTube / YouTube Music นี้อ่านไม่ได้");return false}
    const canonical=parsed.canonical||String(raw).trim();
    state.lounge.music.current=canonical;
    state.lounge.music.history=[canonical,...state.lounge.music.history.filter(x=>x!==canonical)].slice(0,8);
    $("#youtubeUrlInput").value=canonical;
    renderLoungeMusic();
    save();
    toast("เปิด YouTube Jukebox แล้ว 🎵",true);
    return true;
  }

  function loungeAmbientEvent(){
    clearTimeout(loungeAmbientTimer);
    const active=$("#panel-lounge")?.classList.contains("active");
    const cards=active?loungeSelectedCards():[];
    if(cards.length){
      const card=cards[Math.floor(Math.random()*cards.length)];
      loungeReact(card.uid,Math.random()<.18?"nap":"click",true);
    }
    loungeAmbientTimer=setTimeout(loungeAmbientEvent,9000+Math.random()*8000);
  }

  function renderAll(){
    syncCardIndex();
    renderHeader();renderBase();renderLounge();renderPack();renderOdds();renderFilters();renderStoredPacks();renderIdPackShop();renderCollection();renderCardIndex();renderRebirth();renderRankCatalog();renderOnlineShell();renderMutationEvent();save();
  }

  function rollTargetsReady(){
    const max=maxTierForLevel();
    state.autoTargets=state.autoTargets.filter(i=>i<max);
    if(!state.autoTargets.length){
      toast("ติ๊ก Tier ที่ต้องการอย่างน้อย 1 ระดับก่อน");
      return false;
    }
    return true;
  }

  function updateRollProgress(){
    if(!state.rollingUntil){
      $("#timerFill").style.width="100%";
      $("#timerText").textContent=state.targetFound?"เจอเป้าหมายแล้ว":"พร้อมสุ่ม";
      $("#rollBtn").disabled=false;
      return;
    }
    const remaining=Math.max(0,state.rollingUntil-Date.now());
    const p=Math.max(0,Math.min(1,1-(remaining/ROLL_MS)));
    $("#timerFill").style.width=(p*100)+"%";
    $("#timerText").textContent="กำลังสุ่ม… "+(remaining/1000).toFixed(1)+" วิ";
    $("#rollBtn").disabled=true;
  }

  function scheduleRollEngine(){
    clearTimeout(autoTimer);
    if(!state.rollingUntil)return;
    const remaining=Math.max(0,state.rollingUntil-Date.now());
    autoTimer=setTimeout(processRollEngine,Math.min(250,Math.max(20,remaining)));
  }

  function beginRoll(){
    if(Date.now()<state.rollingUntil)return;
    state.currentPack=null;
    state.targetFound=false;
    state.rollingUntil=Date.now()+ROLL_MS;
    renderPack();renderFilters();updateRollProgress();save();
    scheduleRollEngine();
  }

  function manualRoll(){
    if(state.autoRolling||state.fullAuto){
      state.autoRolling=false;state.fullAuto=false;
      setPackAutoSession(false);
      clearTimeout(autoTimer);state.rollingUntil=0;
    }
    beginRoll();
  }

  function processRollEngine(){
    clearTimeout(autoTimer);
    if(!state.rollingUntil){updateRollProgress();return}
    const now=Date.now();
    if(now<state.rollingUntil){
      updateRollProgress();
      scheduleRollEngine();
      return;
    }

    let processed=0,storedHits=0,lastStoredTier=null;
    while(state.rollingUntil&&now>=state.rollingUntil&&processed<2000){
      const finishedAt=state.rollingUntil;
      const tier=randomTier();
      processed++;

      if(state.fullAuto){
        if(state.autoTargets.includes(tier)){
          storePack(tier,finishedAt);
          storedHits++;
          lastStoredTier=tier;
        }
        state.currentPack=null;
        state.targetFound=false;
        state.rollingUntil=finishedAt+ROLL_MS;
        continue;
      }

      if(state.autoRolling){
        if(state.autoTargets.includes(tier)){
          state.currentPack={tier};
          state.autoRolling=false;
          state.targetFound=true;
          state.rollingUntil=0;
          setPackAutoSession(false);
          toast("เจอ "+TIERS[tier].name+" แล้ว! Auto หยุดให้แล้ว ✨",true);
          break;
        }
        state.currentPack=null;
        state.rollingUntil=finishedAt+ROLL_MS;
        continue;
      }

      state.currentPack={tier};
      state.rollingUntil=0;
      toast("ได้ซอง "+TIERS[tier].name+"!");
      break;
    }

    if(storedHits){
      toast("Full Auto เก็บ "+storedHits+" ซอง"+(lastStoredTier!==null?" · ล่าสุด "+TIERS[lastStoredTier].name:"")+" ✨",true);
    }

    renderPack();renderFilters();renderStoredPacks();updateRollProgress();save();

    if(state.rollingUntil){
      if(Date.now()>=state.rollingUntil)setTimeout(processRollEngine,0);
      else scheduleRollEngine();
    }
  }

  function tickRoll(){
    processRollEngine();
  }

  function toggleAuto(){
    if(state.autoRolling){
      state.autoRolling=false;state.rollingUntil=0;setPackAutoSession(false);clearTimeout(autoTimer);
      toast("หยุด Auto Roll แล้ว");renderFilters();renderPack();updateRollProgress();save();return;
    }
    if(!rollTargetsReady())return;
    state.fullAuto=false;
    state.autoRolling=true;
    state.targetFound=false;
    setPackAutoSession(true);
    if(state.currentPack&&state.autoTargets.includes(state.currentPack.tier)){
      state.autoRolling=false;state.targetFound=true;setPackAutoSession(false);
      toast("ซองปัจจุบันตรงกับ Filter อยู่แล้ว ✨",true);
      renderAll();return;
    }
    state.currentPack=null;
    state.rollingUntil=0;
    renderFilters();save();beginRoll();
  }

  function toggleFullAuto(){
    if(state.fullAuto){
      state.fullAuto=false;state.rollingUntil=0;setPackAutoSession(false);clearTimeout(autoTimer);
      toast("หยุด Full Auto แล้ว");renderFilters();renderPack();updateRollProgress();save();return;
    }
    if(!rollTargetsReady())return;
    state.autoRolling=false;
    state.fullAuto=true;
    state.targetFound=false;
    setPackAutoSession(true);
    if(state.currentPack&&state.autoTargets.includes(state.currentPack.tier)){
      storePack(state.currentPack.tier);
      toast("เก็บซอง "+TIERS[state.currentPack.tier].name+" เข้าคลังแล้ว ✨",true);
    }
    state.currentPack=null;
    state.rollingUntil=0;
    renderFilters();renderStoredPacks();save();beginRoll();
  }

  function openPack(){
    if(!state.currentPack||Date.now()<state.rollingUntil)return;
    const tier=state.currentPack.tier;
    const card=createCardFromTier(tier);
    state.currentPack=null;state.targetFound=false;
    showReveal(card);renderAll();
  }

  function showReveal(c){
    const t=TIERS[c.tier],g=GRADES[c.grade];
    $("#revealVisual").innerHTML='<div class="reveal-visual tier-shell tier-'+c.tier+' grade-shell-'+c.grade+'" style="--tier:'+t.color+';'+cardMutationStyle(c)+'"><div class="reveal-art '+tierFxClass(c.tier)+cardMutationFxClass(c)+'"><img src="'+imageFor(c.charId)+'" alt="'+escapeHtml(cardName(c.charId))+' '+padId(c.charId)+'"><div class="tier-ring"></div><div class="card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div>'+mutationBadge(c)+'</div><div class="reveal-info tier-copy tier-'+c.tier+'" style="--tier:'+t.color+'"><h2 class="reveal-character-name">'+escapeHtml(cardName(c.charId))+'</h2><div class="reveal-tier-name tier-card-name">'+t.name+'</div><p><strong class="tier-card-id">'+padId(c.charId)+'</strong> · ID Income '+charIncomeBonusText(c.charId)+' · Grade '+g.name+(cardMutationIds(c).length?' · '+mutationNames(c):'')+'</p></div></div>';
    $("#reveal").classList.add("show");$("#reveal").setAttribute("aria-hidden","false");
    const img=$("#revealVisual img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
  }
  function closeReveal(){$("#reveal").classList.remove("show");$("#reveal").setAttribute("aria-hidden","true")}

  function openStand(slot){
    activeStand=slot;$("#standModal").classList.add("show");$("#standModal").setAttribute("aria-hidden","false");renderStandModal();
  }
  function closeStand(){activeStand=null;$("#standModal").classList.remove("show");$("#standModal").setAttribute("aria-hidden","true")}

  function renderStandModal(){
    if(activeStand===null)return;
    normalizeSlots();
    const uid=state.placed[activeStand],c=uid?state.cards.find(x=>x.uid===uid):null;
    $("#standModalTitle").textContent="แท่น "+(activeStand+1);
    const body=$("#standModalBody");
    if(!c){renderPicker(body,activeStand);return}
    const t=TIERS[c.tier],g=GRADES[c.grade];
    body.innerHTML=
      '<div class="stand-detail" data-card-uid="'+c.uid+'"><div class="stand-detail-art '+tierFxClass(c.tier)+cardMutationFxClass(c)+' grade-shell-'+c.grade+'" data-awakening="'+awakeningStars(c)+'" style="'+tierStyle(c.tier)+';'+cardMutationStyle(c)+'"><img src="'+imageFor(c.charId)+'" alt="'+escapeHtml(cardName(c.charId))+' '+padId(c.charId)+'"><div class="tier-ring"></div><div class="card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div>'+mutationBadge(c)+awakeningBadge(c)+'<div class="card-face-meta tier-copy tier-'+c.tier+'" style="--tier:'+t.color+'"><div class="card-face-meta-row card-face-meta-top"><span class="card-character-name" title="'+escapeHtml(cardName(c.charId))+'">'+escapeHtml(cardName(c.charId))+'</span><span class="tier-card-name">'+t.name+'</span></div><div class="card-face-meta-row card-face-meta-bottom"><span class="card-id-level"><span class="tier-card-id">'+padId(c.charId)+'</span><span class="tier-dot"> · </span>Lv.<b data-modal-face-stat="level">'+c.level+'</b></span><strong data-modal-face-stat="income" class="tier-card-income">'+fmt(cardIncome(c))+'/s</strong></div></div></div>'+
      '<div class="stand-detail-info"><div class="stand-character-heading"><strong>'+escapeHtml(cardName(c.charId))+'</strong><span>'+padId(c.charId)+' · '+escapeHtml(t.name)+'</span></div><div><div class="eyebrow">INCOME</div><div data-modal-stat="income" class="big-income tier-card-income tier-copy tier-'+c.tier+'" style="--tier:'+t.color+'">'+fmt(cardIncome(c))+'/s</div></div>'+
      '<div class="card-stats"><div><span>Level</span><b data-modal-stat="level">'+c.level+'</b></div><div><span>Grade</span><b data-modal-stat="grade">'+g.name+' ×'+g.multi.toFixed(2)+'</b></div><div><span>ID Income Bonus</span><b>'+charIncomeBonusText(c.charId)+'</b></div><div><span>Mutation</span><b>'+escapeHtml(mutationNames(c))+' · '+cardMutationIds(c).length+'/2 · Income ×'+mutationIncomeMultiplier(c).toFixed(2)+'</b></div><div><span>อัป Level</span><b data-modal-stat="upgrade">'+fmt(upgradeCost(c))+'</b></div><div><span>สุ่ม Grade</span><b data-modal-stat="grade-cost">'+fmt(rerollCost(c))+'</b></div><div><span>Mutation Slots</span><b>'+cardMutationIds(c).length+'/2 · First Open / Event / Inheritance</b></div><div><span>Grade → Mutation</span><b data-modal-stat="mutation-grade">'+mutationGradeBenefitText(c)+'</b></div><div><span>Awaken</span><b>★'+awakeningStars(c)+' · Income ×'+awakeningMultiplier(c).toFixed(2)+' · Next Lv.'+awakeningRequiredLevel(c)+'</b></div></div>'+
      '<div class="stand-actions"><button data-modal-a="level">อัป Level</button><button class="level100-ticket-btn" data-modal-a="level100-ticket" '+(c.level>=100||!(state.items?.level100Ticket>0)?"disabled":"")+'>⚡ Lv.100 Ticket'+(state.items?.level100Ticket>0?" ×"+state.items.level100Ticket:"")+'</button><button data-modal-a="grade">สุ่ม Grade</button><button class="'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"grade-running":"")+'" data-modal-a="grade-auto">'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"Auto Grade…":"Auto Grade")+'</button><button class="awaken-action" data-modal-a="awaken" '+(!canAwaken(c)?"disabled":"")+'>✦ Awaken ★'+(awakeningStars(c)+1)+'</button><button class="mutation-cleanse-btn" data-modal-a="mutation-cleanse" '+(!cardMutationIds(c).length?"disabled":"")+'>🧹 ล้าง Mutation</button><button data-modal-a="change">เปลี่ยนการ์ด</button><button class="remove" data-modal-a="remove">ถอดจากแท่น</button></div></div></div>';
    const img=body.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
    body.querySelector('[data-modal-a="level"]').addEventListener("click",()=>{levelUp(c.uid,true)});
    body.querySelector('[data-modal-a="level100-ticket"]')?.addEventListener("click",()=>{useLevel100Ticket(c.uid)});
    body.querySelector('[data-modal-a="grade"]').addEventListener("click",()=>{rerollGrade(c.uid,true)});
    body.querySelector('[data-modal-a="grade-auto"]').addEventListener("click",()=>{openGradeAuto(c.uid)});
    body.querySelector('[data-modal-a="awaken"]').addEventListener("click",()=>{awakenCard(c.uid)});
    body.querySelector('[data-modal-a="mutation-cleanse"]')?.addEventListener("click",()=>{openMutationCleanse(c.uid)});
    body.querySelector('[data-modal-a="remove"]').addEventListener("click",()=>{state.placed[activeStand]=null;toast("ถอดการ์ดจากแท่นแล้ว");renderAll();renderStandModal()});
    body.querySelector('[data-modal-a="change"]').addEventListener("click",()=>renderPicker(body,activeStand,c.uid));
  }

  function renderPicker(body,slot,currentUid=null){
    const used=new Set(state.placed.filter(Boolean));
    if(currentUid)used.delete(currentUid);
    const choices=state.cards.filter(c=>!used.has(c.uid)).sort((a,b)=>cardIncome(b)-cardIncome(a));
    body.innerHTML='<p class="picker-note">'+(choices.length?'เลือกการ์ดจากคลังเพื่อวางที่แท่นนี้':'ยังไม่มีการ์ดว่างในคลัง')+'</p><div class="picker-grid"></div>';
    const grid=body.querySelector(".picker-grid");
    choices.forEach(c=>{
      const t=TIERS[c.tier],g=GRADES[c.grade],btn=document.createElement("button");
      btn.type="button";btn.className="picker-card";
      btn.innerHTML='<div class="picker-art '+tierFxClass(c.tier)+cardMutationFxClass(c)+' grade-shell-'+c.grade+'" style="'+tierStyle(c.tier)+';'+cardMutationStyle(c)+'"><img src="'+imageFor(c.charId)+'" alt="'+escapeHtml(cardName(c.charId))+' '+padId(c.charId)+'"><div class="tier-ring"></div><div class="card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div>'+mutationBadge(c)+'</div><div class="picker-meta tier-copy tier-'+c.tier+'" style="--tier:'+t.color+'"><div class="picker-character-name" title="'+escapeHtml(cardName(c.charId))+'">'+escapeHtml(cardName(c.charId))+'</div><b class="picker-id-tier"><span class="tier-card-id">'+padId(c.charId)+'</span><span class="tier-card-name">'+t.name+'</span></b><span class="picker-stat-line">Lv.'+c.level+' · '+g.name+' · <strong class="tier-card-income">'+fmt(cardIncome(c))+'/s</strong></span></div>';
      const img=btn.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
      btn.addEventListener("click",()=>{state.placed[slot]=c.uid;toast("วาง "+padId(c.charId)+" ที่แท่น "+(slot+1));renderAll();renderStandModal()});
      grid.appendChild(btn);
    });
  }

  function togglePlace(uid){
    normalizeSlots();
    const card=state.cards.find(x=>x.uid===uid);
    if(cardIsTradeLocked(card)){toast("การ์ดนี้ถูกล็อกไว้ใน Trade");return}
    const existing=state.placed.indexOf(uid);
    if(existing>=0){state.placed[existing]=null;toast("นำการ์ดออกจากฐานแล้ว");renderAll();return}
    const empty=state.placed.findIndex(x=>!x);
    if(empty<0){toast("แท่นเต็มแล้ว");return}
    state.placed[empty]=uid;toast("วางการ์ดที่แท่น "+(empty+1));renderAll();
  }

  function autoEquipBest(){
    normalizeSlots();
    const limit=standLimit();
    if(!state.cards.length||limit<=0){
      toast("ยังไม่มีการ์ดให้สวมในฐาน");
      return;
    }

    const before=totalIncome();
    const next=new Array(limit).fill(null);
    const reserved=new Set();

    // การ์ดที่ติด Trade Lock ต้องอยู่ตำแหน่งเดิม เพื่อไม่ให้ชน integrity check ฝั่งเซิร์ฟเวอร์
    for(let slot=0;slot<Math.min(limit,state.placed.length);slot++){
      const uid=state.placed[slot];
      const card=uid?state.cards.find(c=>c.uid===uid):null;
      if(card&&cardIsTradeLocked(card)){
        next[slot]=card.uid;
        reserved.add(card.uid);
      }
    }

    const ranked=state.cards
      .filter(card=>!reserved.has(card.uid)&&!cardIsTradeLocked(card))
      .sort((a,b)=>{
        const ai=cardIncome(a),bi=cardIncome(b);
        if(ai!==bi)return bi>ai?1:-1;
        return b.tier-a.tier||b.grade-a.grade||b.level-a.level||awakeningStars(b)-awakeningStars(a)||a.uid-b.uid;
      });

    let pick=0;
    for(let slot=0;slot<limit&&pick<ranked.length;slot++){
      if(next[slot])continue;
      next[slot]=ranked[pick++].uid;
    }

    const changed=next.some((uid,slot)=>state.placed[slot]!==uid);
    state.placed=next;
    const after=totalIncome();
    const placed=next.filter(Boolean).length;

    if(!changed){
      toast("ฐานนี้สวมการ์ดที่ดีที่สุดอยู่แล้ว ✨",true);
      return;
    }

    const gain=Math.max(0,after-before);
    toast(
      "สวม Best "+placed+" ใบแล้ว"+(gain>0?" · +"+fmt(gain)+"/s":"")+" ⚡",
      true
    );
    renderAll();
  }

  function replaceNumericClass(el,prefix,value){
    if(!el)return;
    [...el.classList].forEach(cls=>{if(cls.startsWith(prefix))el.classList.remove(cls)});
    el.classList.add(prefix+value);
  }

  function refreshCardSurface(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    const g=GRADES[c.grade],t=TIERS[c.tier];
    const placed=state.placed.includes(c.uid);
    const tradeLocked=cardIsTradeLocked(c);

    // Collection card: update in place so its DOM node, hover state and FX timeline survive.
    const el=document.querySelector('.card-item[data-card-uid="'+c.uid+'"]');
    if(el){
      replaceNumericClass(el,"grade-shell-",c.grade);
      const art=el.querySelector(".card-art");
      if(art)replaceNumericClass(art,"grade-shell-",c.grade);
      const badge=el.querySelector(".card-grade");
      if(badge){
        badge.className="card-grade "+gradeFxClass(c.grade);
        badge.style.setProperty("--grade",g.color);
        badge.textContent=g.name;
      }
      const level=el.querySelector('[data-card-stat="level"]');if(level)level.textContent=c.level;
      const income=el.querySelector('[data-card-stat="income"]');if(income)income.textContent=fmt(cardIncome(c))+"/s";
      const faceLevel=el.querySelector('[data-card-face-stat="level"]');if(faceLevel)faceLevel.textContent=c.level;
      const faceIncome=el.querySelector('[data-card-face-stat="income"]');if(faceIncome)faceIncome.textContent=fmt(cardIncome(c))+"/s";
      const upgrade=el.querySelector('[data-card-stat="upgrade"]');if(upgrade)upgrade.textContent=fmt(upgradeCost(c));
      const gradeCost=el.querySelector('[data-card-stat="grade-cost"]');if(gradeCost)gradeCost.textContent=fmt(rerollCost(c));
      const mutationGrade=el.querySelector('[data-card-stat="mutation-grade"]');if(mutationGrade)mutationGrade.textContent=mutationGradeBenefitText(c);
      const sell=el.querySelector('[data-a="sell"]');if(sell){
        sell.textContent="ขาย "+fmt(sellValue(c));
        sell.disabled=placed||c.locked||tradeLocked;
      }
      const ticket=el.querySelector('[data-a="level100-ticket"]');if(ticket){
        const tickets=Math.max(0,Math.floor(Number(state.items?.level100Ticket)||0));
        ticket.disabled=tradeLocked||c.level>=100||tickets<=0;
        ticket.textContent="⚡ Lv.100 Ticket"+(tickets?" ×"+tickets:"");
      }
      const auto=el.querySelector('[data-a="grade-auto"]');if(auto){
        const running=!!(state.gradeAuto&&state.gradeAuto.uid===c.uid);
        auto.classList.toggle("grade-running",running);
        auto.textContent=running?"Auto Grade…":"Auto Grade";
      }
      const awaken=el.querySelector('[data-a="awaken"]');if(awaken){
        awaken.disabled=tradeLocked||!canAwaken(c);
        awaken.textContent="✦ Awaken ★"+(awakeningStars(c)+1);
      }
    }

    // Base stand: also update without reconstructing every stand.
    const stand=document.querySelector('.stand[data-card-uid="'+c.uid+'"]');
    if(stand){
      replaceNumericClass(stand,"grade-shell-",c.grade);
      const mini=stand.querySelector(".mini-card");
      if(mini){
        replaceNumericClass(mini,"grade-shell-",c.grade);
        mini.dataset.awakening=String(awakeningStars(c));
      }
      const badge=stand.querySelector(".base-card-grade");
      if(badge){
        badge.className="card-grade base-card-grade "+gradeFxClass(c.grade);
        badge.style.setProperty("--grade",g.color);
        badge.textContent=g.name;
      }
      const level=stand.querySelector('[data-stand-stat="level"]');if(level)level.textContent=c.level;
      const income=stand.querySelector('[data-stand-stat="income"]');if(income)income.textContent=fmt(cardIncome(c))+"/s";
    }

    // Open stand modal, if this is the same card.
    const detail=document.querySelector('.stand-detail[data-card-uid="'+c.uid+'"]');
    if(detail){
      const art=detail.querySelector(".stand-detail-art");
      if(art)replaceNumericClass(art,"grade-shell-",c.grade);
      const badge=detail.querySelector(".card-grade");
      if(badge){
        badge.className="card-grade "+gradeFxClass(c.grade);
        badge.style.setProperty("--grade",g.color);
        badge.textContent=g.name;
      }
      const level=detail.querySelector('[data-modal-stat="level"]');if(level)level.textContent=c.level;
      const income=detail.querySelector('[data-modal-stat="income"]');if(income)income.textContent=fmt(cardIncome(c))+"/s";
      const faceLevel=detail.querySelector('[data-modal-face-stat="level"]');if(faceLevel)faceLevel.textContent=c.level;
      const faceIncome=detail.querySelector('[data-modal-face-stat="income"]');if(faceIncome)faceIncome.textContent=fmt(cardIncome(c))+"/s";
      const grade=detail.querySelector('[data-modal-stat="grade"]');if(grade)grade.textContent=g.name+" ×"+g.multi.toFixed(2);
      const upgrade=detail.querySelector('[data-modal-stat="upgrade"]');if(upgrade)upgrade.textContent=fmt(upgradeCost(c));
      const gradeCost=detail.querySelector('[data-modal-stat="grade-cost"]');if(gradeCost)gradeCost.textContent=fmt(rerollCost(c));
      const mutationGrade=detail.querySelector('[data-modal-stat="mutation-grade"]');if(mutationGrade)mutationGrade.textContent=mutationGradeBenefitText(c);
      const ticket=detail.querySelector('[data-modal-a="level100-ticket"]');if(ticket){
        const tickets=Math.max(0,Math.floor(Number(state.items?.level100Ticket)||0));
        ticket.disabled=c.level>=100||tickets<=0;
        ticket.textContent="⚡ Lv.100 Ticket"+(tickets?" ×"+tickets:"");
      }
      const auto=detail.querySelector('[data-modal-a="grade-auto"]');if(auto){
        const running=!!(state.gradeAuto&&state.gradeAuto.uid===c.uid);
        auto.classList.toggle("grade-running",running);
        auto.textContent=running?"Auto Grade…":"Auto Grade";
      }
      const awaken=detail.querySelector('[data-modal-a="awaken"]');if(awaken){
        awaken.disabled=!canAwaken(c);
        awaken.textContent="✦ Awaken ★"+(awakeningStars(c)+1);
      }
    }

    // Only cheap global numbers need refreshing.
    renderHeader();
    renderRebirth();
  }

  function commitCardMicroUpdate(uid){
    refreshCardSurface(uid);
    recordCardInIndex(state.cards.find(x=>x.uid===uid));
    if($("#panel-index")?.classList.contains("active"))renderCardIndex();
    localStorage.setItem(SAVE_KEY,JSON.stringify(state));
    scheduleCloudSave();
  }

  function levelUp(uid,fromModal=false){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    if(cardIsTradeLocked(c)){toast("การ์ดนี้ถูกล็อกไว้ใน Trade");return}
    const cost=upgradeCost(c);if(state.money<cost){toast("เงินไม่พอ");return}
    state.money-=cost;c.level++;
    toast("อัปเป็น Lv."+c.level);
    commitCardMicroUpdate(c.uid);
  }
  function rerollGrade(uid,fromModal=false){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    if(cardIsTradeLocked(c)){toast("การ์ดนี้ถูกล็อกไว้ใน Trade");return}
    if(state.gradeAuto&&state.gradeAuto.uid===uid){toast("Auto Grade กำลังทำงานอยู่");return}
    const cost=rerollCost(c);
    if(state.money<cost){toast("เงินไม่พอ · ต้องใช้ "+fmt(cost));return}
    const ok=window.confirm(
      "สุ่ม Grade ใหม่ของ "+padId(c.charId)+" ใช้เงิน "+fmt(cost)+
      "\nGrade ปัจจุบัน: "+GRADES[c.grade].name+
      "\n\nผลใหม่จะเขียนทับ Grade เดิมทันที แม้จะต่ำลง ต้องการสุ่มต่อไหม?"
    );
    if(!ok)return;
    state.money-=cost;
    c.grade=randomGrade();
    toast("Grade ใหม่: "+GRADES[c.grade].name+(c.grade>=8?" ✨":""));
    commitCardMicroUpdate(c.uid);
  }

  function mutationGradeIndex(card){
    return Math.max(0,Math.min(GRADES.length-1,Math.floor(Number(card?.grade)||0)));
  }

  function mutationGradeEventBonus(card){
    return MUTATION_GRADE_EVENT_BONUS[mutationGradeIndex(card)]||0;
  }

  function mutationGradeInheritanceBonus(card){
    return MUTATION_GRADE_INHERIT_BONUS[mutationGradeIndex(card)]||0;
  }

  function mutationGradeBenefitText(card){
    return "Event Quality +"+Math.round(mutationGradeEventBonus(card)*100)+"% · Inherit +"+Math.round(mutationGradeInheritanceBonus(card)*100)+"%";
  }

  function mutationDonorEligible(card,targetUid,mutationId=null){
    if(!card||card.uid===targetUid)return false;
    if(card.locked||state.placed.includes(card.uid)||cardIsTradeLocked(card))return false;
    if(state.gradeAuto&&state.gradeAuto.uid===card.uid)return false;
    const ids=cardMutationIds(card);
    if(!ids.length)return false;
    return mutationId===null?true:ids.includes(Number(mutationId));
  }

  function mutationInheritanceLevelBonus(donor){
    // Old invested cards become valuable donors: Level can only add chance, never reduce it.
    // +0.2 percentage points per level after Lv.1, capped at +25 percentage points.
    const level=Math.max(1,Math.floor(Number(donor?.level)||1));
    return Math.min(0.25,(level-1)*0.002);
  }

  function mutationInheritanceSingleChance(target,donor){
    const occupied=cardMutationIds(target).length;
    const base=occupied>0?0.18:0.38;
    const diff=(Number(donor.tier)||0)-(Number(target.tier)||0);
    const tierFactor=diff>=0
      ? Math.min(1.82,1+(diff*0.18))
      : Math.pow(0.72,Math.abs(diff));
    const levelBonus=mutationInheritanceLevelBonus(donor);
    return Math.max(0.01,Math.min(0.78,(base*tierFactor)+levelBonus));
  }

  function mutationInheritanceCombinedChance(target,donors){
    if(!target||!donors.length)return 0;
    let fail=1;
    donors.forEach(d=>{fail*=1-mutationInheritanceSingleChance(target,d)});
    const donorChance=1-fail;
    return Math.min(0.95,donorChance+mutationGradeInheritanceBonus(target));
  }

  function mutationLabAvailableTypes(target){
    if(!target)return [];
    const owned=new Set(cardMutationIds(target));
    const types=new Set();
    state.cards.forEach(c=>{
      if(!mutationDonorEligible(c,target.uid))return;
      cardMutationIds(c).forEach(id=>{if(!owned.has(id))types.add(id)});
    });
    return [...types].sort((a,b)=>a-b);
  }

  function openMutationLab(uid){
    const target=state.cards.find(c=>c.uid===uid);if(!target)return;
    if(cardIsTradeLocked(target)){toast("การ์ดนี้ถูกล็อกไว้ใน Trade");return}
    if(state.gradeAuto&&state.gradeAuto.uid===target.uid){toast("หยุด Auto Grade ของใบนี้ก่อนสืบทอด Mutation");return}
    if(cardMutationIds(target).length>=2){toast("การ์ดใบนี้มี Mutation ครบ 2 ช่องแล้ว");return}
    mutationLabTargetUid=uid;
    const modal=$("#mutationLabModal");
    modal.classList.add("show");modal.setAttribute("aria-hidden","false");
    renderMutationLab(true);
  }

  function closeMutationLab(){
    $("#mutationLabModal").classList.remove("show");
    $("#mutationLabModal").setAttribute("aria-hidden","true");
    mutationLabTargetUid=null;
  }

  function renderMutationLab(resetType=false){
    const target=state.cards.find(c=>c.uid===mutationLabTargetUid);
    if(!target){closeMutationLab();return}

    const ids=cardMutationIds(target);
    const slotText=ids.length?mutationNames(target):"ยังไม่มี Mutation";
    $("#mutationLabTarget").innerHTML=
      '<div class="mutation-lab-target-card">'+tradeCardVisual(target,true)+'</div>'+
      '<div class="mutation-lab-target-copy"><span>TARGET · '+ids.length+'/2 SLOT</span><strong>'+escapeHtml(slotText)+'</strong>'+
      '<small>Tier '+TIERS[target.tier].name+' · Grade '+GRADES[target.grade].name+' · Inherit Bonus +'+Math.round(mutationGradeInheritanceBonus(target)*100)+'% · ช่องถัดไป '+(ids.length===0?'เรทพื้นฐานสูงกว่า':'เป็นช่องที่ 2 · เรทยากขึ้น')+'</small></div>';

    const types=mutationLabAvailableTypes(target);
    const select=$("#mutationLabType");
    const previous=Number(select.value)||0;
    select.innerHTML=types.length
      ? types.map(id=>'<option value="'+id+'">'+MUTATIONS[id].icon+' '+MUTATIONS[id].name+' · Income ×'+MUTATIONS[id].income.toFixed(2)+'</option>').join("")
      : '<option value="">ไม่มี Donor ที่ใช้ได้</option>';
    if(!resetType&&types.includes(previous))select.value=String(previous);
    renderMutationLabDonors(true);
  }

  function renderMutationLabDonors(clearSelection=false){
    const target=state.cards.find(c=>c.uid===mutationLabTargetUid);
    const mutationId=Number($("#mutationLabType").value)||0;
    const wrap=$("#mutationLabDonors");
    if(!target||!mutationId){
      wrap.innerHTML='<div class="social-empty">ยังไม่มีการ์ดกลายพันธุ์ที่พร้อมใช้เป็น Donor</div>';
      updateMutationLabChance();
      return;
    }

    const selected=clearSelection?new Set():new Set(
      [...wrap.querySelectorAll('input[data-mutation-donor]:checked')].map(x=>Number(x.dataset.mutationDonor))
    );
    const donors=state.cards
      .filter(c=>mutationDonorEligible(c,target.uid,mutationId))
      .sort((a,b)=>mutationInheritanceSingleChance(target,b)-mutationInheritanceSingleChance(target,a)||b.tier-a.tier||b.level-a.level);

    wrap.innerHTML=donors.length?donors.map(c=>{
      const chance=mutationInheritanceSingleChance(target,c);
      const diff=c.tier-target.tier;
      const tierDelta=diff===0?"Tier เท่ากัน":diff>0?"Tier +"+diff:"Tier "+diff;
      const levelBonus=mutationInheritanceLevelBonus(c);
      return '<label class="mutation-donor-row" style="--mutation:'+MUTATIONS[mutationId].color+'">'+
        '<input type="checkbox" data-mutation-donor="'+c.uid+'" '+(selected.has(c.uid)?'checked':'')+'>'+
        '<span class="mutation-donor-id">'+padId(c.charId)+'</span>'+
        '<span class="mutation-donor-meta"><b>'+TIERS[c.tier].name+' · Lv.'+c.level+' · '+mutationNames(c)+'</b><small>'+tierDelta+' · Lv Bonus +'+(levelBonus*100).toFixed(1)+'% · ใบนี้ช่วย '+(chance*100).toFixed(chance<.1?1:0)+'%</small></span>'+
        '<strong>'+Math.round(chance*100)+'%</strong>'+
      '</label>';
    }).join(""):'<div class="social-empty">ไม่มี Donor '+escapeHtml(MUTATIONS[mutationId].name)+' ที่ว่างอยู่</div>';
    updateMutationLabChance();
  }

  function selectedMutationDonors(){
    return [...document.querySelectorAll('#mutationLabDonors input[data-mutation-donor]:checked')]
      .map(input=>state.cards.find(c=>c.uid===Number(input.dataset.mutationDonor)))
      .filter(Boolean);
  }

  function updateMutationLabChance(){
    const target=state.cards.find(c=>c.uid===mutationLabTargetUid);
    const donors=selectedMutationDonors();
    const chance=mutationInheritanceCombinedChance(target,donors);
    $("#mutationLabChance").textContent=(chance*100).toFixed(chance>0&&chance<.1?1:0)+"%";
    $("#mutationLabConfirm").disabled=!target||!donors.length;
    const factors=$("#mutationLabFactors");
    if(!target){factors.textContent="ไม่พบ Target";return}
    if(!donors.length){
      factors.textContent="เลือก donor อย่างน้อย 1 ใบ · "+(cardMutationIds(target).length?"ช่อง 2 มี penalty":"ช่อง 1 ใช้เรทฐาน");
      return;
    }
    const high=donors.filter(d=>d.tier>target.tier).length;
    const same=donors.filter(d=>d.tier===target.tier).length;
    const low=donors.length-high-same;
    const levelBonusTotal=donors.reduce((sum,d)=>sum+mutationInheritanceLevelBonus(d),0);
    const bestLevel=Math.max(...donors.map(d=>Math.max(1,Number(d.level)||1)));
    factors.textContent=donors.length+" Donor · Tier สูงกว่า "+high+" · เท่ากัน "+same+" · ต่ำกว่า "+low+
      " · Lv สูงสุด "+bestLevel+" · โบนัส Lv รวม +"+(levelBonusTotal*100).toFixed(1)+"%"+
      " · Target Grade "+GRADES[target.grade].name+" +"+Math.round(mutationGradeInheritanceBonus(target)*100)+"%"+
      (cardMutationIds(target).length?" · ช่อง 2 ยากขึ้น":" · ช่อง 1");
  }

  function mutationLabSelectBest(){
    const target=state.cards.find(c=>c.uid===mutationLabTargetUid);
    const mutationId=Number($("#mutationLabType").value)||0;
    if(!target||!mutationId)return;
    const best=state.cards
      .filter(c=>mutationDonorEligible(c,target.uid,mutationId))
      .sort((a,b)=>mutationInheritanceSingleChance(target,b)-mutationInheritanceSingleChance(target,a))
      .slice(0,3);
    const ids=new Set(best.map(c=>c.uid));
    document.querySelectorAll('#mutationLabDonors input[data-mutation-donor]').forEach(input=>{
      input.checked=ids.has(Number(input.dataset.mutationDonor));
    });
    updateMutationLabChance();
  }

  function performMutationInheritance(){
    const target=state.cards.find(c=>c.uid===mutationLabTargetUid);
    const mutationId=Number($("#mutationLabType").value)||0;
    const donors=selectedMutationDonors();
    if(!target||!mutationId||!donors.length)return;
    if(cardMutationIds(target).length>=2){toast("Mutation เต็ม 2 ช่องแล้ว");closeMutationLab();return}
    if(cardMutationIds(target).includes(mutationId)){toast("Target มี Mutation ชนิดนี้อยู่แล้ว");return}
    if(donors.some(d=>!mutationDonorEligible(d,target.uid,mutationId))){
      toast("Donor บางใบไม่พร้อมใช้งานแล้ว");renderMutationLabDonors(true);return;
    }

    const chance=mutationInheritanceCombinedChance(target,donors);
    const mutation=MUTATIONS[mutationId];
    const ok=window.confirm(
      "สืบทอด "+mutation.icon+" "+mutation.name+" ไปยัง "+padId(target.charId)+
      "\nใช้ Donor "+donors.length+" ใบ · โอกาสสำเร็จ "+(chance*100).toFixed(chance<.1?1:0)+"%"+
      "\n\nDonor ทุกใบจะถูกใช้และหายไป แม้การสืบทอดล้มเหลว ต้องการดำเนินการไหม?"
    );
    if(!ok)return;

    const donorIds=new Set(donors.map(d=>d.uid));
    state.cards=state.cards.filter(c=>!donorIds.has(c.uid));
    const success=Math.random()<chance;
    if(success){
      if(!Number(target.mutation))target.mutation=mutationId;
      else target.mutation2=mutationId;
      recordCardInIndex(target);
    }

    normalizeSlots();
    closeMutationLab();
    if(success){
      toast("🧬 สืบทอดสำเร็จ! "+mutation.icon+" "+mutation.name+" → "+padId(target.charId),true);
    }else{
      toast("สืบทอดไม่สำเร็จ · Donor ถูกใช้ไป "+donors.length+" ใบ");
    }
    renderAll();
    if(gameToken)publishPublicBase();
  }

  function mutationCleanseCandidateEligible(card,target){
    if(!card||!target||card.uid===target.uid)return false;
    if(Number(card.charId)!==Number(target.charId)||Number(card.tier)!==Number(target.tier))return false;
    if(card.locked||state.placed.includes(card.uid)||cardIsTradeLocked(card))return false;
    if(state.gradeAuto&&state.gradeAuto.uid===card.uid)return false;
    return true;
  }

  function mutationCleanseCandidates(target){
    if(!target)return [];
    return state.cards
      .filter(c=>mutationCleanseCandidateEligible(c,target))
      .sort((a,b)=>
        a.grade-b.grade||
        a.level-b.level||
        cardMutationIds(a).length-cardMutationIds(b).length||
        awakeningStars(a)-awakeningStars(b)||
        a.uid-b.uid
      );
  }

  function mutationCleanseCost(card){
    if(!card)return 0;
    const tier=Math.max(0,Math.min(TIERS.length-1,Number(card.tier)||0));
    const grade=mutationGradeIndex(card);
    const awaken=Math.min(10,awakeningStars(card));
    const seconds=180+(tier*25)+(grade*12)+(awaken*30);
    return roundUpNice(Math.min(MONEY_CAP,modeledBaseIncomeForShop()*seconds));
  }

  function openMutationCleanse(uid){
    const target=state.cards.find(c=>c.uid===uid);if(!target)return;
    if(cardIsTradeLocked(target)){toast("การ์ดนี้ถูกล็อกไว้ใน Trade");return}
    if(state.gradeAuto&&state.gradeAuto.uid===target.uid){toast("หยุด Auto Grade ของใบนี้ก่อนล้าง Mutation");return}
    if(!cardMutationIds(target).length){toast("การ์ดใบนี้ยังไม่มี Mutation ให้ล้าง");return}
    mutationCleanseTargetUid=uid;
    if($("#standModal")?.classList.contains("show"))closeStand();
    const modal=$("#mutationCleanseModal");
    modal.classList.add("show");modal.setAttribute("aria-hidden","false");
    renderMutationCleanse();
  }

  function closeMutationCleanse(){
    const modal=$("#mutationCleanseModal");
    if(modal){modal.classList.remove("show");modal.setAttribute("aria-hidden","true")}
    mutationCleanseTargetUid=null;
  }

  function renderMutationCleanse(){
    const target=state.cards.find(c=>c.uid===mutationCleanseTargetUid);
    if(!target){closeMutationCleanse();return}
    const ids=cardMutationIds(target),cost=mutationCleanseCost(target),g=GRADES[target.grade],t=TIERS[target.tier];
    $("#mutationCleanseTarget").innerHTML=
      '<div class="mutation-lab-target-card">'+tradeCardVisual(target,true)+'</div>'+
      '<div class="mutation-lab-target-copy"><span>MAIN CARD · KEEP ALL INVESTMENT</span><strong>'+escapeHtml(cardName(target.charId))+' · '+padId(target.charId)+'</strong>'+
      '<small>'+t.name+' · Grade '+g.name+' · Lv.'+target.level+' · Awaken ★'+awakeningStars(target)+' · '+escapeHtml(mutationNames(target))+'</small></div>';

    $("#mutationCleanseMutationList").innerHTML=ids.map(id=>{
      const m=MUTATIONS[id],checked=ids.length===1?' checked':'';
      return '<label class="mutation-cleanse-option" style="--mutation:'+m.color+'">'+
        '<input type="radio" name="mutation-cleanse-id" data-cleanse-mutation="'+id+'"'+checked+'>'+
        '<span><b>'+m.icon+' '+escapeHtml(m.name)+'</b><small>Income ×'+m.income.toFixed(2)+' · Luck ×'+m.luck.toFixed(3).replace(/0+$/,"").replace(/\.$/,"")+'</small></span>'+
      '</label>';
    }).join("");

    const donors=mutationCleanseCandidates(target);
    $("#mutationCleanseDonors").innerHTML=donors.length?donors.map(c=>{
      const cg=GRADES[c.grade];
      return '<label class="mutation-cleanse-donor">'+
        '<input type="radio" name="mutation-cleanse-donor" data-cleanse-donor="'+c.uid+'">'+
        '<span class="mutation-cleanse-donor-id">'+padId(c.charId)+'</span>'+
        '<span><b>'+TIERS[c.tier].name+' · Grade '+cg.name+' · Lv.'+c.level+'</b><small>'+escapeHtml(mutationNames(c))+' · Awaken ★'+awakeningStars(c)+'</small></span>'+
      '</label>';
    }).join(""):'<div class="social-empty">ไม่มีใบซ้ำ '+padId(target.charId)+' · '+escapeHtml(t.name)+' ที่ว่างอยู่</div>';

    $("#mutationCleanseCost").textContent=fmt(cost);
    $("#mutationCleanseMoney").textContent=fmt(state.money);
    updateMutationCleanseState();
  }

  function updateMutationCleanseState(){
    const target=state.cards.find(c=>c.uid===mutationCleanseTargetUid);
    const mutationInput=document.querySelector('#mutationCleanseMutationList input[data-cleanse-mutation]:checked');
    const donorInput=document.querySelector('#mutationCleanseDonors input[data-cleanse-donor]:checked');
    const cost=mutationCleanseCost(target);
    const enough=!!target&&state.money>=cost;
    const btn=$("#mutationCleanseConfirm");
    if(btn)btn.disabled=!target||!mutationInput||!donorInput||!enough;
    const hint=$("#mutationCleanseHint");
    if(!hint)return;
    if(!target){hint.textContent="ไม่พบการ์ดเป้าหมาย";return}
    if(!mutationInput){hint.textContent="เลือก Mutation ที่ต้องการล้าง";return}
    if(!donorInput){hint.textContent="ต้องใช้ใบซ้ำ Character เดียวกัน + Tier เดียวกัน 1 ใบ";return}
    if(!enough){hint.textContent="เงินไม่พอ · ต้องใช้ "+fmt(cost);return}
    hint.textContent="พร้อมล้าง · ใบซ้ำจะหาย 1 ใบ และ Mutation ที่เลือกจะถูกลบ";
  }

  function performMutationCleanse(){
    const target=state.cards.find(c=>c.uid===mutationCleanseTargetUid);
    const mutationId=Number(document.querySelector('#mutationCleanseMutationList input[data-cleanse-mutation]:checked')?.dataset.cleanseMutation)||0;
    const donorUid=Number(document.querySelector('#mutationCleanseDonors input[data-cleanse-donor]:checked')?.dataset.cleanseDonor)||0;
    const donor=state.cards.find(c=>c.uid===donorUid);
    if(!target||!mutationId||!donor)return;
    if(mutationEventBusy){toast("กำลัง Sync Mutation Event · ลองอีกครั้งในอีกแป๊บ");return}
    if(!cardMutationIds(target).includes(mutationId)){toast("Mutation ที่เลือกเปลี่ยนไปแล้ว");renderMutationCleanse();return}
    if(!mutationCleanseCandidateEligible(donor,target)){toast("ใบซ้ำที่เลือกไม่พร้อมใช้งานแล้ว");renderMutationCleanse();return}

    const cost=mutationCleanseCost(target);
    if(state.money<cost){toast("เงินไม่พอ · ต้องใช้ "+fmt(cost));renderMutationCleanse();return}
    const mutation=MUTATIONS[mutationId];
    const ok=window.confirm(
      "ล้าง "+mutation.icon+" "+mutation.name+" ออกจาก "+padId(target.charId)+
      "\nใช้ใบซ้ำ "+padId(donor.charId)+" · "+TIERS[donor.tier].name+" จำนวน 1 ใบ"+
      "\nใช้เงิน "+fmt(cost)+
      "\n\nGrade / Level / Awakening ของการ์ดเมนจะคงเดิม แต่ใบซ้ำจะหายถาวร ต้องการดำเนินการไหม?"
    );
    if(!ok)return;

    state.money=clampMoney(state.money-cost);
    state.cards=state.cards.filter(c=>c.uid!==donor.uid);
    if(Number(target.mutation)===mutationId){
      target.mutation=Number(target.mutation2)||0;
      target.mutation2=0;
    }else if(Number(target.mutation2)===mutationId){
      target.mutation2=0;
    }
    normalizeSlots();
    recordCardInIndex(target);
    closeMutationCleanse();
    toast("🧹 ล้าง "+mutation.icon+" "+mutation.name+" ออกแล้ว · การ์ดเมนยังอยู่ครบ ✨",true);
    renderAll();
    save();
    if(gameToken)void publishPublicBase();
  }

  function openGradeAuto(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    if(cardIsTradeLocked(c)){toast("การ์ดนี้ถูกล็อกไว้ใน Trade");return}
    if(state.gradeAuto&&state.gradeAuto.uid!==uid){
      toast("มี Auto Grade อีกใบกำลังทำงานอยู่ · หยุดใบนั้นก่อน");
      return;
    }
    gradeAutoSetupUid=uid;
    const g=GRADES[c.grade];
    $("#gradeAutoCardInfo").innerHTML='<strong>'+padId(c.charId)+' · '+TIERS[c.tier].name+'</strong>'+
      '<span>Grade ปัจจุบัน '+g.name+' · '+fmt(rerollCost(c))+' ต่อครั้ง</span>';

    const activeTargets=state.gradeAuto&&state.gradeAuto.uid===uid&&Array.isArray(state.gradeAuto.targets)
      ? state.gradeAuto.targets
      : GRADES.map((_,i)=>i).filter(i=>i>c.grade);

    const gOdds=gradeOdds();
    $("#gradeTargetList").innerHTML=GRADES.map((x,i)=>
      '<label class="grade-target-option grade-shell-'+i+'" style="--grade:'+x.color+'">'+
        '<input type="checkbox" data-grade-target="'+i+'" '+(activeTargets.includes(i)?'checked':'')+'>'+
        '<span><b>'+x.name+'</b><small>'+chanceText(gOdds[i])+'</small></span>'+
      '</label>'
    ).join("");
    updateGradeTargetChance();

    $("#startGradeAutoBtn").hidden=!!state.gradeAuto;
    $("#stopGradeAutoBtn").hidden=!state.gradeAuto;
    $("#gradeAutoModal").classList.add("show");
    $("#gradeAutoModal").setAttribute("aria-hidden","false");
  }

  function closeGradeAuto(){
    $("#gradeAutoModal").classList.remove("show");
    $("#gradeAutoModal").setAttribute("aria-hidden","true");
    gradeAutoSetupUid=null;
  }

  function selectedGradeTargets(){
    return [...document.querySelectorAll('#gradeTargetList input[data-grade-target]:checked')]
      .map(input=>Number(input.dataset.gradeTarget))
      .filter(i=>Number.isInteger(i)&&i>=0&&i<GRADES.length);
  }

  function updateGradeTargetChance(){
    const out=$("#gradeTargetChance");if(!out)return;
    const targets=selectedGradeTargets(),odds=gradeOdds();
    const chance=targets.reduce((sum,i)=>sum+(odds[i]||0),0);
    if(!targets.length){out.textContent="เลือก Grade เพื่อดูโอกาสรวม";return}
    const expected=chance>0?1/chance:Infinity;
    out.innerHTML='<strong>โอกาสรวม '+chanceText(chance)+'/ครั้ง</strong><span>เฉลี่ยประมาณ 1 ใน '+(expected>=1000?fmt(expected):expected.toFixed(expected>=100?0:expected>=10?1:2))+' ครั้ง</span>';
  }

  function startGradeAuto(){
    const c=state.cards.find(x=>x.uid===gradeAutoSetupUid);if(!c)return;
    const targets=selectedGradeTargets();
    if(!targets.length){toast("ติ๊ก Grade เป้าหมายอย่างน้อย 1 ระดับก่อน");return}
    if(targets.includes(c.grade)){
      toast("Grade ปัจจุบัน "+GRADES[c.grade].name+" อยู่ในเป้าหมายที่ติ๊กไว้แล้ว");
      return;
    }
    const cost=rerollCost(c);
    const targetNames=targets.map(i=>GRADES[i].name).join(", ");
    const ok=window.confirm(
      "เริ่ม Auto Grade "+padId(c.charId)+
      "\nหยุดเมื่อเจอ: "+targetNames+
      "\nค่าใช้จ่ายคงที่ "+fmt(cost)+" ต่อครั้ง"+
      "\n\nGrade จะเปลี่ยนทุกครั้ง แม้ต่ำลง และระบบจะสุ่มจนเจอหนึ่งใน Grade ที่เลือกไว้หรือเงินไม่พอ ต้องการเริ่มไหม?"
    );
    if(!ok)return;
    state.gradeAuto={uid:c.uid,targets:[...new Set(targets)],nextAt:Date.now(),startedAt:Date.now()};
    closeGradeAuto();
    toast("เริ่ม Auto Grade → "+targetNames);
    save();
    processGradeAuto();
  }

  function stopGradeAuto(message="หยุด Auto Grade แล้ว"){
    if(!state.gradeAuto)return;
    const uid=state.gradeAuto.uid;
    state.gradeAuto=null;
    clearTimeout(gradeTimer);
    toast(message);
    commitCardMicroUpdate(uid);
  }

  function processGradeAuto(){
    clearTimeout(gradeTimer);
    const job=state.gradeAuto;
    if(!job)return;
    accrueIncomeToNow();
    const c=state.cards.find(x=>x.uid===job.uid);
    if(!c){stopGradeAuto("ไม่พบการ์ด · Auto Grade หยุดแล้ว");return}

    const targets=Array.isArray(job.targets)
      ? job.targets.filter(i=>Number.isInteger(i)&&i>=0&&i<GRADES.length)
      : Number.isInteger(job.target) ? [job.target] : [];

    if(!targets.length){stopGradeAuto("ไม่มี Grade เป้าหมาย · Auto Grade หยุดแล้ว");return}
    if(targets.includes(c.grade)){stopGradeAuto("ได้ Grade "+GRADES[c.grade].name+" แล้ว! ✨");return}

    const now=Date.now();
    let loops=0;
    while(state.gradeAuto&&now>=state.gradeAuto.nextAt&&loops<1000){
      const cost=rerollCost(c);
      if(state.money<cost){
        const latest=GRADES[c.grade].name;
        state.gradeAuto=null;
        toast("เงินไม่พอ · Auto Grade หยุดที่ "+latest);
        break;
      }
      state.money-=cost;
      c.grade=randomGrade();
      loops++;
      if(targets.includes(c.grade)){
        state.gradeAuto=null;
        toast("Auto Grade สำเร็จ: "+GRADES[c.grade].name+" ✨",true);
        break;
      }
      job.nextAt+=GRADE_ROLL_MS;
    }

    commitCardMicroUpdate(c.uid);

    if(state.gradeAuto){
      const delay=Math.max(20,Math.min(250,state.gradeAuto.nextAt-Date.now()));
      gradeTimer=setTimeout(processGradeAuto,delay);
    }
  }

  function toggleLock(uid){const c=state.cards.find(x=>x.uid===uid);if(!c)return;if(cardIsTradeLocked(c)){toast("การ์ดนี้ถูกล็อกไว้ใน Trade");return}c.locked=!c.locked;renderAll()}
  function sellCard(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c||c.locked||cardIsTradeLocked(c)||state.placed.includes(uid))return;
    const value=sellValue(c);state.money=clampMoney(state.money+value);state.cards=state.cards.filter(x=>x.uid!==uid);toast("ขายการ์ดแล้ว +"+fmt(value));renderAll();
  }

  function doRebirth(){
    if(state.baseLevel>=ASCENSION_LEVEL_CAP){toast("ถึง Lv.40 แล้ว · ใช้ ASCENSION เพื่อจุติรอบใหม่");return}
    if(idPackAutoIndex!==null)stopIdPackAuto("Auto ID Pack หยุดเพราะ Rebirth");
    const cost=rebirthCost();
    if(state.money<cost){toast("เงินยังไม่พอสำหรับ Rebirth");return}
    const oldMax=maxTierForLevel(state.baseLevel);
    state.money=0;
    state.baseLevel++;
    normalizeSlots();
    const newMax=maxTierForLevel(state.baseLevel);
    const unlockText=newMax>oldMax?" · ปลด "+TIERS[newMax-1].name+"!":" · Luck สูงขึ้น!";
    toast("Rebirth สำเร็จ! ฐาน Lv."+state.baseLevel+unlockText,true);
    renderAll();
  }

  function accrueIncomeToNow(){
    const now=Date.now();
    const dt=Math.max(0,(now-(state.lastTick||now))/1000);
    if(dt>0){
      state.money=clampMoney(state.money+totalIncome()*dt);
      state.lastTick=now;
    }
    return dt;
  }

  function economyTick(){
    if(accrueIncomeToNow()>0){
      renderHeader();renderRebirth();
      if(Math.random()<0.15)saveLocalOnly();
    }
  }

  function bind(){
    $$(".tab").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".tab").forEach(x=>x.classList.remove("active"));$$(".panel").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");$("#panel-"+btn.dataset.tab).classList.add("active");
      if(btn.dataset.tab==="collection")renderCollection();
      if(btn.dataset.tab==="lounge")renderLounge();
      if(btn.dataset.tab==="index")renderCardIndex();
      if(btn.dataset.tab==="online"){
        void maybeRequestTradeNotificationPermission();
        refreshOnline();
      }
    }));
    $("#loungeSoundBtn")?.addEventListener("click",()=>{
      loungeEnsureState();
      state.lounge.sound=!state.lounge.sound;
      if(state.lounge.sound){playChibiSfx("heart");toast("เปิดเสียงจิบิแล้ว 🔊")}
      else toast("ปิดเสียงจิบิแล้ว 🔇");
      renderLounge();save();
    });
    $("#loungeThemeBtn")?.addEventListener("click",()=>{
      loungeEnsureState();state.lounge.theme=state.lounge.theme==="day"?"night":"day";renderLounge();save();
    });
    $("#loungeCardPicker")?.addEventListener("click",e=>{
      const pick=e.target.closest("[data-lounge-pick]");if(!pick)return;
      loungeEnsureState();
      const uid=Number(pick.dataset.loungePick);
      if(state.lounge.selected.includes(uid))state.lounge.selected=state.lounge.selected.filter(x=>x!==uid);
      else if(state.lounge.selected.length<5)state.lounge.selected.push(uid);
      else{toast("ห้องเต็มแล้ว · สูงสุด 5 จิบิ 😆");return}
      playChibiSfx("boop");renderLounge();save();
    });
    $("#loungeBuddies")?.addEventListener("click",e=>{
      const buddy=e.target.closest("[data-lounge-uid]");if(buddy)loungeReact(Number(buddy.dataset.loungeUid),"click");
    });
    $("#loungePatBtn")?.addEventListener("click",()=>{
      const cards=loungeSelectedCards();if(!cards.length){toast("ยังไม่มีจิบิในห้อง");return}
      loungeReact(cards[Math.floor(Math.random()*cards.length)].uid,"pat");
    });
    $("#loungeSnackBtn")?.addEventListener("click",()=>{
      const cards=loungeSelectedCards();if(!cards.length){toast("ยังไม่มีจิบิในห้อง");return}
      cards.forEach((card,i)=>setTimeout(()=>loungeReact(card.uid,"snack",i>0),i*180));
    });
    $("#loungeNapBtn")?.addEventListener("click",()=>{
      const cards=loungeSelectedCards();if(!cards.length){toast("ยังไม่มีจิบิในห้อง");return}
      cards.forEach((card,i)=>setTimeout(()=>loungeReact(card.uid,"nap",i>0),i*220));
    });
    $("#loungePartyBtn")?.addEventListener("click",loungeParty);
    $("#youtubeSearchBtn")?.addEventListener("click",()=>{
      const q=$("#youtubeSearchInput").value.trim();if(!q){toast("พิมพ์ชื่อเพลงก่อน");return}
      window.open("https://www.youtube.com/results?search_query="+encodeURIComponent(q),"_blank","noopener,noreferrer");
    });
    $("#youtubeSearchInput")?.addEventListener("keydown",e=>{if(e.key==="Enter")$("#youtubeSearchBtn").click()});
    $("#youtubeLoadBtn")?.addEventListener("click",()=>loungeLoadYouTube($("#youtubeUrlInput").value));
    $("#youtubeUrlInput")?.addEventListener("keydown",e=>{if(e.key==="Enter")loungeLoadYouTube(e.currentTarget.value)});
    $("#youtubeStopBtn")?.addEventListener("click",()=>{
      loungeEnsureState();state.lounge.music.current="";renderLoungeMusic();save();
    });
    $("#youtubeClearHistoryBtn")?.addEventListener("click",()=>{
      loungeEnsureState();state.lounge.music.history=[];renderLoungeMusic();save();
    });
    $("#youtubeHistory")?.addEventListener("click",e=>{
      const btn=e.target.closest("[data-youtube-history]");if(!btn)return;
      const url=state.lounge.music.history[Number(btn.dataset.youtubeHistory)];if(url)loungeLoadYouTube(url);
    });
    $("#settingsBtn").addEventListener("click",openSettings);
    $("#closeSettingsModal").addEventListener("click",closeSettings);
    $("[data-close-settings]").addEventListener("click",closeSettings);
    $("#particlesToggle").addEventListener("change",e=>setParticlesEnabled(e.currentTarget.checked));
    $("#tradeNotifyToggle")?.addEventListener("change",e=>{void setTradeNotificationsEnabled(e.currentTarget.checked)});
    if("serviceWorker" in navigator){
      navigator.serviceWorker.addEventListener("message",event=>{
        if(event.data?.type==="cardbase:open-trades")openTradeCenter();
      });
    }
    $("#accountBtn").addEventListener("click",openAuth);
    $("#closeAuthModal").addEventListener("click",closeAuth);
    $("[data-close-auth]").addEventListener("click",closeAuth);
    $("#loginBtn").addEventListener("click",loginAccount);
    $("#signupBtn").addEventListener("click",signupAccount);
    $("#logoutBtn").addEventListener("click",logoutAccount);
    $("#recoverBtn").addEventListener("click",recoverAccount);
    $("#authPassword").addEventListener("keydown",e=>{if(e.key==="Enter")loginAccount()});
    $("#authPasswordConfirm").addEventListener("keydown",e=>{if(e.key==="Enter")signupAccount()});
    $("#onlineLoginBtn").addEventListener("click",openAuth);
    $("#ascendBtn")?.addEventListener("click",claimAscension);
    $$("[data-asc-perk]").forEach(btn=>btn.addEventListener("click",()=>buyAscensionPerk(btn.dataset.ascPerk)));
    $("#towerChallengeBtn")?.addEventListener("click",challengeTower);
    $("#towerCoreBtn")?.addEventListener("click",forgeTowerCore);
    $("#refreshOnlineBtn").addEventListener("click",refreshOnline);
    $("#saveOnlineNameBtn").addEventListener("click",saveOnlineName);
    $("#playerSearchBtn").addEventListener("click",searchPlayers);
    $("#playerSearchInput").addEventListener("keydown",e=>{if(e.key==="Enter")searchPlayers()});
    $("#closeSocialBaseModal").addEventListener("click",closeSocialBase);
    $("[data-close-social-base]").addEventListener("click",closeSocialBase);
    document.addEventListener("click",e=>{
      const btn=e.target.closest("[data-social-action]");if(!btn)return;
      const action=btn.dataset.socialAction;
      if(action==="visit")visitPlayerBase(btn.dataset.user);
      if(action==="add")sendFriendRequest(btn.dataset.user);
      if(action==="accept")acceptFriend(btn.dataset.friend);
      if(action==="remove")removeFriend(btn.dataset.friend);
      if(action==="trade")openTradeOffer(btn.dataset.user);
    });
    $("#refreshTradesBtn").addEventListener("click",async()=>{await flushCloudSave();await refreshTrades()});
    $("#closeTradeModal").addEventListener("click",closeTrade);
    $("[data-close-trade]").addEventListener("click",closeTrade);
    $("#tradeConfirmBtn").addEventListener("click",confirmTrade);
    $("#tradeCardPicker").addEventListener("click",e=>{
      const pick=e.target.closest("[data-trade-card]");if(!pick)return;
      tradeModalState.selectedGid=pick.dataset.tradeCard;
      renderTradePicker();
    });
    document.addEventListener("click",e=>{
      const btn=e.target.closest("[data-trade-action]");if(!btn)return;
      const action=btn.dataset.tradeAction,tradeId=btn.dataset.trade;
      if(action==="accept-open")openTradeAccept(tradeId);
      if(action==="decline")declineTrade(tradeId);
      if(action==="cancel")cancelTrade(tradeId);
    });
    $("#rollBtn").addEventListener("click",manualRoll);$("#autoBtn").addEventListener("click",toggleAuto);$("#fullAutoBtn").addEventListener("click",toggleFullAuto);$("#packCard").addEventListener("click",openPack);
    $("#storedPacks").addEventListener("click",e=>{const b=e.target.closest("[data-open-stored-tier]");if(b)openStoredPack(Number(b.dataset.openStoredTier))});
    $("#idPackShop").addEventListener("click",e=>{
      const page=e.target.closest("[data-id-pack-page]");
      if(page&&!page.disabled){
        idPackPage=Math.max(0,Number(page.dataset.idPackPage)||0);
        renderIdPackShop();
        return;
      }
      const auto=e.target.closest("[data-auto-id-pack]");
      if(auto){
        toggleIdPackAuto(Number(auto.dataset.autoIdPack));
        return;
      }
      const buy=e.target.closest("[data-buy-id-pack]");
      if(buy)buyIdPack(Number(buy.dataset.buyIdPack));
    });
    $("#rotatingPackGrid").addEventListener("click",e=>{
      const buy=e.target.closest("[data-buy-rot-pack]");
      if(buy)buyRotatingPack(buy.dataset.buyRotPack);
    });
    $("#closeMutationLabModal").addEventListener("click",closeMutationLab);$("[data-close-mutation-lab]").addEventListener("click",closeMutationLab);
    $("#mutationLabType").addEventListener("change",()=>renderMutationLabDonors(true));
    $("#mutationLabDonors").addEventListener("change",updateMutationLabChance);
    $("#mutationLabBestDonors").addEventListener("click",mutationLabSelectBest);
    $("#mutationLabClear").addEventListener("click",()=>{
      document.querySelectorAll('#mutationLabDonors input[data-mutation-donor]').forEach(input=>input.checked=false);
      updateMutationLabChance();
    });
    $("#mutationLabConfirm").addEventListener("click",performMutationInheritance);
    $("#closeMutationCleanseModal").addEventListener("click",closeMutationCleanse);
    $("[data-close-mutation-cleanse]").addEventListener("click",closeMutationCleanse);
    $("#mutationCleanseCancel").addEventListener("click",closeMutationCleanse);
    $("#mutationCleanseMutationList").addEventListener("change",updateMutationCleanseState);
    $("#mutationCleanseDonors").addEventListener("change",updateMutationCleanseState);
    $("#mutationCleanseConfirm").addEventListener("click",performMutationCleanse);
    $("#closeGradeAutoModal").addEventListener("click",closeGradeAuto);$("[data-close-grade-auto]").addEventListener("click",closeGradeAuto);
    $("#startGradeAutoBtn").addEventListener("click",startGradeAuto);$("#stopGradeAutoBtn").addEventListener("click",()=>stopGradeAuto());
    $("#gradeTargetList").addEventListener("change",updateGradeTargetChance);
    $("#gradeSelectHighBtn").addEventListener("click",()=>{
      document.querySelectorAll('#gradeTargetList input[data-grade-target]').forEach(input=>{
        input.checked=Number(input.dataset.gradeTarget)>=4;
      });
      updateGradeTargetChance();
    });
    $("#gradeClearTargetsBtn").addEventListener("click",()=>{
      document.querySelectorAll('#gradeTargetList input[data-grade-target]').forEach(input=>input.checked=false);
      updateGradeTargetChance();
    });
    $("#closeReveal").addEventListener("click",closeReveal);$("#closeStandModal").addEventListener("click",closeStand);$("[data-close-modal]").addEventListener("click",closeStand);
    $("#searchId").addEventListener("input",renderCollection);$("#sortCards").addEventListener("change",renderCollection);
    $("#indexSearch").addEventListener("input",renderCardIndex);$("#indexFilter").addEventListener("change",renderCardIndex);
    $("#rebirthBtn").addEventListener("click",doRebirth);
    $("#autoEquipBestBtn")?.addEventListener("click",autoEquipBest);
    $("#tierFilters").addEventListener("change",e=>{
      const input=e.target.closest("input[data-tier]");if(!input)return;
      const tier=Number(input.dataset.tier);
      if(input.checked&&!state.autoTargets.includes(tier))state.autoTargets.push(tier);
      if(!input.checked)state.autoTargets=state.autoTargets.filter(x=>x!==tier);
      if(!state.autoTargets.length&&(state.autoRolling||state.fullAuto)){
        state.autoRolling=false;state.fullAuto=false;state.rollingUntil=0;setPackAutoSession(false);clearTimeout(autoTimer);
        toast("ไม่มี Tier เป้าหมาย · หยุด Auto แล้ว");
      }
      renderFilters();renderPack();updateRollProgress();save();
    });
    $("#clearFilters").addEventListener("click",()=>{state.autoTargets=[];if(state.autoRolling||state.fullAuto){state.autoRolling=false;state.fullAuto=false;state.rollingUntil=0;setPackAutoSession(false);clearTimeout(autoTimer)}renderFilters();renderPack();updateRollProgress();save()});
    $("#selectUnlocked").addEventListener("click",()=>{state.autoTargets=Array.from({length:maxTierForLevel()},(_,i)=>i);renderFilters();save()});
    document.addEventListener("keydown",e=>{
      if(e.key==="1"&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)&&!state.autoRolling&&!state.fullAuto)manualRoll();
      if(e.key==="Escape"){closeReveal();closeStand();closeAuth();closeSettings();closeSocialBase();closeMutationLab();closeMutationCleanse();closeGradeAuto();closeTrade()}
    });
    window.addEventListener("pagehide",flushCloudOnExit);
    window.addEventListener("beforeunload",flushCloudOnExit);
  }

  function init(){
    normalizeSlots();bind();renderSettings();
    if(tradeNotificationsEnabled()&&tradeNotificationPermission()==="granted"){
      void ensureTradeNotificationRegistration();
    }
    const now=Date.now(),offlineSeconds=Math.max(0,(now-(state.lastTick||now))/1000);
    if(offlineSeconds>2&&state.placed.some(Boolean)){const gain=totalIncome()*offlineSeconds;state.money=clampMoney(state.money+gain);toast("รับรายได้ออฟไลน์ "+fmt(Math.min(MONEY_CAP,gain)))}
    state.lastTick=now;renderAll();updateRollProgress();
    if((state.autoRolling||state.fullAuto)&&packAutoSessionActive()){
      if(!state.rollingUntil)state.rollingUntil=Date.now()+ROLL_MS;
      processRollEngine();
    }else{
      state.rollingUntil=0;
      setPackAutoSession(false);
    }
    setInterval(economyTick,1000);
    onlineHeartbeatTimer=setInterval(()=>{if(gameToken)heartbeatOnline()},30000);
    mutationEventTimer=setInterval(renderMutationEvent,1000);
    rotatingShopTimer=setInterval(renderRotatingShopClock,1000);
    loungeAmbientTimer=setTimeout(loungeAmbientEvent,7000);
    const catchUpActiveSystems=()=>{
      accrueIncomeToNow();
      if(state.rollingUntil)processRollEngine();
      if(state.gradeAuto)processGradeAuto();
      renderHeader();renderRebirth();
      if(gameToken)heartbeatOnline()
    };
    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="hidden"){
        if(state.autoRolling||state.fullAuto)setPackAutoSession(true);
        flushCloudOnExit();
      }else{
        catchUpActiveSystems();
      }
    });
    window.addEventListener("focus",catchUpActiveSystems);
    initCloud();
    if(new URLSearchParams(location.search).get("open")==="trades"){
      setTimeout(()=>{
        openTradeCenter();
        try{
          const clean=location.pathname+location.hash;
          history.replaceState(null,"",clean);
        }catch{}
      },350);
    }
  }

  init();
})();
