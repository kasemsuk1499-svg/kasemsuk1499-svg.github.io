(() => {
  "use strict";

  const SAVE_KEY = "card-base-prototype-v01";
  const CARD_MIN_ID = 1;
  const CARD_MAX_ID = 46;
  const ROLL_MS = 3500;
  const SUPABASE_URL = "https://qlaykelpabbjojpqjfwi.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_KBWwFJ2v26lLH8UVoNIZ9Q_MtWguO29";
  const CLOUD_TABLE = "card_base_saves";
  const GAME_SESSION_KEY = "card-base-username-session-v1";
  const PACK_AUTO_SESSION_KEY = "card-base-pack-auto-session-v1";
  const GRADE_ROLL_MS = 450;

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
    {name:"Eternal",color:"#fff0a8",multi:200}
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
    {name:"SSS★",color:"#fff2a9",multi:5.00}
  ];

  const GRADE_REROLL_COSTS = [1000,2000,3000,5500,10000,18000,32000,60000,110000,200000];
  const GRADE_WEIGHTS = [44,25,14,7,4,2.5,1.5,.8,.18,.02];

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

  const newState = () => ({
    money:0, baseLevel:1, cards:[], placed:[],
    currentPack:null, rollingUntil:0, lastTick:Date.now(), uidCounter:1,
    autoTargets:[], autoRolling:false, fullAuto:false, targetFound:false,
    storedPacks:[], packUidCounter:1, gradeAuto:null
  });

  let state = load();
  let activeStand = null;
  let rollFrame = 0;
  let autoTimer = 0;
  let gradeTimer = 0;
  let gradeAutoSetupUid = null;
  let supabaseClient = null;
  let gameToken = localStorage.getItem(GAME_SESSION_KEY) || null;
  let gameAccount = null;
  let cloudReady = false;
  let cloudLoading = false;
  let cloudTimer = 0;
  let onlineProfile = null;
  let onlineHeartbeatTimer = 0;
  let onlineCache = {online:[],requests:[],friends:[],leaders:[],myRank:null,totalPlayers:0};
  let socialProfiles = new Map();
  let tradeCache = {incoming:[],outgoing:[],recent:[]};
  let tradeLockedGids = new Set();
  let tradeModalState = {mode:null,targetId:null,tradeId:null,selectedGid:null};
  let tradeBusy = false;
  let authRequestBusy = false;

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

  function hydrateState(parsed){
    const s={...newState(),...(parsed||{})};
    s.cards=(Array.isArray(s.cards)?s.cards:[])
      .filter(c=>Number.isInteger(c.charId)&&c.charId>=CARD_MIN_ID&&c.charId<=CARD_MAX_ID)
      .map(c=>({...c,gid:validCardGid(c.gid)?c.gid:makeCardGid()}));
    s.autoTargets=(Array.isArray(s.autoTargets)?s.autoTargets:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<10);
    s.storedPacks=(Array.isArray(s.storedPacks)?s.storedPacks:[]).filter(p=>p&&Number.isInteger(p.tier)&&p.tier>=0&&p.tier<10);
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

  function scheduleCloudSave(){
    if(!cloudReady||cloudLoading||!gameToken||!supabaseClient)return;
    clearTimeout(cloudTimer);
    cloudTimer=setTimeout(()=>flushCloudSave(),900);
    updateSyncUi("syncing");
  }

  async function rpc(name,args={}){
    if(!supabaseClient)return {ok:false,error:"cloud_unavailable",message:"Cloud ยังไม่พร้อม"};
    const {data,error}=await supabaseClient.rpc(name,args);
    if(error){
      console.error("RPC "+name+" failed",error);
      return {ok:false,error:"rpc_error",message:error.message||"Cloud error"};
    }
    return data&&typeof data==="object"?data:{ok:false,error:"invalid_response"};
  }

  function clearGameSession(){
    gameToken=null;gameAccount=null;onlineProfile=null;cloudReady=false;cloudLoading=false;
    localStorage.removeItem(GAME_SESSION_KEY);
    renderAuth();renderOnlineShell();updateSyncUi("local");
  }

  async function flushCloudSave(){
    if(!cloudReady||cloudLoading||!gameToken||!supabaseClient)return;
    clearTimeout(cloudTimer);
    const snapshot=JSON.parse(JSON.stringify(cloudPayload()));
    const result=await rpc("cb_save_state",{p_token:gameToken,p_state:snapshot});
    if(!result.ok){
      if(result.error==="invalid_session")clearGameSession();
      else updateSyncUi("error");
      return;
    }
    updateSyncUi("online");
    publishPublicBase();
  }

  function save(){
    localStorage.setItem(SAVE_KEY,JSON.stringify(state));
    scheduleCloudSave();
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
  function formatDuration(sec){const m=Math.floor(sec/60),s=Math.round(sec%60);return m?m+" นาที "+(s?s+" วิ":""):s+" วิ"}
  function imageFor(id){return "../assets/cards/"+id+".png"}
  function baseIncomeMultiplier(level=state.baseLevel){return 1+(level-1)*0.25}
  function economyScale(level=state.baseLevel){return Math.pow(5,Math.max(0,level-1))}
  function luckValue(level=state.baseLevel){
    const x=Math.max(0,level-1);
    return 1+(0.045*x)+(0.0035*Math.pow(x,1.28));
  }
  function standLimit(level=state.baseLevel){return STANDS[Math.min(39,Math.max(0,level-1))]||50}
  function charBaseIncome(id){return 80+((id*7919+113)%921)}
  function wealthLevel(value){
    if(!Number.isFinite(value)||value<=0)return 0;
    return Math.min(9,Math.max(0,Math.floor(Math.log10(value)/3)));
  }
  function wealthClass(value){return "wealth-value wealth-"+wealthLevel(value)}
  function rankBand(level){return Math.min(5,Math.floor((Math.max(1,level)-1)/4))}
  function rankFxStyle(level){
    const lv=Math.max(1,Math.min(40,Number(level)||1)),fx=TITLE_FX[lv-1];
    return "--rank:"+fx[0]+";--rank2:"+fx[1]+";--rank-glow:"+(10+lv*1.25)+"px;--rank-speed:"+Math.max(1.9,6.4-lv*.11)+"s";
  }
  function rankFxClass(level){return "rank-fx rank-level-"+Math.max(1,Math.min(40,Number(level)||1))+" rank-band-"+rankBand(level)}
  function tierFxClass(tier){return "tier-fx tier-"+Math.max(0,Math.min(9,Number(tier)||0))}
  function gradeFxClass(grade){return "grade-fx grade-"+Math.max(0,Math.min(9,Number(grade)||0))}

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

  function cardIntrinsicIncome(card){
    const tier=TIERS[card.tier],grade=GRADES[card.grade];
    const levelMulti=Math.pow(1.04,Math.max(0,card.level-1));
    return charBaseIncome(card.charId)*tier.multi*grade.multi*levelMulti;
  }

  function cardIncome(card){
    return cardIntrinsicIncome(card)*baseIncomeMultiplier()*economyScale();
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
    return roundUpNice(Math.min(1e300,income*seconds*baseIncomeMultiplier()*economyScale()));
  }

  function rerollCost(card){
    return (GRADE_REROLL_COSTS[card.tier]||GRADE_REROLL_COSTS[0])*economyScale();
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
    const unlockAt=[1,1,1,3,6,10,15,21,28,36];
    let count=0;
    for(const need of unlockAt)if(lv>=need)count++;
    return Math.max(3,Math.min(10,count));
  }
  function tierOdds(level=state.baseLevel){
    const maxTier=maxTierForLevel(level);
    const luck=luckValue(level);
    // ลด power creep: Tier สูงยังมีโอกาสตั้งแต่ปลด แต่ต้องไต่ Luck หลาย Rebirth จึงเห็นผลชัด
    const ratio=Math.min(0.39,0.23+0.075*Math.max(0,luck-1));
    const weights=TIERS.map((_,i)=>i<maxTier?Math.pow(ratio,i):0);
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
    // เงินเป็น gate หลัก: ต้นเกมยังเดินได้ แต่ปลายเกมต้องสะสมจริงและไม่ตันเร็ว
    const x=Math.max(0,level-1);
    return Math.round(240*Math.pow(1.16,x)+35*x);
  }

  function rebirthCost(level=state.baseLevel){
    const x=Math.max(0,level-1);
    const avgCharacterIncome=545;
    // ประเมินว่าผู้เล่นจะปั้นเลเวลและคัดการ์ดดีขึ้นเรื่อย ๆ ไม่ใช่ใช้ค่าเฉลี่ยซองล้วน
    const assumedCardLevel=1+Math.round(x*4.2);
    const optimizationFactor=1+(0.10*x)+(0.018*x*x);
    const expectedCardIncome=
      avgCharacterIncome*
      rebirthExpectedTierMultiplier(level)*
      Math.pow(1.04,assumedCardLevel-1)*
      baseIncomeMultiplier(level);
    const expectedBaseIncome=expectedCardIncome*standLimit(level);
    return roundUpNice(expectedBaseIncome*rebirthTargetSeconds(level)*optimizationFactor*economyScale(level));
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
      if(result.error==="invalid_session")clearGameSession();
      else updateSyncUi("error");
      return;
    }

    if(result.exists&&result.state){
      state=hydrateState(result.state);
      const now=Date.now();
      const offlineSeconds=Math.max(0,(now-(state.lastTick||now))/1000);
      normalizeSlots();
      if(offlineSeconds>2&&state.placed.some(Boolean))state.money+=totalIncome()*offlineSeconds;
      state.lastTick=now;
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
    }else{
      state.lastTick=Date.now();
    }

    cloudLoading=false;cloudReady=true;
    if(!result.exists)await flushCloudSave();
    renderAll();
    updateSyncUi("online");
  }

  async function activateGameSession(token,username,recoveryCode=null){
    gameToken=token;
    localStorage.setItem(GAME_SESSION_KEY,token);
    gameAccount={username};
    renderAuth();
    const me=await fetchMe();
    if(!me){
      clearGameSession();
      setAuthMessage("Session ใช้งานไม่ได้ กรุณาลองเข้าสู่ระบบใหม่","error");
      return false;
    }
    await loadCloudState();
    await publishPublicBase();
    if(recoveryCode)showRecoveryCode(recoveryCode);
    renderAuth();renderOnlineShell();
    return true;
  }

  async function initCloud(){
    if(!window.supabase||typeof window.supabase.createClient!=="function"){
      updateSyncUi("error");
      return;
    }
    supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
    });
    if(gameToken){
      const me=await fetchMe();
      if(me){
        await loadCloudState();
        await publishPublicBase();
      }else{
        clearGameSession();
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
    if(password.length<8||password.length>72){setAuthMessage("รหัสผ่านต้องยาว 8–72 ตัวอักษร","error");return}
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
    if(newPassword.length<8||newPassword.length>72){setAuthMessage("รหัสผ่านใหม่ต้องยาว 8–72 ตัวอักษร","error");return}
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
    await flushCloudSave();
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
      return {slot,charId:c.charId,tier:c.tier,grade:c.grade,level:c.level,income:Math.round(cardIncome(c))};
    }).filter(Boolean);
  }

  async function publishPublicBase(){
    if(!gameToken||!supabaseClient)return;
    const result=await rpc("cb_publish_presence",{
      p_token:gameToken,
      p_base_level:state.baseLevel,
      p_title:TITLES[state.baseLevel-1]||"Collector",
      p_stands:publicStandSnapshot()
    });
    if(!result.ok&&result.error==="invalid_session")clearGameSession();
  }

  async function ensureOnlineProfile(){
    if(!gameToken||!supabaseClient)return null;
    const me=await fetchMe();
    if(me)renderOnlineShell();
    return me;
  }

  async function heartbeatOnline(){
    if(!gameToken||!supabaseClient)return;
    await publishPublicBase();
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
    onlineTitle.textContent=TITLES[state.baseLevel-1]||"Collector";
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
      actions+='<button class="remove" data-social-action="remove" data-friend="'+options.friend.friendship_id+'">ลบเพื่อน</button>';
    }else if(profile.friendship_status){
      actions+='<button disabled>'+(profile.friendship_status==="accepted"?"เพื่อนแล้ว":"มีคำขออยู่")+'</button>';
    }else{
      actions+='<button data-social-action="add" data-user="'+accountId+'">+ เพื่อน</button>';
    }
    const baseText=profile.base_level?"Base Lv."+profile.base_level:"ยังไม่เผยแพร่ฐาน";
    const lv=Number(profile.base_level)||1;
    const rankText=profile.server_rank?'<span class="player-rank-badge">#'+profile.server_rank+'</span>':'';
    const titleText=profile.title?'<span class="rank-title-badge '+rankFxClass(lv)+'" style="'+rankFxStyle(lv)+'">'+escapeHtml(profile.title)+'</span>':'';
    return '<div class="player-row rank-row rank-stage-'+rankBand(lv)+'"><div class="player-main"><strong class="rank-name '+rankFxClass(lv)+'" style="'+rankFxStyle(lv)+'">'+escapeHtml(profile.display_name)+rankText+'</strong>'+
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

  function leaderboardRow(profile){
    const accountId=profile.account_id;
    const isMe=!!gameAccount&&accountId===gameAccount.account_id;
    socialProfiles.set(accountId,profile);
    const rank=Number(profile.server_rank)||0;
    const medal=rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":"#"+rank;
    const rowClass="leaderboard-row"+(rank<=3?" top-"+rank:"")+(isMe?" me":"");
    let actions='<button data-social-action="visit" data-user="'+accountId+'">ดูฐาน</button>';
    if(isMe){
      actions='<button disabled>คุณ</button>';
    }else if(profile.friendship_status){
      actions+='<button disabled>'+(profile.friendship_status==="accepted"?"เพื่อนแล้ว":"มีคำขออยู่")+'</button>';
    }else{
      actions+='<button data-social-action="add" data-user="'+accountId+'">+ เพื่อน</button>';
    }
    const lv=Number(profile.base_level)||1;
    const income=Number(profile.base_income)||0;
    return '<div class="'+rowClass+' rank-row rank-stage-'+rankBand(lv)+'">'+
      '<div class="leaderboard-rank">'+medal+'</div>'+
      '<div class="leaderboard-player"><strong class="rank-name '+rankFxClass(lv)+'" style="'+rankFxStyle(lv)+'">'+escapeHtml(profile.display_name)+'</strong>'+
        '<small><span>#'+escapeHtml(profile.player_code)+'</span><span>Base Lv.'+profile.base_level+'</span>'+(profile.online?'<span>● Online</span>':'')+'</small>'+
        '<span class="rank-title-badge '+rankFxClass(lv)+'" style="'+rankFxStyle(lv)+'">'+escapeHtml(profile.title||"Rookie Collector")+'</span>'+
      '</div>'+
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
  }

  async function refreshOnline(){
    renderOnlineShell();
    if(!gameToken||!supabaseClient)return;
    await publishPublicBase();
    const [socialResult,leaderResult]=await Promise.all([
      rpc("cb_social_snapshot",{p_token:gameToken}),
      rpc("cb_leaderboard",{p_token:gameToken,p_limit:50})
    ]);
    if(!socialResult.ok){
      if(socialResult.error==="invalid_session")clearGameSession();
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

  function renderVisitorIdentity(name,level,title=null){
    const lv=Math.max(1,Math.min(40,Number(level)||1));
    const safeName=escapeHtml(name||"Player");
    const nameEl=$("#socialBaseName"),metaEl=$("#socialBaseMeta");
    nameEl.innerHTML=
      '<span class="visit-player-name '+rankFxClass(lv)+'" style="'+rankFxStyle(lv)+'">'+safeName+'</span>'+
      '<span class="visit-base-suffix">’s Base</span>';
    if(title){
      metaEl.innerHTML=
        '<span class="visit-base-level">Base Lv.'+lv+'</span>'+
        '<span class="rank-title-badge visit-rank-badge '+rankFxClass(lv)+'" style="'+rankFxStyle(lv)+'">'+escapeHtml(title)+'</span>';
    }else{
      metaEl.textContent="กำลังโหลด…";
    }
  }

  async function visitPlayerBase(userId){
    if(!gameToken||!supabaseClient)return;
    const profile=socialProfiles.get(userId);
    renderVisitorIdentity(
      profile?profile.display_name:"Player",
      profile&&profile.base_level?profile.base_level:1,
      profile&&profile.title?profile.title:null
    );
    $("#socialBaseStands").innerHTML="";
    $("#socialBaseModal").classList.add("show");
    $("#socialBaseModal").setAttribute("aria-hidden","false");

    const data=await rpc("cb_visit_base",{p_token:gameToken,p_target:userId});
    if(!data.ok||!data.base_level){
      $("#socialBaseMeta").textContent="ผู้เล่นคนนี้ยังไม่ได้เผยแพร่ฐาน";
      $("#socialBaseStands").innerHTML='<div class="social-empty">ยังไม่มีข้อมูลฐาน</div>';
      return;
    }
    renderVisitorIdentity(data.display_name||"Player",data.base_level,data.title||"Collector");
    const max=STANDS[Math.min(39,Math.max(0,data.base_level-1))]||30;
    const bySlot=new Map((Array.isArray(data.stands)?data.stands:[]).map(x=>[x.slot,x]));
    const wrap=$("#socialBaseStands");
    let html="";
    for(let i=0;i<max;i++){
      const c=bySlot.get(i);
      if(!c){html+='<div class="visitor-stand empty"><span>แท่น '+(i+1)+'</span></div>';continue}
      const t=TIERS[c.tier]||TIERS[0],g=GRADES[c.grade]||GRADES[0];
      html+='<div class="visitor-stand tier-shell tier-'+c.tier+' grade-shell-'+c.grade+'" style="--tier:'+t.color+'"><div class="visitor-card '+tierFxClass(c.tier)+'">'+
        '<img src="'+imageFor(c.charId)+'" alt="'+padId(c.charId)+'"><div class="tier-ring"></div>'+
        '<div class="stand-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div>'+
        '<div class="visitor-meta"><b>'+padId(c.charId)+' · <span class="visitor-tier-name tier-label tier-'+c.tier+'" style="--tier:'+t.color+';color:'+t.color+'">'+t.name+'</span></b><span>Lv.'+c.level+' · '+fmt(c.income||0)+'/s</span></div>'+
        '</div></div>';
    }
    wrap.innerHTML=html;
    wrap.querySelectorAll("img").forEach(img=>img.addEventListener("error",e=>e.currentTarget.style.display="none"));
  }

  function closeSocialBase(){
    $("#socialBaseModal").classList.remove("show");
    $("#socialBaseModal").setAttribute("aria-hidden","true");
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
    $("#luck").textContent="×"+luckValue().toFixed(2);
    titleEl.textContent=TITLES[state.baseLevel-1];
    titleEl.className=rankFxClass(state.baseLevel)+" base-rank-title";
    titleEl.style.cssText=rankFxStyle(state.baseLevel);
    document.body.dataset.rankStage=String(rankBand(state.baseLevel));
    document.body.style.cssText=rankFxStyle(state.baseLevel);
    $("#standCount").textContent=standLimit()+" แท่น";
    $("#incomeMulti").textContent="Income ×"+baseIncomeMultiplier().toFixed(2)+" · Wealth ×"+fmt(economyScale());
  }

  function renderBase(){
    normalizeSlots();
    const wrap=$("#stands"); wrap.innerHTML="";
    for(let i=0;i<standLimit();i++){
      const uid=state.placed[i];
      const c=uid?state.cards.find(x=>x.uid===uid):null;
      const slot=document.createElement("button");
      slot.type="button";
      slot.className="stand"+(c?" tier-shell tier-"+c.tier+" grade-shell-"+c.grade:" empty");
      slot.dataset.slot=i;
      if(!c){
        slot.innerHTML='<span class="stand-number">แท่น '+(i+1)+'</span><div class="empty-stand"><b>＋</b><span>เลือกการ์ดจากคลัง</span></div>';
      }else{
        const t=TIERS[c.tier],g=GRADES[c.grade];
        slot.innerHTML=
          '<span class="stand-number">แท่น '+(i+1)+'</span>'+
          '<div class="mini-card '+tierFxClass(c.tier)+' grade-shell-'+c.grade+'" style="'+tierStyle(c.tier)+'">'+
            '<img src="'+imageFor(c.charId)+'" alt="Card '+padId(c.charId)+'">'+
            '<div class="tier-ring"></div>'+
            '<div class="stand-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div>'+
            '<div class="mini-meta"><b>'+padId(c.charId)+' · '+t.name+'</b><span>Lv.'+c.level+' · '+fmt(cardIncome(c))+'/s</span></div>'+
          '</div>';
        const img=slot.querySelector("img"); if(img) img.addEventListener("error",e=>e.currentTarget.style.display="none");
      }
      slot.addEventListener("click",()=>openStand(i));
      wrap.appendChild(slot);
    }
  }

  function renderOdds(){
    const odds=tierOdds();
    $("#luckTitle").textContent="Luck ×"+luckValue().toFixed(2)+" · ปลด Tier "+maxTierForLevel()+"/10";
    $("#odds").innerHTML=TIERS.map((t,i)=>
      '<div class="odd" style="--tier:'+t.color+';opacity:'+(odds[i]>0?1:.28)+'"><span>'+t.name+'</span><b>'+(odds[i]*100).toFixed(odds[i]*100<1?2:1)+'%</b></div>'
    ).join("");
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
    const card=createCardFromTier(pack.tier);
    showReveal(card);
    renderAll();
  }

  function createCardFromTier(tier){
    const charId=CARD_MIN_ID+Math.floor(Math.random()*(CARD_MAX_ID-CARD_MIN_ID+1));
    const card={uid:state.uidCounter++,gid:makeCardGid(),charId,tier,grade:0,level:1,locked:false,obtainedAt:Date.now()};
    state.cards.push(card);
    return card;
  }

  function renderCollection(){
    const q=$("#searchId").value.trim(),mode=$("#sortCards").value;
    let arr=[...state.cards];
    if(q) arr=arr.filter(c=>String(c.charId).includes(q));
    arr.sort((a,b)=>{
      if(mode==="tier")return b.tier-a.tier||b.level-a.level;
      if(mode==="level")return b.level-a.level||b.tier-a.tier;
      if(mode==="new")return b.uid-a.uid;
      return cardIncome(b)-cardIncome(a);
    });
    const wrap=$("#collection"); wrap.innerHTML="";
    $("#emptyCollection").style.display=arr.length?"none":"block";
    arr.forEach(c=>{
      const t=TIERS[c.tier],g=GRADES[c.grade],placed=state.placed.includes(c.uid);
      const el=document.createElement("article"); el.className="card-item tier-shell tier-"+c.tier+" grade-shell-"+c.grade;
      el.innerHTML=
        '<div class="card-art '+tierFxClass(c.tier)+' grade-shell-'+c.grade+'" style="'+tierStyle(c.tier)+'">'+
          '<img src="'+imageFor(c.charId)+'" alt="Character '+padId(c.charId)+'"><div class="tier-ring"></div>'+
          '<div class="card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div><div class="card-tier tier-label tier-'+c.tier+'">'+t.name+'</div><div class="card-id">'+padId(c.charId)+'</div>'+
        '</div>'+
        '<div class="card-body"><div class="card-stats">'+
          '<div><span>Level</span><b>'+c.level+'</b></div><div><span>รายได้</span><b class="'+wealthClass(cardIncome(c))+'">'+fmt(cardIncome(c))+'/s</b></div>'+
          '<div><span>อัป Lv.</span><b>'+fmt(upgradeCost(c))+'</b></div><div><span>สุ่ม Grade</span><b>'+fmt(rerollCost(c))+'</b></div>'+
        '</div><div class="card-actions">'+
          '<button data-a="place">'+(placed?"เอาออกจากฐาน":"วางในแท่นว่าง")+'</button><button data-a="level">อัป Level</button>'+
          '<button data-a="grade">สุ่ม Grade</button><button class="'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"grade-running":"")+'" data-a="grade-auto">'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"Auto Grade…":"Auto Grade")+'</button>'+
          '<button class="'+(c.locked?"locked":"")+'" data-a="lock">'+(c.locked?"🔒 ปลดล็อก":"🔓 ล็อก")+'</button>'+
          '<button class="sell" data-a="sell" '+((placed||c.locked)?"disabled":"")+'>ขาย '+fmt(sellValue(c))+'</button>'+
        '</div></div>';
      const img=el.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
      el.addEventListener("click",ev=>{
        const btn=ev.target.closest("button[data-a]");if(!btn)return;
        const a=btn.dataset.a;
        if(a==="place")togglePlace(c.uid);
        if(a==="level")levelUp(c.uid);
        if(a==="grade")rerollGrade(c.uid);
        if(a==="grade-auto")openGradeAuto(c.uid);
        if(a==="lock")toggleLock(c.uid);
        if(a==="sell")sellCard(c.uid);
      });
      wrap.appendChild(el);
    });
  }

  function renderRebirth(){
    if(state.baseLevel>=40){
      $("#rebirthHeadline").textContent="Lv.40 · MAX";
      $("#rebirthMoney").textContent="—";
      $("#rebirthRule").textContent="ถึงระดับสูงสุดของ V1 แล้ว";
      $("#rebirthTierGain").textContent="Eternal · โอกาสสูงสุดของ V1";
      const pace=$("#rebirthPace");if(pace)pace.textContent="—";
      $("#rebirthBtn").disabled=true;
      $("#nextTitle").textContent="MAX";
      $("#nextStands").textContent="30";
      $("#nextIncome").textContent="×"+baseIncomeMultiplier(40).toFixed(2);
      $("#nextLuck").textContent="×"+luckValue(40).toFixed(2);
      $("#nextTier").textContent=TIERS[maxTierForLevel(40)-1].name;
      return;
    }
    const next=state.baseLevel+1,cost=rebirthCost();
    const currentMax=maxTierForLevel(state.baseLevel);
    const nextMax=maxTierForLevel(next);
    const newlyUnlocked=nextMax>currentMax;
    const currentOdds=tierOdds(state.baseLevel);
    const nextOdds=tierOdds(next);
    const focusTier=nextMax-1;

    $("#rebirthHeadline").textContent="Lv."+state.baseLevel+" → Lv."+next;
    $("#rebirthHeadline").className=rankFxClass(next);
    $("#rebirthHeadline").style.cssText=rankFxStyle(next);
    $("#rebirthMoney").textContent=fmt(cost);
    $("#rebirthMoney").className=wealthClass(cost);
    $("#rebirthRule").textContent="ใช้เงินอย่างเดียว · ไม่มีเงื่อนไข Character ID / Card Level";
    $("#rebirthTierGain").textContent=newlyUnlocked
      ?"ปลด "+TIERS[focusTier].name+" · "+(nextOdds[focusTier]*100).toFixed(nextOdds[focusTier]*100<0.1?3:2)+"%"
      :TIERS[focusTier].name+" "+(currentOdds[focusTier]*100).toFixed(3)+"% → "+(nextOdds[focusTier]*100).toFixed(3)+"%";
    const pace=$("#rebirthPace");if(pace)pace.textContent="~"+formatDuration(rebirthTargetSeconds());
    $("#rebirthBtn").disabled=state.money<cost;
    $("#nextTitle").textContent=TITLES[next-1];
    $("#nextTitle").className=rankFxClass(next);
    $("#nextTitle").style.cssText=rankFxStyle(next);
    $("#nextStands").textContent=standLimit(next);
    $("#nextIncome").textContent="×"+baseIncomeMultiplier(next).toFixed(2);
    $("#nextLuck").textContent="×"+luckValue(next).toFixed(2);
    $("#nextTier").textContent=TIERS[nextMax-1].name;
  }

  function renderAll(){
    renderHeader();renderBase();renderPack();renderOdds();renderFilters();renderStoredPacks();renderCollection();renderRebirth();renderOnlineShell();save();
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
    $("#revealVisual").innerHTML='<div class="reveal-visual tier-shell tier-'+c.tier+' grade-shell-'+c.grade+'" style="--tier:'+t.color+'"><div class="reveal-art '+tierFxClass(c.tier)+'"><img src="'+imageFor(c.charId)+'" alt="Card '+padId(c.charId)+'"><div class="tier-ring"></div><div class="card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div></div><div class="reveal-info"><h2 class="tier-label tier-'+c.tier+'">'+t.name+'</h2><p>'+padId(c.charId)+' · Grade '+g.name+'</p></div></div>';
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
      '<div class="stand-detail"><div class="stand-detail-art '+tierFxClass(c.tier)+' grade-shell-'+c.grade+'" style="'+tierStyle(c.tier)+'"><img src="'+imageFor(c.charId)+'" alt="'+padId(c.charId)+'"><div class="tier-ring"></div><div class="card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div><div class="card-tier tier-label tier-'+c.tier+'">'+t.name+'</div><div class="card-id">'+padId(c.charId)+'</div></div>'+
      '<div class="stand-detail-info"><div><div class="eyebrow">INCOME</div><div class="big-income '+wealthClass(cardIncome(c))+'">'+fmt(cardIncome(c))+'/s</div></div>'+
      '<div class="card-stats"><div><span>Level</span><b>'+c.level+'</b></div><div><span>Grade</span><b>'+g.name+' ×'+g.multi.toFixed(2)+'</b></div><div><span>อัป Level</span><b>'+fmt(upgradeCost(c))+'</b></div><div><span>สุ่ม Grade</span><b>'+fmt(rerollCost(c))+'</b></div></div>'+
      '<div class="stand-actions"><button data-modal-a="level">อัป Level</button><button data-modal-a="grade">สุ่ม Grade</button><button class="'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"grade-running":"")+'" data-modal-a="grade-auto">'+(state.gradeAuto&&state.gradeAuto.uid===c.uid?"Auto Grade…":"Auto Grade")+'</button><button data-modal-a="change">เปลี่ยนการ์ด</button><button class="remove" data-modal-a="remove">ถอดจากแท่น</button></div></div></div>';
    const img=body.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
    body.querySelector('[data-modal-a="level"]').addEventListener("click",()=>{levelUp(c.uid,true)});
    body.querySelector('[data-modal-a="grade"]').addEventListener("click",()=>{rerollGrade(c.uid,true)});
    body.querySelector('[data-modal-a="grade-auto"]').addEventListener("click",()=>{openGradeAuto(c.uid)});
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
      btn.innerHTML='<div class="picker-art '+tierFxClass(c.tier)+' grade-shell-'+c.grade+'" style="'+tierStyle(c.tier)+'"><img src="'+imageFor(c.charId)+'" alt="'+padId(c.charId)+'"><div class="tier-ring"></div><div class="card-grade '+gradeFxClass(c.grade)+'" style="--grade:'+g.color+'">'+g.name+'</div></div><div class="picker-meta"><b class="tier-label tier-'+c.tier+'">'+padId(c.charId)+' · '+t.name+'</b><span>Lv.'+c.level+' · '+g.name+' · '+fmt(cardIncome(c))+'/s</span></div>';
      const img=btn.querySelector("img");if(img)img.addEventListener("error",e=>e.currentTarget.style.display="none");
      btn.addEventListener("click",()=>{state.placed[slot]=c.uid;toast("วาง "+padId(c.charId)+" ที่แท่น "+(slot+1));renderAll();renderStandModal()});
      grid.appendChild(btn);
    });
  }

  function togglePlace(uid){
    normalizeSlots();
    const existing=state.placed.indexOf(uid);
    if(existing>=0){state.placed[existing]=null;toast("นำการ์ดออกจากฐานแล้ว");renderAll();return}
    const empty=state.placed.findIndex(x=>!x);
    if(empty<0){toast("แท่นเต็มแล้ว");return}
    state.placed[empty]=uid;toast("วางการ์ดที่แท่น "+(empty+1));renderAll();
  }

  function levelUp(uid,fromModal=false){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
    const cost=upgradeCost(c);if(state.money<cost){toast("เงินไม่พอ");return}
    state.money-=cost;c.level++;toast("อัปเป็น Lv."+c.level);renderAll();if(fromModal)renderStandModal();
  }
  function rerollGrade(uid,fromModal=false){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
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
    renderAll();if(fromModal&&activeStand!==null)renderStandModal();
  }

  function openGradeAuto(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c)return;
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

    $("#gradeTargetList").innerHTML=GRADES.map((x,i)=>
      '<label class="grade-target-option grade-shell-'+i+'" style="--grade:'+x.color+'">'+
        '<input type="checkbox" data-grade-target="'+i+'" '+(activeTargets.includes(i)?'checked':'')+'>'+
        '<span>'+x.name+'</span>'+
      '</label>'
    ).join("");

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
    state.gradeAuto=null;
    clearTimeout(gradeTimer);
    toast(message);
    renderAll();
    if(activeStand!==null)renderStandModal();
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

    renderAll();
    if(activeStand!==null&&state.placed[activeStand]===c.uid)renderStandModal();

    if(state.gradeAuto){
      const delay=Math.max(20,Math.min(250,state.gradeAuto.nextAt-Date.now()));
      gradeTimer=setTimeout(processGradeAuto,delay);
    }
  }

  function toggleLock(uid){const c=state.cards.find(x=>x.uid===uid);if(!c)return;c.locked=!c.locked;renderAll()}
  function sellCard(uid){
    const c=state.cards.find(x=>x.uid===uid);if(!c||c.locked||state.placed.includes(uid))return;
    const value=sellValue(c);state.money+=value;state.cards=state.cards.filter(x=>x.uid!==uid);toast("ขายการ์ดแล้ว +"+fmt(value));renderAll();
  }

  function doRebirth(){
    if(state.baseLevel>=40)return;
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
      state.money+=totalIncome()*dt;
      state.lastTick=now;
    }
    return dt;
  }

  function economyTick(){
    if(accrueIncomeToNow()>0){
      renderHeader();renderRebirth();
      if(Math.random()<0.15)save();
    }
  }

  function bind(){
    $$(".tab").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".tab").forEach(x=>x.classList.remove("active"));$$(".panel").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");$("#panel-"+btn.dataset.tab).classList.add("active");
      if(btn.dataset.tab==="collection")renderCollection();
      if(btn.dataset.tab==="online")refreshOnline();
    }));
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
    });
    $("#rollBtn").addEventListener("click",manualRoll);$("#autoBtn").addEventListener("click",toggleAuto);$("#fullAutoBtn").addEventListener("click",toggleFullAuto);$("#packCard").addEventListener("click",openPack);
    $("#storedPacks").addEventListener("click",e=>{const b=e.target.closest("[data-open-stored-tier]");if(b)openStoredPack(Number(b.dataset.openStoredTier))});
    $("#closeGradeAutoModal").addEventListener("click",closeGradeAuto);$("[data-close-grade-auto]").addEventListener("click",closeGradeAuto);
    $("#startGradeAutoBtn").addEventListener("click",startGradeAuto);$("#stopGradeAutoBtn").addEventListener("click",()=>stopGradeAuto());
    $("#gradeSelectHighBtn").addEventListener("click",()=>{
      document.querySelectorAll('#gradeTargetList input[data-grade-target]').forEach(input=>{
        input.checked=Number(input.dataset.gradeTarget)>=4;
      });
    });
    $("#gradeClearTargetsBtn").addEventListener("click",()=>{
      document.querySelectorAll('#gradeTargetList input[data-grade-target]').forEach(input=>input.checked=false);
    });
    $("#closeReveal").addEventListener("click",closeReveal);$("#closeStandModal").addEventListener("click",closeStand);$("[data-close-modal]").addEventListener("click",closeStand);
    $("#searchId").addEventListener("input",renderCollection);$("#sortCards").addEventListener("change",renderCollection);$("#rebirthBtn").addEventListener("click",doRebirth);
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
      if(e.key==="Escape"){closeReveal();closeStand();closeAuth();closeSocialBase();closeGradeAuto()}
    });
    window.addEventListener("beforeunload",save);
  }

  function init(){
    normalizeSlots();bind();
    const now=Date.now(),offlineSeconds=Math.max(0,(now-(state.lastTick||now))/1000);
    if(offlineSeconds>2&&state.placed.some(Boolean)){const gain=totalIncome()*offlineSeconds;state.money+=gain;toast("รับรายได้ออฟไลน์ "+fmt(gain))}
    state.lastTick=now;renderAll();updateRollProgress();
    if((state.autoRolling||state.fullAuto)&&packAutoSessionActive()){
      if(!state.rollingUntil)state.rollingUntil=Date.now()+ROLL_MS;
      processRollEngine();
    }else{
      state.rollingUntil=0;
      setPackAutoSession(false);
    }
    setInterval(economyTick,1000);
    onlineHeartbeatTimer=setInterval(()=>{if(document.visibilityState==="visible"&&gameToken)heartbeatOnline()},45000);
    const catchUpActiveSystems=()=>{
      accrueIncomeToNow();
      if(state.rollingUntil)processRollEngine();
      if(state.gradeAuto)processGradeAuto();
      renderHeader();renderRebirth();
      if(gameToken){heartbeatOnline();flushCloudSave()}
    };
    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="hidden"){
        if(state.autoRolling||state.fullAuto)setPackAutoSession(true);
        save();
      }else{
        catchUpActiveSystems();
      }
    });
    window.addEventListener("focus",catchUpActiveSystems);
    initCloud();
  }

  init();
})();
